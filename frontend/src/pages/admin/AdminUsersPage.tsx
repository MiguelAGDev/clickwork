// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Every account of the platform, with filters by role and by state,
//      and the switch to deactivate or reactivate an account.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { useState } from "react"
import { useSearchParams } from "react-router-dom"

import { PageHeader } from "@/components/layout/PageHeader.tsx"
import { Badge } from "@/components/ui/Badge.tsx"
import { Button } from "@/components/ui/Button.tsx"
import { Card } from "@/components/ui/Card.tsx"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog.tsx"
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States.tsx"
import { useAsyncData } from "@/hooks/useAsyncData.ts"
import { useAuth } from "@/hooks/useAuth.ts"
import { ROLE_LABELS } from "@/lib/roles.ts"
import { getUsers, toggleUserActive } from "@/services/adminService.ts"
import { toApiError } from "@/services/api.ts"
import type { AdminUser, Role } from "@/types/models.ts"

const selectClasses = "h-10 rounded-[10px] border-2 border-input bg-card px-3 text-sm text-foreground"

type StateFilter = "" | "active" | "inactive"

// The line under the email: what else is known about the account.
function describeUser( user: AdminUser ): string {
    if( user.role === "company" ) return user.companyName ?? "Empresa sin datos"
    if( user.role === "admin" ) return "Administración"
    return user.careerName ?? "Sin carrera registrada"
}

interface UserRowProps {
    user: AdminUser
    isSelf: boolean
    onToggle: ( user: AdminUser ) => void
}

function UserRow( { user, isSelf, onToggle }: UserRowProps ) {
    return (
        <Card className="flex flex-col gap-3 px-[18px] py-3.5 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-[14.5px] font-bold break-all text-foreground">{ user.email }</h2>
                    <Badge tone="info">{ ROLE_LABELS[ user.role ] }</Badge>
                    <Badge tone={ user.active ? "success" : "danger" }>{ user.active ? "Activa" : "Inactiva" }</Badge>
                    { !user.emailVerified && <Badge tone="warning">Correo sin verificar</Badge> }
                </div>
                <p className="text-[12.5px] text-muted-foreground">
                    { describeUser( user ) }{ user.phone && ` · ${ user.phone }` }
                </p>
            </div>

            { isSelf ? (
                // An admin that deactivates its own account locks itself
                // out for good, so the button is not offered at all.
                <span className="shrink-0 text-[12.5px] text-muted-foreground">Tu cuenta</span>
            ) : (
                <Button
                    size="sm"
                    variant="secondary"
                    className="shrink-0"
                    onClick={ () => onToggle( user ) }
                    aria-label={ `${ user.active ? "Desactivar" : "Reactivar" } ${ user.email }` }
                >
                    { user.active ? "Desactivar" : "Reactivar" }
                </Button>
            ) }
        </Card>
    )
}

function AdminUsersPage() {
    const { user: me } = useAuth()
    const [ params, setParams ] = useSearchParams()
    const { data, error, isLoading, reload } = useAsyncData( "admin-users", getUsers )

    // The account the confirmation dialog is asking about (null = closed).
    const [ target, setTarget ] = useState<AdminUser | null>( null )
    const [ working, setWorking ] = useState( false )
    const [ actionError, setActionError ] = useState<string | null>( null )

    const search = params.get( "q" ) ?? ""
    const role = ( params.get( "role" ) ?? "" ) as Role | ""
    const state = ( params.get( "state" ) ?? "" ) as StateFilter

    function setParam( name: string, value: string ) {
        setParams( ( current ) => {
            const next = new URLSearchParams( current )
            if( value ) next.set( name, value )
            else next.delete( name )
            return next
        }, { replace: true } )
    }

    function closeDialog() {
        setTarget( null )
        setActionError( null )
    }

    async function handleConfirm() {
        if( !target ) return

        setWorking( true )
        setActionError( null )

        try {
            await toggleUserActive( target.id )
            closeDialog()
            reload()
        } catch( caught ) {
            setActionError( toApiError( caught ).message )
        } finally {
            setWorking( false )
        }
    }

    // The list comes whole from the backend; the filters run here.
    const query = search.trim().toLowerCase()
    const users = ( data ?? [] )
        .filter( ( user ) => !role || user.role === role )
        .filter( ( user ) => !state || ( state === "active" ) === user.active )
        .filter( ( user ) => !query || user.email.toLowerCase().includes( query ) || ( user.companyName ?? "" ).toLowerCase().includes( query ) )

    const hasFilters = Boolean( search || role || state )

    return (
        <>
            <PageHeader title="Usuarios" subtitle="Consulta las cuentas y activa o desactiva su acceso" />

            <section aria-label="Filtros" className="flex flex-wrap items-center gap-2.5 rounded-xl border border-border bg-card p-4">
                <input
                    type="search"
                    aria-label="Buscar por correo o empresa"
                    placeholder="Busca por correo o empresa"
                    value={ search }
                    onChange={ ( event ) => setParam( "q", event.target.value ) }
                    className="h-10 min-w-0 flex-1 basis-56 rounded-[10px] border-2 border-input bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground/70"
                />
                <select aria-label="Tipo de cuenta" className={ selectClasses } value={ role } onChange={ ( event ) => setParam( "role", event.target.value ) }>
                    <option value="">Tipo: todos</option>
                    { Object.entries( ROLE_LABELS ).map( ( [ value, label ] ) => <option key={ value } value={ value }>{ label }</option> ) }
                </select>
                <select aria-label="Estado de la cuenta" className={ selectClasses } value={ state } onChange={ ( event ) => setParam( "state", event.target.value ) }>
                    <option value="">Estado: todas</option>
                    <option value="active">Activas</option>
                    <option value="inactive">Inactivas</option>
                </select>
            </section>

            { isLoading && !data && <LoadingState label="Cargando usuarios" /> }
            { error && <ErrorState message={ error.message } onRetry={ reload } /> }

            { data && (
                <section aria-label="Resultados" className="flex flex-col gap-3">
                    <p aria-live="polite" className="text-[13px] text-muted-foreground">
                        { users.length === 1 ? "1 cuenta" : `${ users.length } cuentas` }
                        { hasFilters && ` de ${ data.length }` }
                    </p>

                    { users.length === 0 ? (
                        <EmptyState
                            title="Ninguna cuenta coincide"
                            description="Prueba con otra búsqueda o quita algún filtro."
                            action={ <Button variant="secondary" size="sm" onClick={ () => setParams( {}, { replace: true } ) }>Limpiar filtros</Button> }
                        />
                    ) : (
                        <div className="flex flex-col gap-2.5">
                            { users.map( ( user ) => (
                                <UserRow key={ user.id } user={ user } isSelf={ user.id === me?.id } onToggle={ setTarget } />
                            ) ) }
                        </div>
                    ) }
                </section>
            ) }

            <ConfirmDialog
                open={ target !== null }
                onClose={ closeDialog }
                title={ target?.active ? "¿Desactivar esta cuenta?" : "¿Reactivar esta cuenta?" }
                description={
                    target?.active
                        ? <><strong>{ target.email }</strong> no podrá iniciar sesión ni usar ClickWork hasta que la reactives.</>
                        : <><strong>{ target?.email }</strong> podrá volver a iniciar sesión.</>
                }
                confirmLabel={ target?.active ? "Desactivar" : "Reactivar" }
                tone={ target?.active ? "danger" : "primary" }
                loading={ working }
                error={ actionError }
                onConfirm={ handleConfirm }
            />
        </>
    )
}

export { AdminUsersPage }
