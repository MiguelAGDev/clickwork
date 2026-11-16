// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Profile of a company: its public data, the password of the
//      account and the option to deactivate the account.
//
// Date: November 16th 2026

// Latest Update: "Deactivate account" becomes "pause company": the
//      backend now flips a company flag, so the account keeps working.
// Date: November 16th 2026
// By: Miguel Angel Avila Garcia

import { useState } from "react"
import { useForm } from "react-hook-form"

import { ChangePasswordForm } from "@/components/account/ChangePasswordForm.tsx"
import { CompanyStatusBanner } from "@/components/jobs/CompanyStatusBanner.tsx"
import { ApprovalStatusBadge } from "@/components/jobs/StatusBadge.tsx"
import { PageHeader } from "@/components/layout/PageHeader.tsx"
import { Alert } from "@/components/ui/Alert.tsx"
import { Button } from "@/components/ui/Button.tsx"
import { SectionCard } from "@/components/ui/Card.tsx"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog.tsx"
import { SelectField, TextField } from "@/components/ui/Field.tsx"
import { ErrorState, LoadingState } from "@/components/ui/States.tsx"
import { useAsyncData } from "@/hooks/useAsyncData.ts"
import { COMPANY_SIZE_LABELS } from "@/lib/labels.ts"
import { applyFieldErrors, emailRules, REQUIRED } from "@/lib/validation.ts"
import { toApiError } from "@/services/api.ts"
import { getMyCompany, toggleMyCompanyActive, updateMyCompany } from "@/services/companyService.ts"
import type { Company, CompanySize } from "@/types/models.ts"

// Names are the ones PUT /company/me validates (cmp_ prefix).
interface CompanyFormValues {
    cmp_name: string
    cmp_size: CompanySize
    cmp_industry: string
    cmp_city: string
    cmp_state: string
    cmp_address: string
    cmp_contact_email: string
}

const FIELD_NAMES = [
    "cmp_name", "cmp_size", "cmp_industry", "cmp_city", "cmp_state", "cmp_address", "cmp_contact_email",
] as const satisfies readonly ( keyof CompanyFormValues )[]

function toFormValues( company: Company ): CompanyFormValues {
    return {
        cmp_name: company.name,
        cmp_size: company.size,
        cmp_industry: company.industry,
        cmp_city: company.city ?? "",
        cmp_state: company.state ?? "",
        cmp_address: company.address ?? "",
        cmp_contact_email: company.contactEmail ?? "",
    }
}

function CompanyForm( { company, onSaved }: { company: Company, onSaved: ( company: Company ) => void } ) {
    const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting, isDirty } } = useForm<CompanyFormValues>( {
        defaultValues: toFormValues( company ),
    } )
    const [ serverError, setServerError ] = useState<string | null>( null )
    const [ saved, setSaved ] = useState( false )

    async function onSubmit( form: CompanyFormValues ) {
        setServerError( null )
        setSaved( false )

        try {
            const updated = await updateMyCompany( {
                name: form.cmp_name.trim(),
                size: form.cmp_size,
                industry: form.cmp_industry.trim(),
                city: form.cmp_city.trim(),
                state: form.cmp_state.trim(),
                address: form.cmp_address.trim(),
                contactEmail: form.cmp_contact_email.trim(),
            } )

            onSaved( updated )
            reset( toFormValues( updated ) )
            setSaved( true )
        } catch( error ) {
            const { apiError, handled } = applyFieldErrors( error, setError, FIELD_NAMES )
            if( !handled ) setServerError( apiError.message )
        }
    }

    return (
        <SectionCard title="Datos de la empresa" description="Son los datos que revisa el administrador. Todos son obligatorios para guardar.">
            { saved && <Alert tone="success">Guardamos los datos de tu empresa.</Alert> }
            { serverError && <Alert tone="error">{ serverError }</Alert> }

            <form onSubmit={ handleSubmit( onSubmit ) } noValidate className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <TextField
                        label="Nombre de la empresa"
                        autoComplete="organization"
                        error={ errors.cmp_name?.message }
                        { ...register( "cmp_name", { required: REQUIRED, maxLength: { value: 100, message: "Máximo 100 caracteres." } } ) }
                    />
                    <TextField label="Giro" error={ errors.cmp_industry?.message } { ...register( "cmp_industry", { required: REQUIRED } ) } />

                    <SelectField label="Tamaño" error={ errors.cmp_size?.message } { ...register( "cmp_size", { required: REQUIRED } ) }>
                        { Object.entries( COMPANY_SIZE_LABELS ).map( ( [ value, label ] ) => <option key={ value } value={ value }>{ label }</option> ) }
                    </SelectField>
                    <TextField
                        label="Correo de contacto"
                        type="email"
                        hint="A este correo llegan los CV de quienes se postulan."
                        error={ errors.cmp_contact_email?.message }
                        { ...register( "cmp_contact_email", { ...emailRules, required: "Escribe un correo de contacto." } ) }
                    />

                    <TextField label="Ciudad" autoComplete="address-level2" error={ errors.cmp_city?.message } { ...register( "cmp_city", { required: REQUIRED } ) } />
                    <TextField label="Estado" autoComplete="address-level1" error={ errors.cmp_state?.message } { ...register( "cmp_state", { required: REQUIRED } ) } />
                    <TextField
                        label="Dirección"
                        autoComplete="street-address"
                        wrapperClassName="sm:col-span-2"
                        error={ errors.cmp_address?.message }
                        { ...register( "cmp_address", { required: REQUIRED } ) }
                    />
                </div>

                <div>
                    <Button type="submit" loading={ isSubmitting } disabled={ !isDirty }>Guardar cambios</Button>
                </div>
            </form>
        </SectionCard>
    )
}

