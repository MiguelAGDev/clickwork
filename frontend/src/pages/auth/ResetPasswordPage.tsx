// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Landing page of the link in the "reset your password" email
//      (/reset-password/:token). Asks for the new password and sends it
//      with the token.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link, useNavigate, useParams } from "react-router-dom"

import { AuthFooter, AuthHeading } from "@/components/layout/AuthHeading.tsx"
import { Alert } from "@/components/ui/Alert.tsx"
import { Button } from "@/components/ui/Button.tsx"
import { TextField } from "@/components/ui/Field.tsx"
import { linkClasses } from "@/components/ui/linkClasses.ts"
import { applyFieldErrors, newPasswordRules, PASSWORD_HINT } from "@/lib/validation.ts"
import { resetPassword } from "@/services/authService.ts"
import type { ApiError } from "@/types/api.ts"
import type { LoginLocationState } from "@/pages/auth/LoginPage.tsx"

interface ResetForm {
    password: string
    confirm: string
}

function ResetPasswordPage() {
    const { token = "" } = useParams()
    const navigate = useNavigate()
    const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<ResetForm>()
    const [ serverError, setServerError ] = useState<ApiError | null>( null )

    async function onSubmit( { password }: ResetForm ) {
        setServerError( null )

        try {
            await resetPassword( token, password )

            // Back to the login with a message it knows how to show.
            const state: LoginLocationState = { notice: "Tu contraseña se actualizó. Ya puedes iniciar sesión." }
            navigate( "/login", { replace: true, state } )
        } catch( error ) {
            const { apiError, handled } = applyFieldErrors( error, setError, [ "password" ] as const )
            if( !handled ) setServerError( apiError )
        }
    }

    // 400 = the link is not valid, 410 = it expired. Either way the fix is
    // the same: ask for a new one.
    const linkIsDead = serverError?.status === 400 || serverError?.status === 410

    return (
        <>
            <AuthHeading title="Crea una contraseña nueva" subtitle="Será la que uses para entrar a partir de ahora" />

            { serverError && (
                <Alert tone="error">
                    { serverError.message }
                    { linkIsDead && (
                        <> <Link to="/forgot-password" className="font-bold underline">Pedir un enlace nuevo</Link></>
                    ) }
                </Alert>
            ) }

            <form onSubmit={ handleSubmit( onSubmit ) } noValidate className="flex flex-col gap-[22px]">
                <div className="flex flex-col gap-4">
                    <TextField
                        label="Nueva contraseña"
                        type="password"
                        autoComplete="new-password"
                        hint={ PASSWORD_HINT }
                        error={ errors.password?.message }
                        { ...register( "password", newPasswordRules ) }
                    />
                    <TextField
                        label="Repite la contraseña"
                        type="password"
                        autoComplete="new-password"
                        error={ errors.confirm?.message }
                        { ...register( "confirm", {
                            required: "Repite la contraseña.",
                            validate: ( value, form ) => value === form.password || "Las contraseñas no coinciden.",
                        } ) }
                    />
                </div>

                <Button type="submit" size="lg" loading={ isSubmitting }>Guardar contraseña</Button>
            </form>

            <AuthFooter>
                <Link to="/login" className={ linkClasses }>Volver a iniciar sesión</Link>
            </AuthFooter>
        </>
    )
}

export { ResetPasswordPage }
