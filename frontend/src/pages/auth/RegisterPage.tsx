// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Register form. The first choice is the type of account; the rest
//      of the form changes with it, because each role has its own
//      required fields in the backend (student, intern, graduate,
//      company). Admin accounts cannot be created here.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { Link } from "react-router-dom"

import { AuthFooter, AuthHeading } from "@/components/layout/AuthHeading.tsx"
import { Alert } from "@/components/ui/Alert.tsx"
import { Button } from "@/components/ui/Button.tsx"
import { SelectField, TextField } from "@/components/ui/Field.tsx"
import { linkClasses } from "@/components/ui/linkClasses.ts"
import { useAsyncData } from "@/hooks/useAsyncData.ts"
import { COMPANY_SIZE_LABELS } from "@/lib/labels.ts"
import { ROLE_LABELS } from "@/lib/roles.ts"
import { cn } from "@/lib/utils.ts"
import { applyFieldErrors, emailRules, newPasswordRules, PASSWORD_HINT, REQUIRED } from "@/lib/validation.ts"
import { register as registerAccount } from "@/services/authService.ts"
import type { RegisterInput } from "@/services/authService.ts"
import { getCareers } from "@/services/careerService.ts"
import type { CompanySize } from "@/types/models.ts"

type RegisterRole = RegisterInput[ "role" ]

// Every input is a string while the user types (that is what HTML gives);
// they are converted to the right types when building the request.
// The names are the same the backend validates, so a 422 error can be
// placed on its input directly.
interface RegisterForm {
    role: RegisterRole
    email: string
    password: string
    phone: string
    careerId: string
    semester: string
    hostCompany: string
    project: string
    startDate: string
    endDate: string
    graduationYear: string
    currentJob: string
    name: string
    size: CompanySize | ""
    industry: string
    contact_email: string
    city: string
    state: string
    address: string
}

const FIELD_NAMES = [
    "role", "email", "password", "phone", "careerId", "semester", "hostCompany", "project", "startDate",
    "endDate", "graduationYear", "currentJob", "name", "size", "industry", "contact_email", "city", "state", "address",
] as const satisfies readonly ( keyof RegisterForm )[]

const ROLE_OPTIONS: { value: RegisterRole, description: string }[] = [
    { value: "student", description: "Curso una carrera" },
    { value: "intern", description: "Hago mi residencia" },
    { value: "graduate", description: "Ya egresé" },
    { value: "company", description: "Busco talento" },
]

const CURRENT_YEAR = new Date().getFullYear()

// Sends only the fields of the chosen role, with empty optionals left out:
// the backend treats a missing field and an empty one differently in a
// few validators.
function toRegisterInput( form: RegisterForm ): RegisterInput {
    const input: RegisterInput = { role: form.role, email: form.email.trim(), password: form.password }
    const optional = ( value: string ) => value.trim() || undefined

    input.phone = optional( form.phone )

    if( form.role === "company" ) {
        input.name = form.name.trim()
        input.size = form.size || undefined
        input.industry = form.industry.trim()
        input.contact_email = optional( form.contact_email )
        input.city = optional( form.city )
        input.state = optional( form.state )
        input.address = optional( form.address )
        return input
    }

    input.careerId = form.careerId ? Number( form.careerId ) : undefined

    if( form.role === "student" ) {
        input.semester = Number( form.semester )
    } else if( form.role === "intern" ) {
        input.hostCompany = optional( form.hostCompany )
        input.project = optional( form.project )
        input.startDate = optional( form.startDate )
        input.endDate = optional( form.endDate )
    } else {
        input.graduationYear = Number( form.graduationYear )
        input.currentJob = optional( form.currentJob )
    }

    return input
}

