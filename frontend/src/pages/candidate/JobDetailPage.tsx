// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      One job posting in full, and the box to apply to it. A candidate
//      can apply in two ways: sending its CV to the company by email
//      (Roll Me) or only registering the application.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { Bookmark } from "lucide-react"
import { useState } from "react"
import { Link, useParams } from "react-router-dom"

import { ApplicationStatusBadge } from "@/components/jobs/StatusBadge.tsx"
import { PageHeader } from "@/components/layout/PageHeader.tsx"
import { Alert } from "@/components/ui/Alert.tsx"
import { Badge } from "@/components/ui/Badge.tsx"
import { Button } from "@/components/ui/Button.tsx"
import { Card } from "@/components/ui/Card.tsx"
import { linkClasses } from "@/components/ui/linkClasses.ts"
import { ErrorState, LoadingState } from "@/components/ui/States.tsx"
import { useAsyncData } from "@/hooks/useAsyncData.ts"
import { useAuth } from "@/hooks/useAuth.ts"
import { useSavedJobs } from "@/hooks/useSavedJobs.ts"
import { formatDate } from "@/lib/dates.ts"
import { isExpired, isNew } from "@/lib/jobs.ts"
import { CONTRACT_TYPE_LABELS, EXPERIENCE_LEVEL_LABELS, formatSalary, MODALITY_LABELS } from "@/lib/labels.ts"
import { cn } from "@/lib/utils.ts"
import { toApiError } from "@/services/api.ts"
import { applyToJob, getMyApplications } from "@/services/applicationService.ts"
import { getJobPosting } from "@/services/jobPostingService.ts"
import { rollMe } from "@/services/userService.ts"
import type { Application, JobPosting } from "@/types/models.ts"

// Label + value pairs of the summary grid.
function Fact( { label, value }: { label: string, value: string | null } ) {
    if( !value ) return null

    return (
        <div className="flex flex-col gap-0.5">
            <dt className="text-[12.5px] text-muted-foreground">{ label }</dt>
            <dd className="text-sm font-semibold text-foreground">{ value }</dd>
        </div>
    )
}

type ApplyMode = "with-cv" | "without-cv"

interface ApplyBoxProps {
    job: JobPosting
    application: Application | undefined
    onApplied: () => void
}

function ApplyBox( { job, application, onApplied }: ApplyBoxProps ) {
    const { user } = useAuth()
    // Which button is waiting for the backend (null = none).
    const [ sending, setSending ] = useState<ApplyMode | null>( null )
    const [ error, setError ] = useState<string | null>( null )
    const [ justApplied, setJustApplied ] = useState<ApplyMode | null>( null )

    const hasCv = Boolean( user?.cvUrl )

    async function apply( mode: ApplyMode ) {
        setSending( mode )
        setError( null )

        try {
            // with-cv: creates the application and emails the CV to the
            // company in one step. If the email fails the backend undoes the
            // application (502), so the user can simply try again.
            if( mode === "with-cv" ) await rollMe( job.id )
            else await applyToJob( job.id )

            setJustApplied( mode )
            onApplied()
        } catch( caught ) {
            const apiError = toApiError( caught )
            setError( apiError.message )
            // 409: already applied (another tab, a double click). The
            // screen is out of date, so read the applications again.
            if( apiError.status === 409 ) onApplied()
        } finally {
            setSending( null )
        }
    }

    if( application ) {
        return (
            <Card className="flex flex-col gap-3 p-5">
                { justApplied && (
                    <Alert tone="success">
                        { justApplied === "with-cv"
                            ? "Te postulaste y enviamos tu CV a la empresa."
                            : "Tu postulación quedó registrada." }
                    </Alert>
                ) }
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-sm font-bold text-foreground">Ya te postulaste a esta vacante</p>
                        { application.date && (
                            <p className="text-[12.5px] text-muted-foreground">El { formatDate( application.date ) }</p>
                        ) }
                    </div>
                    <ApplicationStatusBadge status={ application.status } />
                </div>
                <Link to="/applications" className={ `${ linkClasses } text-[13px]` }>Ver mis aplicaciones</Link>
            </Card>
        )
    }

    if( job.approvalStatus !== "approved" ) {
        return <Alert tone="warning">Esta vacante no está publicada, así que todavía no recibe postulaciones.</Alert>
    }

    if( isExpired( job ) ) {
        return <Alert tone="warning">Esta vacante cerró el { formatDate( job.expirationDate ) } y ya no recibe postulaciones.</Alert>
    }

    return (
        <Card className="flex flex-col gap-4 p-5">
            <div>
                <h2 className="text-base font-bold text-foreground">Postúlate</h2>
                <p className="mt-1 text-[13px] text-muted-foreground">
                    { hasCv
                        ? "Al postularte con tu CV, la empresa lo recibe por correo de inmediato."
                        : "Aún no has subido tu CV. Súbelo para que la empresa lo reciba al postularte." }
                </p>
            </div>

            { error && <Alert tone="error">{ error }</Alert> }

            <div className="flex flex-wrap items-center gap-2.5">
                { hasCv ? (
                    <Button onClick={ () => apply( "with-cv" ) } loading={ sending === "with-cv" } disabled={ sending !== null }>
                        Postularme con mi CV
                    </Button>
                ) : (
                    <Link to="/profile" className={ cn( linkClasses, "text-sm" ) }>Subir mi CV</Link>
                ) }
                <Button
                    variant={ hasCv ? "secondary" : "primary" }
                    onClick={ () => apply( "without-cv" ) }
                    loading={ sending === "without-cv" }
                    disabled={ sending !== null }
                >
                    Postularme sin enviar CV
                </Button>
            </div>
        </Card>
    )
}

