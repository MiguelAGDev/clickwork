// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Profile of a candidate: contact data and the fields of its role,
//      the CV (PDF) that companies receive, and the password.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { FileText, Upload } from "lucide-react"
import { useRef, useState } from "react"
import type { ChangeEvent } from "react"
import { useForm } from "react-hook-form"

import { ChangePasswordForm } from "@/components/account/ChangePasswordForm.tsx"
import { PageHeader } from "@/components/layout/PageHeader.tsx"
import { Alert } from "@/components/ui/Alert.tsx"
import { Button } from "@/components/ui/Button.tsx"
import { SectionCard } from "@/components/ui/Card.tsx"
import { SelectField, TextField } from "@/components/ui/Field.tsx"
import { useAsyncData } from "@/hooks/useAsyncData.ts"
import { useAuth } from "@/hooks/useAuth.ts"
import { formatDate } from "@/lib/dates.ts"
import { getProfileCompletion } from "@/lib/jobs.ts"
import { ROLE_LABELS } from "@/lib/roles.ts"
import { applyFieldErrors, firstNameRules, lastNameRules } from "@/lib/validation.ts"
import { toApiError } from "@/services/api.ts"
import { getCareers } from "@/services/careerService.ts"
import { CV_MAX_BYTES, updateMe, uploadCv } from "@/services/userService.ts"
import type { ProfileInput } from "@/services/userService.ts"
import type { User } from "@/types/models.ts"

// Inputs hold strings; they are converted when building the request.
// Names match the fields PUT /users/me validates.
interface ProfileFormValues {
    firstName: string
    lastName: string
    phone: string
    careerId: string
    semester: string
    hostCompany: string
    project: string
    endDate: string
    currentJob: string
}

const FIELD_NAMES = [ "firstName", "lastName", "phone", "careerId", "semester", "hostCompany", "project", "endDate", "currentJob" ] as const

function toFormValues( user: User ): ProfileFormValues {
    return {
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone ?? "",
        careerId: user.careerId?.toString() ?? "",
        semester: user.semester?.toString() ?? "",
        hostCompany: user.hostCompany ?? "",
        project: user.project ?? "",
        endDate: user.endDate ?? "",
        currentJob: user.currentJob ?? "",
    }
}

function toProfileInput( form: ProfileFormValues, user: User ): ProfileInput {
    const input: ProfileInput = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        careerId: form.careerId ? Number( form.careerId ) : null,
    }

    if( user.role === "student" ) {
        input.semester = form.semester ? Number( form.semester ) : null
    } else if( user.role === "intern" ) {
        // The backend rewrites these three together: a field left out is
        // saved as empty. So all three always travel, null when blank.
        input.hostCompany = form.hostCompany.trim() || null
        input.project = form.project.trim() || null
        input.endDate = form.endDate || null
    } else if( user.role === "graduate" ) {
        input.currentJob = form.currentJob.trim() || null
    }

    return input
}