function PauseSection( { company, onChange }: { company: Company, onChange: ( company: Company ) => void } ) {
    const [ open, setOpen ] = useState( false )
    const [ working, setWorking ] = useState( false )
    const [ error, setError ] = useState<string | null>( null )

    async function handleConfirm() {
        setWorking( true )
        setError( null )

        try {
            const active = await toggleMyCompanyActive()
            onChange( { ...company, active } )
            setOpen( false )
        } catch( caught ) {
            setError( toApiError( caught ).message )
        } finally {
            setWorking( false )
        }
    }

    if( !company.active ) {
        return (
            <SectionCard title="Empresa en pausa" description="Tus vacantes no se muestran a los candidatos mientras la empresa esté en pausa.">
                <div>
                    <Button loading={ working } onClick={ handleConfirm }>Reanudar empresa</Button>
                </div>
                { error && <Alert tone="error">{ error }</Alert> }
            </SectionCard>
        )
    }

    return (
        <SectionCard title="Pausar empresa" description="Oculta tus vacantes a los candidatos sin perder tu cuenta ni tus datos.">
            <div>
                <Button variant="danger" onClick={ () => setOpen( true ) }>Pausar empresa</Button>
            </div>

            <ConfirmDialog
                open={ open }
                onClose={ () => setOpen( false ) }
                title="¿Pausar tu empresa?"
                description={
                    <>
                        Tus vacantes dejarán de aparecer en el listado y nadie podrá postularse a ellas. Tu cuenta
                        sigue activa: puedes reanudar la empresa cuando quieras desde esta misma pantalla.
                    </>
                }
                confirmLabel="Sí, pausar"
                tone="danger"
                loading={ working }
                error={ error }
                onConfirm={ handleConfirm }
            />
        </SectionCard>
    )
}

function CompanyProfilePage() {
    const { data: company, error, isLoading, reload, setData } = useAsyncData( "my-company", getMyCompany )

    return (
        <>
            <PageHeader
                title="Perfil de la empresa"
                subtitle={
                    company && (
                        <span className="flex items-center gap-2">
                            Estado del registro <ApprovalStatusBadge status={ company.approvalStatus } />
                        </span>
                    )
                }
            />

            { isLoading && !company && <LoadingState /> }
            { error && <ErrorState message={ error.message } onRetry={ reload } /> }

            { company && (
                <>
                    <CompanyStatusBanner company={ company } />
                    <CompanyForm company={ company } onSaved={ setData } />
                </>
            ) }

            <ChangePasswordForm />

            { company && <PauseSection company={ company } onChange={ setData } /> }
        </>
    )
}

export { CompanyProfilePage }
