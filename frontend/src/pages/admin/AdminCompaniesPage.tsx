// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Where the admin reviews companies: the queue of pending ones and
//      the full list, with approve and reject on each row.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { useSearchParams } from "react-router-dom"

import { ReviewActions } from "@/components/admin/ReviewActions.tsx"
import { ApprovalStatusBadge } from "@/components/jobs/StatusBadge.tsx"
import { PageHeader } from "@/components/layout/PageHeader.tsx"
import { Card } from "@/components/ui/Card.tsx"
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States.tsx"
import { Tabs } from "@/components/ui/Tabs.tsx"
import { useAsyncData } from "@/hooks/useAsyncData.ts"
import { COMPANY_SIZE_LABELS } from "@/lib/labels.ts"
import { getCompanies, setCompanyApproval } from "@/services/adminService.ts"
import type { ApprovalStatus, Company } from "@/types/models.ts"

interface CompanyRowProps {
    company: Company
    onDecide: ( company: Company, status: ApprovalStatus, reason?: string ) => Promise<void>
}

function CompanyRow( { company, onDecide }: CompanyRowProps ) {
    const location = [ company.address, company.city, company.state ].filter( Boolean ).join( ", " )

    return (
        <Card className="flex flex-col gap-3 px-[18px] py-4 sm:flex-row sm:items-start sm:gap-4">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-[14.5px] font-bold text-foreground">{ company.name }</h2>
                    <ApprovalStatusBadge status={ company.approvalStatus } />
                </div>
                <p className="text-[12.5px] text-muted-foreground">
                    { company.industry } · Empresa { COMPANY_SIZE_LABELS[ company.size ].toLowerCase() }
                </p>
                <p className="text-[12.5px] text-muted-foreground">{ location || "Sin dirección registrada" }</p>
                <p className="text-[12.5px] text-muted-foreground">
                    { company.contactEmail ? `Contacto: ${ company.contactEmail }` : "Sin correo de contacto" }
                </p>
                { company.approvalStatus === "rejected" && (
                    <p className="text-[12.5px] font-medium text-danger">Motivo del rechazo: { company.rejectionReason ?? "no indicado" }</p>
                ) }
            </div>

            <ReviewActions
                subject={ company.name }
                status={ company.approvalStatus }
                onDecide={ ( status, reason ) => onDecide( company, status, reason ) }
            />
        </Card>
    )
}

function AdminCompaniesPage() {
    const [ params ] = useSearchParams()
    const showAll = params.get( "view" ) === "all"

    // One request for both tabs: the full list already contains the
    // pending ones, and the tab counter needs them anyway.
    const { data, error, isLoading, reload } = useAsyncData( "admin-companies", getCompanies )

    async function handleDecide( company: Company, status: ApprovalStatus, reason?: string ) {
        await setCompanyApproval( company.id, status, reason )
        // Read the list again: the row changes status and, in the pending
        // tab, leaves the queue.
        reload()
    }

    const pending = data?.filter( ( company ) => company.approvalStatus === "pending" ) ?? []
    const companies = showAll ? ( data ?? [] ) : pending

    return (
        <>
            <PageHeader title="Empresas" subtitle="Aprueba a las empresas antes de que puedan publicar vacantes" />

            <Tabs
                label="Vistas de empresas"
                items={ [
                    { label: "Pendientes", to: "/admin/companies", active: !showAll, count: data ? pending.length : undefined },
                    { label: "Todas", to: "/admin/companies?view=all", active: showAll, count: data?.length },
                ] }
            />

            { isLoading && !data && <LoadingState label="Cargando empresas" /> }
            { error && <ErrorState message={ error.message } onRetry={ reload } /> }

            { data && companies.length === 0 && (
                <EmptyState
                    title={ showAll ? "Aún no hay empresas registradas" : "No hay empresas por revisar" }
                    description={ showAll ? undefined : "Cuando una empresa se registre, aparecerá aquí para que la revises." }
                />
            ) }

            { companies.length > 0 && (
                <div className="flex flex-col gap-2.5">
                    { companies.map( ( company ) => <CompanyRow key={ company.id } company={ company } onDecide={ handleDecide } /> ) }
                </div>
            ) }
        </>
    )
}

export { AdminCompaniesPage }