function JobDetailPage() {
    const { id } = useParams()
    const jobId = Number( id )
    const { isSaved, toggle } = useSavedJobs()

    const { data, error, isLoading, reload } = useAsyncData(
        // A URL like /jobs/abc has no valid id: do not even ask.
        Number.isInteger( jobId ) && jobId > 0 ? `job:${ jobId }` : null,
        async () => {
            const [ job, applications ] = await Promise.all( [ getJobPosting( jobId ), getMyApplications() ] )
            return { job, application: applications.find( ( application ) => application.job.id === jobId ) }
        }
    )

    const back = { to: "/jobs", label: "Volver a vacantes" }

    if( !Number.isInteger( jobId ) || jobId <= 0 ) {
        return (
            <>
                <PageHeader title="Vacante" back={ back } />
                <ErrorState message="No encontramos esta vacante." />
            </>
        )
    }

    if( error ) {
        return (
            <>
                <PageHeader title="Vacante" back={ back } />
                {/* A 404 will not fix itself: only offer "retry" for other failures. */}
                <ErrorState message={ error.message } onRetry={ error.status === 404 ? undefined : reload } />
            </>
        )
    }

    if( !data ) {
        return (
            <>
                <PageHeader title="Vacante" back={ back } />
                { isLoading && <LoadingState label="Cargando vacante" /> }
            </>
        )
    }

    const { job, application } = data
    const saved = isSaved( job.id )
    const salary = formatSalary( job.salary )

    return (
        <>
            <PageHeader
                title={ job.title }
                back={ back }
                subtitle={
                    <span className="flex flex-wrap items-center gap-2">
                        { isNew( job ) && <Badge tone="gold">Nuevo</Badge> }
                        <Badge>{ MODALITY_LABELS[ job.modality ] }</Badge>
                        <Badge>{ CONTRACT_TYPE_LABELS[ job.contractType ] }</Badge>
                        <Badge>{ EXPERIENCE_LEVEL_LABELS[ job.experienceLevel ] }</Badge>
                    </span>
                }
                actions={
                    <Button variant="secondary" aria-pressed={ saved } onClick={ () => toggle( job.id ) }>
                        <Bookmark aria-hidden className={ cn( "size-4", saved && "fill-primary text-primary" ) } />
                        { saved ? "Guardada" : "Guardar" }
                    </Button>
                }
            />

            <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_340px]">
                <div className="flex flex-col gap-[18px]">
                    <Card className="p-5">
                        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                            <Fact label="Horario" value={ job.schedule } />
                            <Fact label="Sueldo" value={ salary ? `${ salary } al mes` : "No especificado" } />
                            <Fact label="Publicada" value={ formatDate( job.publicationDate ) } />
                            <Fact label="Cierra" value={ formatDate( job.expirationDate ) } />
                        </dl>
                    </Card>

                    <Card className="flex flex-col gap-2 p-5">
                        <h2 className="text-base font-bold text-foreground">Requisitos</h2>
                        {/* whitespace-pre-line keeps the line breaks the company typed. */}
                        <p className="text-sm leading-relaxed whitespace-pre-line text-foreground">
                            { job.requirements ?? "La empresa no especificó requisitos." }
                        </p>
                    </Card>

                    { job.benefits && (
                        <Card className="flex flex-col gap-2 p-5">
                            <h2 className="text-base font-bold text-foreground">Beneficios</h2>
                            <p className="text-sm leading-relaxed whitespace-pre-line text-foreground">{ job.benefits }</p>
                        </Card>
                    ) }
                </div>

                <ApplyBox job={ job } application={ application } onApplied={ reload } />
            </div>
        </>
    )
}

export { JobDetailPage }
