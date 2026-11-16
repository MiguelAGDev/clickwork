// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Where the admin reviews job postings: every posting waiting for
//      approval, with its full detail, and approve / reject on each.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { ReviewActions } from "@/components/admin/ReviewActions.tsx"
import { PageHeader } from "@/components/layout/PageHeader.tsx"
import { Card } from "@/components/ui/Card.tsx"
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States.tsx"
import { useAsyncData } from "@/hooks/useAsyncData.ts"
import { formatDate } from "@/lib/dates.ts"
import { getJobSummary } from "@/lib/jobs.ts"
import { getCompanies, getPendingJobPostings, setJobPostingApproval } from "@/services/adminService.ts"
import type { ApprovalStatus, Company, JobPosting } from "@/types/models.ts"

interface JobReviewRowProps {
    job: JobPosting
    company: Company | undefined
    onDecide: ( job: JobPosting, status: ApprovalStatus, reason?: string ) => Promise<void>
}

function JobReviewRow( { job, company, onDecide }: JobReviewRowProps ) {
    return (
        <Card className="flex flex-col gap-3 px-[18px] py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <h2 className="text-[14.5px] font-bold text-foreground">{ job.title }</h2>
                    <p className="text-[12.5px] text-muted-foreground">
                        { company ? company.name : `Empresa #${ job.companyId }` } · { getJobSummary( job ) }
                    </p>
                    <p className="text-[12.5px] text-muted-foreground">
                        Enviada el { formatDate( job.publicationDate ) } · Cierra el { formatDate( job.expirationDate ) || "sin fecha" }
                    </p>
                </div>

                <ReviewActions
                    subject={ job.title }
                    status={ job.approvalStatus }
                    onDecide={ ( status, reason ) => onDecide( job, status, reason ) }
                />
            </div>

            {/* <details> is the native "show more": it works with the
                keyboard and screen readers without any JavaScript. */}
            <details className="group rounded-[10px] bg-muted px-3.5 py-2.5">
                <summary className="cursor-pointer text-[13px] font-semibold text-foreground">
                    Ver detalle<span className="sr-only"> de { job.title }</span>
                </summary>
                <dl className="mt-3 flex flex-col gap-3 text-sm">
                    <div>
                        <dt className="text-[12.5px] text-muted-foreground">Horario</dt>
                        <dd className="text-foreground">{ job.schedule ?? "No especificado" }</dd>
                    </div>
                    <div>
                        <dt className="text-[12.5px] text-muted-foreground">Requisitos</dt>
                        <dd className="whitespace-pre-line text-foreground">{ job.requirements ?? "No especificados" }</dd>
                    </div>
                    <div>
                        <dt className="text-[12.5px] text-muted-foreground">Beneficios</dt>
                        <dd className="whitespace-pre-line text-foreground">{ job.benefits ?? "No especificados" }</dd>
                    </div>
                </dl>
            </details>
        </Card>
    )
}

function AdminJobsPage() {
    const { data, error, isLoading, reload } = useAsyncData( "admin-jobs", async () => {
        const [ jobs, companies ] = await Promise.all( [
            getPendingJobPostings(),
            // Only used to show the company name instead of its id, so the
            // review still works if this list fails.
            getCompanies().catch( (): Company[] => [] ),
        ] )

        return { jobs, companies: new Map( companies.map( ( company ) => [ company.id, company ] ) ) }
    } )

    async function handleDecide( job: JobPosting, status: ApprovalStatus, reason?: string ) {
        await setJobPostingApproval( job.id, status, reason )
        reload()    // The reviewed posting leaves the pending queue.
    }

    return (
        <>
            <PageHeader
                title="Vacantes"
                subtitle={
                    data
                        ? ( data.jobs.length === 1 ? "1 vacante espera revisión" : `${ data.jobs.length } vacantes esperan revisión` )
                        : "Revisa las vacantes antes de que los candidatos las vean"
                }
            />

            { isLoading && !data && <LoadingState label="Cargando vacantes" /> }
            { error && <ErrorState message={ error.message } onRetry={ reload } /> }

            { data && data.jobs.length === 0 && (
                <EmptyState
                    title="No hay vacantes por revisar"
                    description="Cuando una empresa cree o edite una vacante, aparecerá aquí."
                />
            ) }

            { data && data.jobs.length > 0 && (
                <div className="flex flex-col gap-2.5">
                    { data.jobs.map( ( job ) => (
                        <JobReviewRow key={ job.id } job={ job } company={ data.companies.get( job.companyId ) } onDecide={ handleDecide } />
                    ) ) }
                </div>
            ) }
        </>
    )
}

export { AdminJobsPage }
