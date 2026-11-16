// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      The applications of the logged-in candidate, newest first, each
//      with the status the company gave it.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { Link } from "react-router-dom"

import { JobCard } from "@/components/jobs/JobCard.tsx"
import { ApplicationStatusBadge } from "@/components/jobs/StatusBadge.tsx"
import { PageHeader } from "@/components/layout/PageHeader.tsx"
import { buttonClasses } from "@/components/ui/buttonClasses.ts"
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States.tsx"
import { useAsyncData } from "@/hooks/useAsyncData.ts"
import { formatDate } from "@/lib/dates.ts"
import { getJobSummary, isActiveApplication } from "@/lib/jobs.ts"
import { getMyApplications } from "@/services/applicationService.ts"
import type { Application } from "@/types/models.ts"

// Newest first. Same day: the higher id was created later.
function byNewestApplication( a: Application, b: Application ): number {
    return ( b.date ?? "" ).localeCompare( a.date ?? "" ) || b.id - a.id
}

function ApplicationsPage() {
    const { data, error, isLoading, reload } = useAsyncData( "my-applications", getMyApplications )

    const applications = [ ...( data ?? [] ) ].sort( byNewestApplication )
    const active = applications.filter( isActiveApplication ).length

    return (
        <>
            <PageHeader
                title="Mis aplicaciones"
                subtitle={
                    data && applications.length > 0
                        ? `${ applications.length } en total, ${ active } ${ active === 1 ? "activa" : "activas" }`
                        : "Sigue el estado de tus postulaciones"
                }
            />

            { isLoading && !data && <LoadingState label="Cargando aplicaciones" /> }
            { error && <ErrorState message={ error.message } onRetry={ reload } /> }

            { data && applications.length === 0 && (
                <EmptyState
                    title="Todavía no te has postulado"
                    description="Cuando te postules a una vacante, aquí verás cómo avanza."
                    action={ <Link to="/jobs" className={ buttonClasses( { size: "sm" } ) }>Ver vacantes</Link> }
                />
            ) }

            { applications.length > 0 && (
                <div className="flex flex-col gap-2.5">
                    { applications.map( ( application ) => (
                        <JobCard
                            key={ application.id }
                            job={ application.job }
                            to={ `/jobs/${ application.job.id }` }
                            summary={
                                application.date
                                    ? `Te postulaste el ${ formatDate( application.date ) } · ${ getJobSummary( application.job ) }`
                                    : undefined
                            }
                            trailing={ <ApplicationStatusBadge status={ application.status } /> }
                        />
                    ) ) }
                </div>
            ) }
        </>
    )
}

export { ApplicationsPage }
