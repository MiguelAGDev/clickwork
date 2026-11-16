// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Two public screens ask for an email and answer "if it exists, we
//      sent you a link": forgot password and resend verification. This
//      is that screen once, and the two routes that use it.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"

import { AuthFooter, AuthHeading } from "@/components/layout/AuthHeading.tsx"
import { Alert } from "@/components/ui/Alert.tsx"
import { Button } from "@/components/ui/Button.tsx"
import { TextField } from "@/components/ui/Field.tsx"
import { linkClasses } from "@/components/ui/linkClasses.ts"
import { emailRules } from "@/lib/validation.ts"
import { toApiError } from "@/services/api.ts"
import { forgotPassword, resendVerification } from "@/services/authService.ts"

interface EmailRequestProps {
    title: string
    subtitle: string
    submitLabel: string
    // Shown after a successful request. The backend answers the same
    // whether the email is registered or not, and so does this text: it
    // must never confirm that an account exists.
    successMessage: string
    send: ( email: string ) => Promise<void>
}

function EmailRequest( { title, subtitle, submitLabel, successMessage, send }: EmailRequestProps ) {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<{ email: string }>()
    const [ serverError, setServerError ] = useState<string | null>( null )
    const [ sent, setSent ] = useState( false )

    async function onSubmit( { email }: { email: string } ) {
        setServerError( null )
        setSent( false )

        try {
            await send( email.trim() )
            setSent( true )
        } catch( error ) {
            // In practice: a 429 (these endpoints allow very few tries).
            setServerError( toApiError( error ).message )
        }
    }

    return (
        <>
            <AuthHeading title={ title } subtitle={ subtitle } />

            { sent && <Alert tone="info">{ successMessage }</Alert> }
            { serverError && <Alert tone="error">{ serverError }</Alert> }

            <form onSubmit={ handleSubmit( onSubmit ) } noValidate className="flex flex-col gap-[22px]">
                <TextField
                    label="Correo electrónico"
                    type="email"
                    autoComplete="email"
                    placeholder="tucorreo@ejemplo.com"
                    error={ errors.email?.message }
                    { ...register( "email", emailRules ) }
                />
                <Button type="submit" size="lg" loading={ isSubmitting }>{ submitLabel }</Button>
            </form>

            <AuthFooter>
                <Link to="/login" className={ linkClasses }>Volver a iniciar sesión</Link>
            </AuthFooter>
        </>
    )
}

function ForgotPasswordPage() {
    return (
        <EmailRequest
            title="Recupera tu contraseña"
            subtitle="Te enviamos un enlace para crear una nueva"
            submitLabel="Enviar enlace"
            successMessage="Si tu correo existe, te enviamos un enlace para restablecer tu contraseña. Vence en una hora."
            send={ forgotPassword }
        />
    )
}

function ResendVerificationPage() {
    return (
        <EmailRequest
            title="Reenviar verificación"
            subtitle="Te enviamos de nuevo el enlace para activar tu cuenta"
            submitLabel="Reenviar enlace"
            successMessage="Si tu correo está registrado y aún no está verificado, te enviamos un nuevo enlace. Vence en 24 horas."
            send={ resendVerification }
        />
    )
}

export { ForgotPasswordPage, ResendVerificationPage }
