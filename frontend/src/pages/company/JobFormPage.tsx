// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Form to create a job posting or edit one. It is one screen for
//      both: with an :id in the URL it loads that posting and saves over
//      it. Either way the posting waits for an admin before it is shown
//      to candidates.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate, useParams } from "react-router-dom"

import { CompanyStatusBanner } from "@/components/jobs/CompanyStatusBanner.tsx"
import { PageHeader } from "@/components/layout/PageHeader.tsx"
import { Alert } from "@/components/ui/Alert.tsx"
import { Button } from "@/components/ui/Button.tsx"
import { SectionCard } from "@/components/ui/Card.tsx"
import { SelectField, TextareaField, TextField } from "@/components/ui/Field.tsx"
import { ErrorState, LoadingState } from "@/components/ui/States.tsx"
import { useAsyncData } from "@/hooks/useAsyncData.ts"
import { today } from "@/lib/dates.ts"
import { CONTRACT_TYPE_LABELS, EXPERIENCE_LEVEL_LABELS, MODALITY_LABELS } from "@/lib/labels.ts"
import { applyFieldErrors, REQUIRED } from "@/lib/validation.ts"
import { getCareers } from "@/services/careerService.ts"
import { getMyCompany } from "@/services/companyService.ts"
import { createJobPosting, getMyCompanyJobPostings, updateJobPosting } from "@/services/jobPostingService.ts"
import type { Career, ContractType, ExperienceLevel, JobPosting, JobPostingInput, Modality } from "@/types/models.ts"

// Inputs hold strings. The names are the ones the backend validates
// (jb_pst_ prefix), so a 422 error lands on its input directly.
interface JobFormValues {
    jb_pst_job_title: string
    jb_pst_requirements: string
    jb_pst_benefits: string
    jb_pst_modality: Modality | ""
    jb_pst_schedule: string
    jb_pst_contract_type: ContractType | ""
    jb_pst_experience_level: ExperienceLevel | ""
    jb_pst_expiration_date: string
    jb_pst_salary: string
    careerIds: string[]     // checkbox values arrive as strings
}

const FIELD_NAMES = [
    "jb_pst_job_title", "jb_pst_requirements", "jb_pst_benefits", "jb_pst_modality", "jb_pst_schedule",
    "jb_pst_contract_type", "jb_pst_experience_level", "jb_pst_expiration_date", "jb_pst_salary",
] as const satisfies readonly ( keyof JobFormValues )[]

function toFormValues( job: JobPosting | null ): JobFormValues {
    return {
        jb_pst_job_title: job?.title ?? "",
        jb_pst_requirements: job?.requirements ?? "",
        jb_pst_benefits: job?.benefits ?? "",
        jb_pst_modality: job?.modality ?? "",
        jb_pst_schedule: job?.schedule ?? "",
        jb_pst_contract_type: job?.contractType ?? "",
        jb_pst_experience_level: job?.experienceLevel ?? "",
        jb_pst_expiration_date: job?.expirationDate ?? "",
        jb_pst_salary: job?.salary?.toString() ?? "",
        careerIds: [],
    }
}

function toInput( form: JobFormValues, isEdit: boolean ): JobPostingInput {
    const careerIds = form.careerIds.map( Number )

    return {
        title: form.jb_pst_job_title.trim(),
        requirements: form.jb_pst_requirements.trim(),
        benefits: form.jb_pst_benefits.trim(),
        modality: form.jb_pst_modality as Modality,
        schedule: form.jb_pst_schedule.trim(),
        contractType: form.jb_pst_contract_type as ContractType,
        experienceLevel: form.jb_pst_experience_level as ExperienceLevel,
        expirationDate: form.jb_pst_expiration_date,
        salary: form.jb_pst_salary === "" ? null : Number( form.jb_pst_salary ),
        // Editing: the backend replaces the careers only when the list is
        // sent. With nothing checked the list is left out, so the careers
        // the posting already has stay as they are.
        careerIds: isEdit && careerIds.length === 0 ? undefined : careerIds,
    }
}

interface JobFormProps {
    job: JobPosting | null      // null = creating a new one
    careers: Career[]
}