function RegisterPage() {
    const { register, handleSubmit, control, setError, formState: { errors, isSubmitting } } = useForm<RegisterForm>( {
        defaultValues: { role: "student", size: "" },
        // Fields of other roles leave the form when they are hidden, so
        // their rules do not block the submit.
        shouldUnregister: true,
    } )

    // useWatch re-renders this component when the role changes, which is
    // what shows and hides the fields of each role.
    const role = useWatch( { control, name: "role" } )
    const isCompany = role === "company"

    // The careers catalog is public. If it fails to load, the career is
    // optional anyway, so the form still works without it.
    const careers = useAsyncData( "careers", getCareers )

    const [ serverError, setServerError ] = useState<string | null>( null )
    // The account just created; while set, the success screen shows. It keeps
    // its own copy of the role: the form fields are unregistered when the
    // form leaves the screen, so the watched role is no longer reliable then.
    const [ created, setCreated ] = useState<{ email: string, isCompany: boolean } | null>( null )

    async function onSubmit( form: RegisterForm ) {
        setServerError( null )

        try {
            await registerAccount( toRegisterInput( form ) )
            setCreated( { email: form.email.trim(), isCompany: form.role === "company" } )
        } catch( error ) {
            const { apiError, handled } = applyFieldErrors( error, setError, FIELD_NAMES )

            if( apiError.status === 409 ) {
                // "Email already registered": it is about one field.
                setError( "email", { type: "server", message: apiError.message } )
            } else if( !handled ) {
                setServerError( apiError.message )
            }
        }
    }

    if( created ) {
        return (
            <>
                <AuthHeading title="Revisa tu correo" subtitle="Tu cuenta está creada, falta un paso" />
                <Alert tone="success">
                    Enviamos un enlace de verificación a <strong>{ created.email }</strong>. Ábrelo para activar tu
                    cuenta; vence en 24 horas.
                    { created.isCompany && " Después, un administrador revisará tu empresa antes de que puedas publicar vacantes." }
                </Alert>
                <AuthFooter>
                    <Link to="/login" className={ linkClasses }>Ir a iniciar sesión</Link>
                    <Link to="/resend-verification" className="text-[12.5px] font-medium underline-offset-4 hover:underline">
                        ¿No llegó? Reenviar verificación
                    </Link>
                </AuthFooter>
            </>
        )
    }

    return (
        <>
            <AuthHeading title="Crea tu cuenta" subtitle="Elige el tipo de cuenta y completa tus datos" />

            { serverError && <Alert tone="error">{ serverError }</Alert> }

            <form onSubmit={ handleSubmit( onSubmit ) } noValidate className="flex flex-col gap-[22px]">

                {/* Radio buttons drawn as cards: one choice out of four. */}
                <fieldset className="flex flex-col gap-1.5">
                    <legend className="mb-1.5 text-[13px] font-semibold text-foreground">Tipo de cuenta</legend>
                    <div className="grid grid-cols-2 gap-2.5">
                        { ROLE_OPTIONS.map( ( option ) => (
                            <label
                                key={ option.value }
                                className={ cn(
                                    "flex cursor-pointer flex-col gap-0.5 rounded-[10px] border-2 border-input bg-card px-3.5 py-2.5",
                                    "has-checked:border-primary has-checked:bg-warning-soft has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring"
                                ) }
                            >
                                <input type="radio" value={ option.value } className="sr-only" { ...register( "role" ) } />
                                <span className="text-sm font-bold text-foreground">{ ROLE_LABELS[ option.value ] }</span>
                                <span className="text-[12.5px] text-muted-foreground">{ option.description }</span>
                            </label>
                        ) ) }
                    </div>
                </fieldset>

                <div className="flex flex-col gap-4">
                    <TextField
                        label="Correo electrónico"
                        type="email"
                        autoComplete="email"
                        placeholder="tucorreo@ejemplo.com"
                        error={ errors.email?.message }
                        { ...register( "email", emailRules ) }
                    />
                    <TextField
                        label="Contraseña"
                        type="password"
                        autoComplete="new-password"
                        hint={ PASSWORD_HINT }
                        error={ errors.password?.message }
                        { ...register( "password", newPasswordRules ) }
                    />
                    <TextField
                        label="Teléfono"
                        type="tel"
                        optional
                        autoComplete="tel"
                        placeholder="10 dígitos"
                        error={ errors.phone?.message }
                        { ...register( "phone", {
                            pattern: { value: /^\+?\d{10,15}$/, message: "Escribe solo números, 10 dígitos." },
                        } ) }
                    />

                    { !isCompany && (
                        <SelectField
                            label="Carrera"
                            optional
                            error={ errors.careerId?.message }
                            hint={ careers.error ? "No pudimos cargar las carreras; puedes elegirla después en tu perfil." : undefined }
                            { ...register( "careerId" ) }
                        >
                            <option value="">{ careers.isLoading ? "Cargando carreras…" : "Sin especificar" }</option>
                            { careers.data?.map( ( career ) => (
                                <option key={ career.id } value={ career.id }>{ career.name }</option>
                            ) ) }
                        </SelectField>
                    ) }

                    { role === "student" && (
                        <TextField
                            label="Semestre"
                            type="number"
                            inputMode="numeric"
                            min={ 1 }
                            max={ 12 }
                            error={ errors.semester?.message }
                            { ...register( "semester", {
                                required: "Indica tu semestre.",
                                validate: ( value ) => {
                                    const n = Number( value )
                                    return ( Number.isInteger( n ) && n >= 1 && n <= 12 ) || "El semestre debe estar entre 1 y 12."
                                },
                            } ) }
                        />
                    ) }

                    { role === "intern" && (
                        <>
                            <TextField label="Empresa donde haces tu residencia" optional error={ errors.hostCompany?.message } { ...register( "hostCompany" ) } />
                            <TextField label="Proyecto" optional error={ errors.project?.message } { ...register( "project" ) } />
                            <div className="grid grid-cols-2 gap-3">
                                <TextField label="Inicio" type="date" optional error={ errors.startDate?.message } { ...register( "startDate" ) } />
                                <TextField
                                    label="Término"
                                    type="date"
                                    optional
                                    error={ errors.endDate?.message }
                                    { ...register( "endDate", {
                                        validate: ( value, form ) => (
                                            !value || !form.startDate || value >= form.startDate || "Debe ser posterior al inicio."
                                        ),
                                    } ) }
                                />
                            </div>
                        </>
                    ) }

                    { role === "graduate" && (
                        <>
                            <TextField
                                label="Año de egreso"
                                type="number"
                                inputMode="numeric"
                                min={ 1965 }
                                max={ CURRENT_YEAR }
                                error={ errors.graduationYear?.message }
                                { ...register( "graduationYear", {
                                    required: "Indica tu año de egreso.",
                                    validate: ( value ) => {
                                        const n = Number( value )
                                        return ( Number.isInteger( n ) && n >= 1965 && n <= CURRENT_YEAR ) || `Escribe un año entre 1965 y ${ CURRENT_YEAR }.`
                                    },
                                } ) }
                            />
                            <TextField label="Puesto actual" optional error={ errors.currentJob?.message } { ...register( "currentJob" ) } />
                        </>
                    ) }

                    { isCompany && (
                        <>
                            <TextField
                                label="Nombre de la empresa"
                                autoComplete="organization"
                                error={ errors.name?.message }
                                { ...register( "name", { required: REQUIRED, maxLength: { value: 100, message: "Máximo 100 caracteres." } } ) }
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <SelectField label="Tamaño" error={ errors.size?.message } { ...register( "size", { required: "Selecciona el tamaño." } ) }>
                                    <option value="">Selecciona</option>
                                    { Object.entries( COMPANY_SIZE_LABELS ).map( ( [ value, label ] ) => (
                                        <option key={ value } value={ value }>{ label }</option>
                                    ) ) }
                                </SelectField>
                                <TextField label="Giro" placeholder="Ej. Manufactura" error={ errors.industry?.message } { ...register( "industry", { required: REQUIRED } ) } />
                            </div>
                            <TextField
                                label="Correo de contacto"
                                type="email"
                                optional
                                hint="A este correo llegan los CV de quienes se postulan."
                                error={ errors.contact_email?.message }
                                { ...register( "contact_email", { pattern: emailRules.pattern } ) }
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <TextField label="Ciudad" optional autoComplete="address-level2" error={ errors.city?.message } { ...register( "city" ) } />
                                <TextField label="Estado" optional autoComplete="address-level1" error={ errors.state?.message } { ...register( "state" ) } />
                            </div>
                            <TextField label="Dirección" optional autoComplete="street-address" error={ errors.address?.message } { ...register( "address" ) } />
                        </>
                    ) }
                </div>

                <Button type="submit" size="lg" loading={ isSubmitting }>
                    { isSubmitting ? "Creando cuenta" : "Crear cuenta" }
                </Button>
            </form>

            <AuthFooter>
                <span>¿Ya tienes cuenta? <Link to="/login" className={ linkClasses }>Inicia sesión</Link></span>
            </AuthFooter>
        </>
    )
}

export { RegisterPage }
