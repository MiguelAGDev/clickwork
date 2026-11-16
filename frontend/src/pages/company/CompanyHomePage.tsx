// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Home of a company: where its registration stands, three numbers
//      about its job postings and its most recent postings.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { CircleCheck, Clock, Users } from "lucide-react"
import { Link } from "react-router-dom"

import { CompanyStatusBanner } from "@/components/jobs/CompanyStatusBanner.tsx"
import { JobCard } from "@/components/jobs/JobCard.tsx"
import { StatCard, StatGrid } from "@/components/jobs/StatCard.tsx"
import { ApprovalStatusBadge } from "@/components/jobs/StatusBadge.tsx"
import { PageHeader } from "@/components/layout/PageHeader.tsx"
import { buttonClasses } from "@/components/ui/buttonClasses.ts"
import { linkClasses } from "@/components/ui/linkClasses.ts"
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States.tsx"
import { useAsyncData } from "@/hooks/useAsyncData.ts"
import { getDisplayName } from "@/lib/displayName.ts"
import { byNewest, isExpired } from "@/lib/jobs.ts"
import { getApplicants } from "@/services/applicationService.ts"
import { getMyCompany } from "@/services/companyService.ts"
import { getMyCompanyJobPostings } from "@/services/jobPostingService.ts"
import type { JobPosting, User } from "@/types/models.ts"

// How many people applied across the given postings. There is no endpoint
// with the total, so it asks once per posting, all at the same time. If
// any of them fails the total is unknown (null) instead of a wrong number.
async function countApplicants( jobs: JobPosting[] ): Promise<number | null> {
    const results = await Promise.allSettled( jobs.map( ( job ) => getApplicants( job.id ) ) )

    if( results.some( ( result ) => result.status === "rejected" ) ) return null

    return results.reduce( ( total, result ) => total + ( result.status === "fulfilled" ? result.value.length : 0 ), 0 )
}

function CompanyHomePage( { user }: { user: User } ) {
    const { data, error, isLoading, reload } = useAsyncData( "company-home", async () => {
        const [ company, jobs ] = await Promise.all( [ getMyCompany(), getMyCompanyJobPostings() ] )
        // Only approved postings can have applicants.
        const applicants = await countApplicants( jobs.filter( ( job ) => job.approvalStatus === "approved" ) )

        return { company, jobs, applicants }
    } )

    const published = data?.jobs.filter( ( job ) => job.approvalStatus === "approved" && !isExpired( job ) ).length
    const inReview = data?.jobs.filter( ( job ) => job.approvalStatus === "pending" ).length
    const recent = [ ...( data?.jobs ?? [] ) ].sort( byNewest ).slice( 0, 5 )
    const canPublish = data?.company.approvalStatus === "approved"

    return (
        <>
            <PageHeader
                // The company name once it loads; the email-based name meanwhile.
                title={ `Hola, ${ data?.company.name ?? getDisplayName( user ) }` }
                subtitle="Aquí tienes un resumen de tus vacantes"
                actions={ canPublish && <Link to="/company/jobs/new" className={ buttonClasses() }>Nueva vacante</Link> }
            />

            { data && <CompanyStatusBanner company={ data.company } /> }

            <StatGrid>
                <StatCard icon={ CircleCheck } value={ published ?? "—" } label="Vacantes publicadas" to="/company/jobs" />
                <StatCard icon={ Clock } value={ inReview ?? "—" } label="Vacantes en revisión" to="/company/jobs" />
                <StatCard icon={ Users } value={ data?.applicants ?? "—" } label="Postulaciones recibidas" />
            </StatGrid>

            <section aria-labelledby="recent-title" className="flex flex-col gap-3.5">
                <div className="flex items-baseline justify-between gap-4">
                    <h2 id="recent-title" className="text-base font-bold text-foreground">Tus vacantes recientes</h2>
                    <Link to="/company/jobs" className={ `${ linkClasses } text-[13px]` }>Ver todas</Link>
                </div>

                { isLoading && !data && <LoadingState label="Cargando vacantes" /> }
                { error && <ErrorState message={ error.message } onRetry={ reload } /> }

                { data && recent.length === 0 && (
                    <EmptyState
                        title="Aún no tienes vacantes"
                        description={
                            canPublish
                                ? "Publica tu primera vacante para empezar a recibir postulaciones."
                                : "Podrás publicar vacantes cuando un administrador apruebe tu empresa."
                        }
                        action={ canPublish && <Link to="/company/jobs/new" className={ buttonClasses( { size: "sm" } ) }>Publicar una vacante</Link> }
                    />
                ) }

                { recent.length > 0 && (
                    <div className="flex flex-col gap-2.5">
                        { recent.map( ( job ) => (
                            <JobCard
                                key={ job.id }
                                job={ job }
                                // An approved posting leads to its applicants;
                                // any other one, to the form to fix it.
                                to={ job.approvalStatus === "approved" ? `/company/jobs/${ job.id }/applicants` : `/company/jobs/${ job.id }/edit` }
                                trailing={ <ApprovalStatusBadge status={ job.approvalStatus } /> }
                            />
                        ) ) }
                    </div>
                ) }
            </section>
        </>
    )
}

export { CompanyHomePage }