function JobForm( { job, careers }: JobFormProps ) {
    const navigate = useNavigate()
    const isEdit = job !== null

    const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<JobFormValues>( {
        defaultValues: toFormValues( job ),
    } )
    const [ serverError, setServerError ] = useState<string | null>( null )

    async function onSubmit( form: JobFormValues ) {
        setServerError( null )

        try {
            const input = toInput( form, isEdit )

            if( job ) await updateJobPosting( job.id, input )
            else await createJobPosting( input )

            navigate( "/company/jobs", {
                state: {
                    notice: isEdit
                        ? "Guardamos los cambios. La vacante volvió a revisión y se publicará cuando un administrador la apruebe."
                        : "Vacante creada. Se publicará cuando un administrador la apruebe.",
                },
            } )
        } catch( error ) {
            const { apiError, handled } = applyFieldErrors( error, setError, FIELD_NAMES )
            if( !handled ) setServerError( apiError.message )
        }
    }

    return (
        <form onSubmit={ handleSubmit( onSubmit ) } noValidate className="flex flex-col gap-7">

            { isEdit && job.approvalStatus === "approved" && (
                <Alert tone="warning" title="Esta vacante está publicada">
                    Al guardar cambios vuelve a revisión y deja de mostrarse a los candidatos hasta que un
                    administrador la apruebe de nuevo.
                </Alert>
            ) }
            { isEdit && job.approvalStatus === "rejected" && (
                <Alert tone="error" title="Esta vacante fue rechazada">
                    Motivo: { job.rejectionReason ?? "no indicado" }. Corrígela y guárdala para enviarla de nuevo a revisión.
                </Alert>
            ) }
            { serverError && <Alert tone="error">{ serverError }</Alert> }

            <SectionCard title="El puesto">
                <TextField
                    label="Título de la vacante"
                    placeholder="Ej. Desarrollador Backend Jr."
                    error={ errors.jb_pst_job_title?.message }
                    { ...register( "jb_pst_job_title", { required: REQUIRED, maxLength: { value: 100, message: "Máximo 100 caracteres." } } ) }
                />
                <TextareaField
                    label="Requisitos"
                    rows={ 5 }
                    placeholder="Conocimientos, carrera, experiencia…"
                    error={ errors.jb_pst_requirements?.message }
                    { ...register( "jb_pst_requirements", { required: REQUIRED } ) }
                />
                <TextareaField
                    label="Beneficios"
                    optional
                    rows={ 3 }
                    placeholder="Prestaciones, apoyos, horario flexible…"
                    error={ errors.jb_pst_benefits?.message }
                    { ...register( "jb_pst_benefits" ) }
                />
            </SectionCard>

            <SectionCard title="Condiciones">
                <div className="grid gap-4 sm:grid-cols-3">
                    <SelectField label="Modalidad" error={ errors.jb_pst_modality?.message } { ...register( "jb_pst_modality", { required: "Selecciona la modalidad." } ) }>
                        <option value="">Selecciona</option>
                        { Object.entries( MODALITY_LABELS ).map( ( [ value, label ] ) => <option key={ value } value={ value }>{ label }</option> ) }
                    </SelectField>
                    <SelectField label="Tipo de contrato" error={ errors.jb_pst_contract_type?.message } { ...register( "jb_pst_contract_type", { required: "Selecciona el tipo de contrato." } ) }>
                        <option value="">Selecciona</option>
                        { Object.entries( CONTRACT_TYPE_LABELS ).map( ( [ value, label ] ) => <option key={ value } value={ value }>{ label }</option> ) }
                    </SelectField>
                    <SelectField label="Nivel de experiencia" error={ errors.jb_pst_experience_level?.message } { ...register( "jb_pst_experience_level", { required: "Selecciona el nivel." } ) }>
                        <option value="">Selecciona</option>
                        { Object.entries( EXPERIENCE_LEVEL_LABELS ).map( ( [ value, label ] ) => <option key={ value } value={ value }>{ label }</option> ) }
                    </SelectField>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <TextField
                        label="Horario"
                        placeholder="Ej. Lunes a viernes, 9 a 6"
                        error={ errors.jb_pst_schedule?.message }
                        { ...register( "jb_pst_schedule", { required: "Indica el horario.", maxLength: { value: 150, message: "Máximo 150 caracteres." } } ) }
                    />
                    <TextField
                        label="Sueldo mensual (MXN)"
                        type="number"
                        inputMode="decimal"
                        min={ 0 }
                        step="any"
                        optional
                        error={ errors.jb_pst_salary?.message }
                        { ...register( "jb_pst_salary", {
                            validate: ( value ) => value === "" || Number( value ) >= 0 || "El sueldo debe ser un número positivo.",
                        } ) }
                    />
                    <TextField
                        label="Fecha de cierre"
                        type="date"
                        min={ today() }
                        hint="Último día para recibir postulaciones."
                        error={ errors.jb_pst_expiration_date?.message }
                        { ...register( "jb_pst_expiration_date", {
                            required: "Indica la fecha de cierre.",
                            validate: ( value ) => value >= today() || "La fecha de cierre no puede ser anterior a hoy.",
                        } ) }
                    />
                </div>
            </SectionCard>

            <SectionCard
                title="Carreras"
                description={
                    isEdit
                        ? "Marca carreras solo si quieres reemplazar las que la vacante ya tiene. Sin marcar ninguna, se conservan las actuales."
                        : "Opcional. Marca las carreras a las que va dirigida la vacante."
                }
            >
                { careers.length === 0 ? (
                    <p className="text-[13px] text-muted-foreground">No pudimos cargar el catálogo de carreras. Puedes guardar la vacante sin ellas.</p>
                ) : (
                    <fieldset>
                        <legend className="sr-only">Carreras</legend>
                        <div className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                            { careers.map( ( career ) => (
                                <label key={ career.id } className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground">
                                    <input type="checkbox" value={ career.id } className="size-4 accent-(--palette-accent-2)" { ...register( "careerIds" ) } />
                                    { career.name }
                                </label>
                            ) ) }
                        </div>
                    </fieldset>
                ) }
            </SectionCard>

            <div className="flex flex-wrap gap-2.5">
                <Button type="submit" loading={ isSubmitting }>{ isEdit ? "Guardar cambios" : "Crear vacante" }</Button>
                <Button variant="secondary" disabled={ isSubmitting } onClick={ () => navigate( "/company/jobs" ) }>Cancelar</Button>
            </div>
        </form>
    )
}

