// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Landing page of the link in the verification email
//      (/verify/:token). It sends the token to the backend as soon as it
//      opens and tells the user how it went.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { Link, useParams } from "react-router-dom"

import { AuthFooter, AuthHeading } from "@/components/layout/AuthHeading.tsx"
import { Alert } from "@/components/ui/Alert.tsx"
import { buttonClasses } from "@/components/ui/buttonClasses.ts"
import { linkClasses } from "@/components/ui/linkClasses.ts"
import { LoadingState } from "@/components/ui/States.tsx"
import { useAsyncData } from "@/hooks/useAsyncData.ts"
import { verifyEmail } from "@/services/authService.ts"

// A verification token works once: the backend deletes it when it is used.
// In development React runs effects twice on purpose (StrictMode), so the
// same token would be sent twice and the second answer ("invalid link")
// would replace the first ("verified"). Remembering the request of each
// token makes both runs share one single call.
const requests = new Map<string, Promise<void>>()

function verifyOnce( token: string ): Promise<void> {
    let request = requests.get( token )

    if( !request ) {
        request = verifyEmail( token )
        requests.set( token, request )
    }

    return request
}

function VerifyEmailPage() {
    const { token = "" } = useParams()
    const { isLoading, error } = useAsyncData( `verify:${ token }`, () => verifyOnce( token ) )

    if( isLoading ) {
        return (
            <>
                <AuthHeading title="Verificando tu correo" />
                <LoadingState label="Un momento" className="py-6" />
            </>
        )
    }

    if( error ) {
        return (
            <>
                <AuthHeading title="No pudimos verificar tu correo" />
                <Alert tone="error">{ error.message }</Alert>
                <Link to="/resend-verification" className={ buttonClasses( { size: "lg" } ) }>
                    Pedir un enlace nuevo
                </Link>
                <AuthFooter>
                    <Link to="/login" className={ linkClasses }>Volver a iniciar sesión</Link>
                </AuthFooter>
            </>
        )
    }

    return (
        <>
            <AuthHeading title="Correo verificado" subtitle="Tu cuenta ya está activa" />
            <Alert tone="success">Listo. Ya puedes entrar con tu correo y tu contraseña.</Alert>
            <Link to="/login" className={ buttonClasses( { size: "lg" } ) }>Iniciar sesión</Link>
        </>
    )
}

export { VerifyEmailPage }
