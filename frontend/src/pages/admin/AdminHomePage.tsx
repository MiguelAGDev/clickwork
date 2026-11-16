// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Home of the admin: how many companies and job postings wait for
//      review, how many users there are, and a shortcut to each queue.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { Briefcase, Building2, Users } from "lucide-react"
import { Link } from "react-router-dom"

import { StatCard, StatGrid } from "@/components/jobs/StatCard.tsx"
import { PageHeader } from "@/components/layout/PageHeader.tsx"
import { Card } from "@/components/ui/Card.tsx"
import { linkClasses } from "@/components/ui/linkClasses.ts"
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States.tsx"
import { useAsyncData } from "@/hooks/useAsyncData.ts"
import { useAuth } from "@/hooks/useAuth.ts"
import { getDisplayName } from "@/lib/displayName.ts"
import { getJobSummary } from "@/lib/jobs.ts"
import { COMPANY_SIZE_LABELS } from "@/lib/labels.ts"
import { getPendingCompanies, getPendingJobPostings, getUsers } from "@/services/adminService.ts"

// How many rows of each queue the home previews.
const PREVIEW = 3

function AdminHomePage() {
    const { user } = useAuth()

    // The backend has no summary endpoint: the numbers are the lengths of
    // the three lists, requested at the same time.
    const { data, error, isLoading, reload } = useAsyncData( "admin-home", async () => {
        const [ companies, jobs, users ] = await Promise.all( [ getPendingCompanies(), getPendingJobPostings(), getUsers() ] )
        return { companies, jobs, users }
    } )

    const activeUsers = data?.users.filter( ( user ) => user.active ).length
    const nothingPending = data && data.companies.length === 0 && data.jobs.length === 0

    return (
        <>
            <PageHeader title={ `Hola, ${ user ? getDisplayName( user ) : "Admin" }` } subtitle="Esto es lo que espera tu revisión" />

            <StatGrid>
                <StatCard icon={ Building2 } value={ data?.companies.length ?? "—" } label="Empresas por revisar" to="/admin/companies" />
                <StatCard icon={ Briefcase } value={ data?.jobs.length ?? "—" } label="Vacantes por revisar" to="/admin/jobs" />
                <StatCard
                    icon={ Users }
                    value={ activeUsers ?? "—" }
                    label="Usuarios activos"
                    detail={ data ? `De ${ data.users.length } registrados` : undefined }
                    to="/admin/users"
                />
            </StatGrid>

            { isLoading && !data && <LoadingState /> }
            { error && <ErrorState message={ error.message } onRetry={ reload } /> }

            { nothingPending && (
                <EmptyState title="No hay nada por revisar" description="Las empresas y vacantes nuevas aparecerán aquí." />
            ) }

            { data && data.companies.length > 0 && (
                <section aria-labelledby="pending-companies" className="flex flex-col gap-3.5">
                    <div className="flex items-baseline justify-between gap-4">
                        <h2 id="pending-companies" className="text-base font-bold text-foreground">Empresas por revisar</h2>
                        <Link to="/admin/companies" className={ `${ linkClasses } text-[13px]` }>Revisar empresas</Link>
                    </div>
                    <div className="flex flex-col gap-2.5">
                        { data.companies.slice( 0, PREVIEW ).map( ( company ) => (
                            <Card key={ company.id } className="flex flex-col gap-[3px] px-[18px] py-3.5">
                                <p className="text-[14.5px] font-bold text-foreground">{ company.name }</p>
                                <p className="text-[12.5px] text-muted-foreground">
                                    { [ company.industry, COMPANY_SIZE_LABELS[ company.size ], company.city ].filter( Boolean ).join( " · " ) }
                                </p>
                            </Card>
                        ) ) }
                    </div>
                </section>
            ) }

            { data && data.jobs.length > 0 && (
                <section aria-labelledby="pending-jobs" className="flex flex-col gap-3.5">
                    <div className="flex items-baseline justify-between gap-4">
                        <h2 id="pending-jobs" className="text-base font-bold text-foreground">Vacantes por revisar</h2>
                        <Link to="/admin/jobs" className={ `${ linkClasses } text-[13px]` }>Revisar vacantes</Link>
                    </div>
                    <div className="flex flex-col gap-2.5">
                        { data.jobs.slice( 0, PREVIEW ).map( ( job ) => (
                            <Card key={ job.id } className="flex flex-col gap-[3px] px-[18px] py-3.5">
                                <p className="text-[14.5px] font-bold text-foreground">{ job.title }</p>
                                <p className="text-[12.5px] text-muted-foreground">{ getJobSummary( job ) }</p>
                            </Card>
                        ) ) }
                    </div>
                </section>
            ) }
        </>
    )
}

export { AdminHomePage }