function JobFormPage() {
    const { id } = useParams()
    const isEdit = id !== undefined
    const jobId = Number( id )

    const { data, error, isLoading, reload } = useAsyncData( `job-form:${ id ?? "new" }`, async () => {
        const [ company, careers, jobs ] = await Promise.all( [
            getMyCompany(),
            // The form works without the catalog, so its failure is not fatal.
            getCareers().catch( (): Career[] => [] ),
            // The company's own list is what proves the posting is theirs.
            isEdit ? getMyCompanyJobPostings() : Promise.resolve( [] ),
        ] )

        return { company, careers, job: jobs.find( ( job ) => job.id === jobId ) ?? null }
    } )

    const title = isEdit ? "Editar vacante" : "Nueva vacante"
    const back = { to: "/company/jobs", label: "Volver a mis vacantes" }

    if( error ) {
        return (
            <>
                <PageHeader title={ title } back={ back } />
                <ErrorState message={ error.message } onRetry={ reload } />
            </>
        )
    }

    if( !data ) {
        return (
            <>
                <PageHeader title={ title } back={ back } />
                { isLoading && <LoadingState /> }
            </>
        )
    }

    if( isEdit && !data.job ) {
        return (
            <>
                <PageHeader title={ title } back={ back } />
                <ErrorState message="No encontramos esta vacante entre las de tu empresa." />
            </>
        )
    }

    // Creating needs an approved company (the backend answers 403
    // otherwise), so do not show a form that cannot be sent.
    if( !isEdit && data.company.approvalStatus !== "approved" ) {
        return (
            <>
                <PageHeader title={ title } back={ back } />
                <CompanyStatusBanner company={ data.company } />
            </>
        )
    }

    return (
        <>
            <PageHeader
                title={ title }
                back={ back }
                subtitle={ isEdit ? data.job?.title : "Un administrador la revisa antes de publicarla" }
            />
            <JobForm job={ data.job } careers={ data.careers } />
        </>
    )
}

export { JobFormPage }
