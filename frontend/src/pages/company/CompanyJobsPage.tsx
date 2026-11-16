// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Every job posting of the company with its review status, and the
//      way in to create one, edit one or see who applied.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { Pencil, Users } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

import { CompanyStatusBanner } from "@/components/jobs/CompanyStatusBanner.tsx"
import { ApprovalStatusBadge } from "@/components/jobs/StatusBadge.tsx"
import { PageHeader } from "@/components/layout/PageHeader.tsx"
import { Alert } from "@/components/ui/Alert.tsx"
import { Badge } from "@/components/ui/Badge.tsx"
import { buttonClasses } from "@/components/ui/buttonClasses.ts"
import { Card } from "@/components/ui/Card.tsx"
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States.tsx"
import { useAsyncData } from "@/hooks/useAsyncData.ts"
import { formatDate } from "@/lib/dates.ts"
import { byNewest, getJobSummary, isExpired } from "@/lib/jobs.ts"
import { getMyCompany } from "@/services/companyService.ts"
import { getMyCompanyJobPostings } from "@/services/jobPostingService.ts"
import type { JobPosting } from "@/types/models.ts"

function CompanyJobRow( { job }: { job: JobPosting } ) {
    const approved = job.approvalStatus === "approved"

    return (
        <Card className="flex flex-col gap-3 px-[18px] py-4 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-[14.5px] font-bold text-foreground">{ job.title }</h2>
                    <ApprovalStatusBadge status={ job.approvalStatus } />
                    { approved && isExpired( job ) && <Badge>Cerrada</Badge> }
                </div>
                <p className="text-[12.5px] text-muted-foreground">{ getJobSummary( job ) }</p>
                <p className="text-[12.5px] text-muted-foreground">
                    Publicada el { formatDate( job.publicationDate ) } · Cierra el { formatDate( job.expirationDate ) }
                </p>
                { job.approvalStatus === "rejected" && (
                    <p className="text-[12.5px] font-medium text-danger">
                        Motivo del rechazo: { job.rejectionReason ?? "no indicado" }. Edítala para enviarla de nuevo a revisión.
                    </p>
                ) }
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
                { approved && (
                    <Link to={ `/company/jobs/${ job.id }/applicants` } className={ buttonClasses( { variant: "secondary", size: "sm" } ) }>
                        <Users aria-hidden className="size-3.5" />
                        Aplicantes
                    </Link>
                ) }
                <Link
                    to={ `/company/jobs/${ job.id }/edit` }
                    className={ buttonClasses( { variant: "secondary", size: "sm" } ) }
                    // Several rows have an "Editar" link: name each one.
                    aria-label={ `Editar ${ job.title }` }
                >
                    <Pencil aria-hidden className="size-3.5" />
                    Editar
                </Link>
            </div>
        </Card>
    )
}

function CompanyJobsPage() {
    const location = useLocation()
    // Message left by the form after creating or editing a posting.
    const notice = ( location.state as { notice?: string } | null )?.notice

    const { data, error, isLoading, reload } = useAsyncData( "company-jobs", async () => {
        const [ company, jobs ] = await Promise.all( [ getMyCompany(), getMyCompanyJobPostings() ] )
        return { company, jobs }
    } )

    const jobs = [ ...( data?.jobs ?? [] ) ].sort( byNewest )
    const canPublish = data?.company.approvalStatus === "approved"

    return (
        <>
            <PageHeader
                title="Mis vacantes"
                subtitle="Crea vacantes y revisa quién se postuló"
                actions={ canPublish && <Link to="/company/jobs/new" className={ buttonClasses() }>Nueva vacante</Link> }
            />

            { notice && <Alert tone="success">{ notice }</Alert> }
            { data && <CompanyStatusBanner company={ data.company } /> }

            { isLoading && !data && <LoadingState label="Cargando vacantes" /> }
            { error && <ErrorState message={ error.message } onRetry={ reload } /> }

            { data && jobs.length === 0 && (
                <EmptyState
                    title="Aún no tienes vacantes"
                    description={
                        canPublish
                            ? "Publica tu primera vacante. Un administrador la revisa antes de que los candidatos la vean."
                            : "Podrás publicar vacantes cuando un administrador apruebe tu empresa."
                    }
                    action={ canPublish && <Link to="/company/jobs/new" className={ buttonClasses( { size: "sm" } ) }>Publicar una vacante</Link> }
                />
            ) }

            { jobs.length > 0 && (
                <div className="flex flex-col gap-2.5">
                    { jobs.map( ( job ) => <CompanyJobRow key={ job.id } job={ job } /> ) }
                </div>
            ) }
        </>
    )
}

export { CompanyJobsPage }
