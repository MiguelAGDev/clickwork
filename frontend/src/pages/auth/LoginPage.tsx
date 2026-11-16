// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Login form (design D2). Sends the credentials to the backend
//      through the auth context and shows why it failed when it does.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link, useLocation } from "react-router-dom"

import { AuthFooter, AuthHeading } from "@/components/layout/AuthHeading.tsx"
import { Alert } from "@/components/ui/Alert.tsx"
import { Button } from "@/components/ui/Button.tsx"
import { TextField } from "@/components/ui/Field.tsx"
import { linkClasses } from "@/components/ui/linkClasses.ts"
import { useAuth } from "@/hooks/useAuth.ts"
import { toApiError } from "@/services/api.ts"
import { emailRules } from "@/lib/validation.ts"

interface LoginForm {
    email: string
    password: string
}

// What other screens can leave for the login through the router state.
interface LoginLocationState {
    from?: string       // where the user was going before being sent here
    notice?: string     // a success message to show (password changed...)
}

function LoginPage() {
    const { login, sessionExpired, logoutNotice } = useAuth()
    const location = useLocation()
    const state = location.state as LoginLocationState | null

    // react-hook-form keeps the field values and their validation, so
    // there is no useState per input.
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>()

    // The answer of the backend when it rejects the login. Local state:
    // only this screen cares about it.
    const [ serverError, setServerError ] = useState<string | null>( null )

    async function onSubmit( values: LoginForm ) {
        setServerError( null )

        try {
            // No navigate() here: once the session exists, PublicOnlyRoute
            // (the guard around this page) sends the user to the dashboard,
            // or back to the page they were trying to open.
            await login( values.email, values.password )
        } catch( error ) {
            setServerError( toApiError( error ).message )
        }
    }

    return (
        <>
            <AuthHeading title="Inicia sesión" subtitle="Entra con tu correo y tu contraseña" />

            { sessionExpired && !serverError && (
                <Alert tone="info">Tu sesión expiró. Inicia sesión de nuevo.</Alert>
            ) }
            { state?.notice && !serverError && <Alert tone="success">{ state.notice }</Alert> }
            { logoutNotice && !serverError && <Alert tone="info">{ logoutNotice }</Alert> }
            { serverError && <Alert tone="error">{ serverError }</Alert> }

            {/* noValidate: the messages come from react-hook-form, in
                Spanish and next to each field, not from the browser bubbles. */}
            <form onSubmit={ handleSubmit( onSubmit ) } noValidate className="flex flex-col gap-[22px]">
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
                        autoComplete="current-password"
                        placeholder="••••••••"
                        error={ errors.password?.message }
                        labelAction={
                            <Link to="/forgot-password" className={ `${ linkClasses } text-[12.5px]` }>¿La olvidaste?</Link>
                        }
                        { ...register( "password", { required: "Escribe tu contraseña." } ) }
                    />
                </div>

                <Button type="submit" size="lg" loading={ isSubmitting }>
                    { isSubmitting ? "Entrando" : "Iniciar sesión" }
                </Button>
            </form>

            <AuthFooter>
                <span>¿No tienes cuenta? <Link to="/register" className={ linkClasses }>Regístrate</Link></span>
                <Link to="/resend-verification" className="text-[12.5px] font-medium underline-offset-4 hover:underline">
                    ¿No verificaste tu correo? Reenviar verificación
                </Link>
            </AuthFooter>
        </>
    )
}

export { LoginPage }
export type { LoginLocationState }
