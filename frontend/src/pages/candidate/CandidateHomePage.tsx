// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Home of a candidate (design "Opción A"): greeting, three numbers
//      about its activity and a short list of recommended job postings.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { Bookmark, Briefcase, Clock } from "lucide-react"
import { Link } from "react-router-dom"

import { JobCard } from "@/components/jobs/JobCard.tsx"
import { StatCard, StatGrid } from "@/components/jobs/StatCard.tsx"
import { PageHeader } from "@/components/layout/PageHeader.tsx"
import { buttonClasses } from "@/components/ui/buttonClasses.ts"
import { linkClasses } from "@/components/ui/linkClasses.ts"
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States.tsx"
import { useAsyncData } from "@/hooks/useAsyncData.ts"
import { useSavedJobs } from "@/hooks/useSavedJobs.ts"
import { getDisplayName } from "@/lib/displayName.ts"
import { getProfileCompletion, getRecommendedJobs, isActiveApplication, isExpired } from "@/lib/jobs.ts"
import { getMyApplications } from "@/services/applicationService.ts"
import { getJobPostings } from "@/services/jobPostingService.ts"
import type { User } from "@/types/models.ts"

function CandidateHomePage( { user }: { user: User } ) {
    const { savedIds, isSaved, toggle } = useSavedJobs()

    // The two lists the home needs, requested at the same time.
    const { data, error, isLoading, reload } = useAsyncData( "candidate-home", async () => {
        const [ jobs, applications ] = await Promise.all( [ getJobPostings(), getMyApplications() ] )
        return { jobs, applications }
    } )

    const completion = getProfileCompletion( user )

    // The three numbers. Each one is computed here because the backend has
    // no summary endpoint: active = applications without a final answer;
    // saved = saved postings that are still open.
    const activeApplications = data?.applications.filter( isActiveApplication ).length
    const savedOpen = data?.jobs.filter( ( job ) => savedIds.has( job.id ) && !isExpired( job ) ).length
    const recommended = data ? getRecommendedJobs( data.jobs, data.applications, user ) : []

    return (
        <>
            <PageHeader
                title={ `Hola, ${ getDisplayName( user ) }` }
                subtitle="Aquí tienes un resumen de tu actividad"
            />

            <StatGrid>
                <StatCard icon={ Briefcase } value={ activeApplications ?? "—" } label="Aplicaciones activas" to="/applications" />
                <StatCard icon={ Bookmark } value={ savedOpen ?? "—" } label="Vacantes guardadas" to="/jobs?saved=1" />
                <StatCard
                    icon={ Clock }
                    value={ `${ completion.percent }%` }
                    label="Perfil completado"
                    detail={ completion.missing.length > 0 ? `Falta: ${ completion.missing.join( ", " ) }` : undefined }
                    to="/profile"
                />
            </StatGrid>

            <section aria-labelledby="recommended-title" className="flex flex-col gap-3.5">
                <div className="flex items-baseline justify-between gap-4">
                    <h2 id="recommended-title" className="text-base font-bold text-foreground">Vacantes recomendadas</h2>
                    <Link to="/jobs" className={ `${ linkClasses } text-[13px]` }>Ver todas</Link>
                </div>

                { isLoading && !data && <LoadingState label="Cargando vacantes" /> }
                { error && <ErrorState message={ error.message } onRetry={ reload } /> }

                { data && recommended.length === 0 && (
                    <EmptyState
                        title="No hay vacantes nuevas para ti por ahora"
                        description="Ya te postulaste a todas las vacantes abiertas, o todavía no hay publicadas. Vuelve pronto."
                        action={ <Link to="/jobs" className={ buttonClasses( { variant: "secondary", size: "sm" } ) }>Explorar vacantes</Link> }
                    />
                ) }

                { recommended.length > 0 && (
                    <div className="flex flex-col gap-2.5">
                        { recommended.map( ( job ) => (
                            <JobCard
                                key={ job.id }
                                job={ job }
                                to={ `/jobs/${ job.id }` }
                                saved={ isSaved( job.id ) }
                                onToggleSaved={ () => toggle( job.id ) }
                            />
                        ) ) }
                    </div>
                ) }
            </section>
        </>
    )
}

export { CandidateHomePage }
