// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Who applied to one job posting of the company, and the control to
//      move each application from one status to another.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { Mail, Phone } from "lucide-react"
import { useState } from "react"
import { useParams } from "react-router-dom"

import { ApplicationStatusBadge } from "@/components/jobs/StatusBadge.tsx"
import { PageHeader } from "@/components/layout/PageHeader.tsx"
import { Alert } from "@/components/ui/Alert.tsx"
import { Card } from "@/components/ui/Card.tsx"
import { linkClasses } from "@/components/ui/linkClasses.ts"
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States.tsx"
import { useAsyncData } from "@/hooks/useAsyncData.ts"
import { formatDate } from "@/lib/dates.ts"
import { APPLICATION_STATUS_LABELS } from "@/lib/labels.ts"
import { toApiError } from "@/services/api.ts"
import { getApplicants, updateApplicationStatus } from "@/services/applicationService.ts"
import { getMyCompanyJobPostings } from "@/services/jobPostingService.ts"
import type { Applicant, ApplicationStatus } from "@/types/models.ts"

interface ApplicantRowProps {
    applicant: Applicant
    onStatusChange: ( applicant: Applicant, status: ApplicationStatus ) => Promise<void>
}

function ApplicantRow( { applicant, onStatusChange }: ApplicantRowProps ) {
    const [ saving, setSaving ] = useState( false )
    const [ error, setError ] = useState<string | null>( null )

    async function handleChange( status: ApplicationStatus ) {
        setSaving( true )
        setError( null )

        try {
            await onStatusChange( applicant, status )
        } catch( caught ) {
            // The select shows applicant.status, which did not change, so
            // it goes back to the real value by itself.
            setError( toApiError( caught ).message )
        } finally {
            setSaving( false )
        }
    }

    return (
        <Card className="flex flex-col gap-3 px-[18px] py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <a href={ `mailto:${ applicant.email }` } className={ `${ linkClasses } flex items-center gap-1.5 text-[14.5px] break-all` }>
                            <Mail aria-hidden className="size-3.5 shrink-0" />
                            { applicant.email }
                        </a>
                        <ApplicationStatusBadge status={ applicant.status } />
                    </div>
                    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-muted-foreground">
                        { applicant.phone && (
                            <span className="flex items-center gap-1"><Phone aria-hidden className="size-3" />{ applicant.phone }</span>
                        ) }
                        { applicant.date && <span>Se postuló el { formatDate( applicant.date ) }</span> }
                        {/* The file itself cannot be opened from here: the
                            backend does not serve it. It reaches the company
                            by email when the candidate applies with its CV. */}
                        <span>{ applicant.cvUrl ? "Tiene CV: si se postuló con él, llegó a tu correo de contacto" : "Sin CV cargado" }</span>
                    </p>
                </div>

                <label className="flex shrink-0 items-center gap-2 text-[13px] font-semibold text-foreground">
                    Estado
                    <select
                        aria-label={ `Estado de la postulación de ${ applicant.email }` }
                        className="h-9 rounded-[10px] border-2 border-input bg-card px-2.5 text-sm font-normal disabled:opacity-60"
                        value={ applicant.status }
                        disabled={ saving }
                        onChange={ ( event ) => handleChange( event.target.value as ApplicationStatus ) }
                    >
                        { Object.entries( APPLICATION_STATUS_LABELS ).map( ( [ value, label ] ) => (
                            <option key={ value } value={ value }>{ label }</option>
                        ) ) }
                    </select>
                </label>
            </div>

            { error && <Alert tone="error">{ error }</Alert> }
        </Card>
    )
}

function ApplicantsPage() {
    const { id } = useParams()
    const jobId = Number( id )

    const { data, error, isLoading, reload, setData } = useAsyncData( `applicants:${ id }`, async () => {
        const [ jobs, applicants ] = await Promise.all( [ getMyCompanyJobPostings(), getApplicants( jobId ) ] )
        return { job: jobs.find( ( job ) => job.id === jobId ) ?? null, applicants }
    } )

    // Saves the new status and, once the backend accepted it, updates that
    // one row in memory instead of loading the whole list again.
    async function handleStatusChange( applicant: Applicant, status: ApplicationStatus ) {
        await updateApplicationStatus( applicant.id, status )

        if( data ) {
            setData( {
                ...data,
                applicants: data.applicants.map( ( item ) => ( item.id === applicant.id ? { ...item, status } : item ) ),
            } )
        }
    }

    const back = { to: "/company/jobs", label: "Volver a mis vacantes" }

    if( error ) {
        return (
            <>
                <PageHeader title="Aplicantes" back={ back } />
                {/* 403/404: not this company's posting. Retrying will not change that. */}
                <ErrorState message={ error.message } onRetry={ error.status === 403 || error.status === 404 ? undefined : reload } />
            </>
        )
    }

    if( !data ) {
        return (
            <>
                <PageHeader title="Aplicantes" back={ back } />
                { isLoading && <LoadingState label="Cargando aplicantes" /> }
            </>
        )
    }

    const { job, applicants } = data

    return (
        <>
            <PageHeader
                title="Aplicantes"
                back={ back }
                subtitle={
                    `${ job?.title ?? "Vacante" } · ${ applicants.length === 1 ? "1 postulación" : `${ applicants.length } postulaciones` }`
                }
            />

            { applicants.length === 0 ? (
                <EmptyState
                    title="Todavía nadie se ha postulado"
                    description="Cuando un candidato se postule a esta vacante, aparecerá aquí."
                />
            ) : (
                <div className="flex flex-col gap-2.5">
                    { applicants.map( ( applicant ) => (
                        <ApplicantRow key={ applicant.id } applicant={ applicant } onStatusChange={ handleStatusChange } />
                    ) ) }
                </div>
            ) }
        </>
    )
}

export { ApplicantsPage }