function ProfileForm( { user }: { user: User } ) {
    const { setUser } = useAuth()
    const careers = useAsyncData( "careers", getCareers )

    const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting, isDirty } } = useForm<ProfileFormValues>( {
        defaultValues: toFormValues( user ),
    } )
    const [ serverError, setServerError ] = useState<string | null>( null )
    const [ saved, setSaved ] = useState( false )

    // Until the catalog arrives, the list holds just the career the user
    // already has, so the select can show it. It uses the same key as the
    // real option that replaces it, which lets React keep that <option>
    // (and its "selected" state) instead of resetting the select.
    const careerOptions = careers.data
        ?? ( user.careerId !== null ? [ { id: user.careerId, name: user.careerName ?? "Cargando…" } ] : [] )

    async function onSubmit( form: ProfileFormValues ) {
        setServerError( null )
        setSaved( false )

        try {
            const updated = await updateMe( toProfileInput( form, user ) )
            setUser( updated )                  // The header and the home read the new data at once.
            reset( toFormValues( updated ) )    // The saved values become the new starting point.
            setSaved( true )
        } catch( error ) {
            const { apiError, handled } = applyFieldErrors( error, setError, FIELD_NAMES )
            if( !handled ) setServerError( apiError.message )
        }
    }

    return (
        <SectionCard title="Datos personales" description="Las empresas ven estos datos cuando te postulas.">
            { saved && <Alert tone="success">Guardamos tus cambios.</Alert> }
            { serverError && <Alert tone="error">{ serverError }</Alert> }

            <form onSubmit={ handleSubmit( onSubmit ) } noValidate className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <TextField
                        label="Nombre"
                        autoComplete="given-name"
                        error={ errors.firstName?.message }
                        { ...register( "firstName", firstNameRules ) }
                    />
                    <TextField
                        label="Apellido"
                        autoComplete="family-name"
                        error={ errors.lastName?.message }
                        { ...register( "lastName", lastNameRules ) }
                    />

                    {/* Email and account type cannot be changed: the backend has no route for it. */}
                    <TextField label="Correo electrónico" value={ user.email } disabled readOnly />
                    <TextField label="Tipo de cuenta" value={ ROLE_LABELS[ user.role ] } disabled readOnly />

                    <TextField
                        label="Teléfono"
                        type="tel"
                        autoComplete="tel"
                        placeholder="10 dígitos"
                        error={ errors.phone?.message }
                        { ...register( "phone", { maxLength: { value: 20, message: "Máximo 20 caracteres." } } ) }
                    />

                    <SelectField
                        label="Carrera"
                        error={ errors.careerId?.message }
                        hint={ careers.error ? "No pudimos cargar las carreras. Recarga la página para intentarlo de nuevo." : undefined }
                        { ...register( "careerId" ) }
                    >
                        {/* Once a career is saved the backend cannot clear it, only change it. */}
                        { user.careerId === null && <option value="">Sin especificar</option> }
                        { careerOptions.map( ( career ) => <option key={ career.id } value={ career.id }>{ career.name }</option> ) }
                    </SelectField>

                    { user.role === "student" && (
                        <TextField
                            label="Semestre"
                            type="number"
                            inputMode="numeric"
                            min={ 1 }
                            max={ 12 }
                            error={ errors.semester?.message }
                            { ...register( "semester", {
                                validate: ( value ) => {
                                    if( !value ) return true
                                    const n = Number( value )
                                    return ( Number.isInteger( n ) && n >= 1 && n <= 12 ) || "El semestre debe estar entre 1 y 12."
                                },
                            } ) }
                        />
                    ) }

                    { user.role === "intern" && (
                        <>
                            <TextField label="Empresa donde haces tu residencia" error={ errors.hostCompany?.message } { ...register( "hostCompany" ) } />
                            <TextField label="Proyecto" error={ errors.project?.message } { ...register( "project" ) } />
                            <TextField label="Inicio de la residencia" value={ formatDate( user.startDate ) || "Sin fecha" } disabled readOnly />
                            <TextField
                                label="Término de la residencia"
                                type="date"
                                error={ errors.endDate?.message }
                                { ...register( "endDate", {
                                    validate: ( value ) => !value || !user.startDate || value >= user.startDate || "Debe ser posterior al inicio.",
                                } ) }
                            />
                        </>
                    ) }

                    { user.role === "graduate" && (
                        <>
                            <TextField label="Año de egreso" value={ user.graduationYear?.toString() ?? "Sin dato" } disabled readOnly />
                            <TextField label="Puesto actual" error={ errors.currentJob?.message } { ...register( "currentJob" ) } />
                        </>
                    ) }
                </div>

                <div>
                    <Button type="submit" loading={ isSubmitting } disabled={ !isDirty }>Guardar cambios</Button>
                </div>
            </form>
        </SectionCard>
    )
}

function CvSection( { user }: { user: User } ) {
    const { setUser } = useAuth()
    // The real <input type="file"> is hidden; the button below clicks it.
    const inputRef = useRef<HTMLInputElement>( null )
    const [ uploading, setUploading ] = useState( false )
    const [ error, setError ] = useState<string | null>( null )
    const [ uploaded, setUploaded ] = useState( false )

    async function handleFile( event: ChangeEvent<HTMLInputElement> ) {
        const file = event.target.files?.[ 0 ]
        // Clear the input so choosing the same file again fires "change".
        event.target.value = ""
        if( !file ) return

        setError( null )
        setUploaded( false )

        // Same two checks the backend does, done first here so the user
        // does not wait for an upload that will be rejected.
        if( file.type !== "application/pdf" ) {
            setError( "Solo se aceptan archivos PDF." )
            return
        }
        if( file.size > CV_MAX_BYTES ) {
            setError( "El archivo pesa más de 5 MB." )
            return
        }

        setUploading( true )
        try {
            setUser( await uploadCv( file ) )
            setUploaded( true )
        } catch( caught ) {
            setError( toApiError( caught ).message )
        } finally {
            setUploading( false )
        }
    }

    return (
        <SectionCard title="Currículum" description="Un PDF de hasta 5 MB. Es el archivo que recibe la empresa cuando te postulas con tu CV.">
            { uploaded && <Alert tone="success">Tu CV se guardó.</Alert> }
            { error && <Alert tone="error">{ error }</Alert> }

            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div aria-hidden className="flex size-10 items-center justify-center rounded-[10px] bg-muted">
                        <FileText className="size-[18px] text-muted-foreground" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                        { user.cvUrl ? "Tienes un CV cargado" : "Aún no has subido tu CV" }
                    </p>
                </div>

                <input
                    ref={ inputRef }
                    type="file"
                    accept="application/pdf"
                    aria-label="Archivo de CV en PDF"
                    className="sr-only"
                    onChange={ handleFile }
                />
                <Button variant="secondary" loading={ uploading } onClick={ () => inputRef.current?.click() }>
                    { !uploading && <Upload aria-hidden className="size-4" /> }
                    { user.cvUrl ? "Reemplazar CV" : "Subir CV" }
                </Button>
            </div>
        </SectionCard>
    )
}

function ProfilePage() {
    const { user } = useAuth()

    if( !user ) return null     // Never happens inside ProtectedRoute.

    const completion = getProfileCompletion( user )

    return (
        <>
            <PageHeader
                title="Mi perfil"
                subtitle={
                    completion.missing.length > 0
                        ? `Perfil completado al ${ completion.percent }%. Falta: ${ completion.missing.join( ", " ) }.`
                        : "Tu perfil está completo."
                }
            />
            <ProfileForm user={ user } />
            <CvSection user={ user } />
            <ChangePasswordForm />
        </>
    )
}

export { ProfilePage }
