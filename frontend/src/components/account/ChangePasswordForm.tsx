// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Form to change the password of the logged-in user. Shared by the
//      profile of every role.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { useState } from "react"
import { useForm } from "react-hook-form"

import { Alert } from "@/components/ui/Alert.tsx"
import { Button } from "@/components/ui/Button.tsx"
import { SectionCard } from "@/components/ui/Card.tsx"
import { TextField } from "@/components/ui/Field.tsx"
import { applyFieldErrors, newPasswordRules, PASSWORD_HINT } from "@/lib/validation.ts"
import { changePassword } from "@/services/userService.ts"

interface PasswordForm {
    currentPassword: string
    newPassword: string
    confirm: string
}

function ChangePasswordForm() {
    const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<PasswordForm>()
    const [ serverError, setServerError ] = useState<string | null>( null )
    const [ saved, setSaved ] = useState( false )

    async function onSubmit( { currentPassword, newPassword }: PasswordForm ) {
        setServerError( null )
        setSaved( false )

        try {
            await changePassword( currentPassword, newPassword )
            reset()     // Never leave passwords sitting in the inputs.
            setSaved( true )
        } catch( error ) {
            const { apiError, handled } = applyFieldErrors( error, setError, [ "currentPassword", "newPassword" ] as const )

            if( apiError.status === 401 ) {
                // Here 401 means "wrong current password", not "session over".
                setError( "currentPassword", { type: "server", message: apiError.message } )
            } else if( apiError.status === 400 ) {
                // "New password must be different from the current one".
                setError( "newPassword", { type: "server", message: apiError.message } )
            } else if( !handled ) {
                setServerError( apiError.message )
            }
        }
    }

    return (
        <SectionCard title="Contraseña" description="Cámbiala cuando quieras. La sesión actual sigue abierta.">
            { saved && <Alert tone="success">Tu contraseña se actualizó.</Alert> }
            { serverError && <Alert tone="error">{ serverError }</Alert> }

            <form onSubmit={ handleSubmit( onSubmit ) } noValidate className="flex flex-col gap-4">
                <TextField
                    label="Contraseña actual"
                    type="password"
                    autoComplete="current-password"
                    error={ errors.currentPassword?.message }
                    wrapperClassName="sm:max-w-sm"
                    { ...register( "currentPassword", { required: "Escribe tu contraseña actual." } ) }
                />
                <div className="grid gap-4 sm:grid-cols-2">
                    <TextField
                        label="Nueva contraseña"
                        type="password"
                        autoComplete="new-password"
                        hint={ PASSWORD_HINT }
                        error={ errors.newPassword?.message }
                        { ...register( "newPassword", {
                            ...newPasswordRules,
                            validate: {
                                ...newPasswordRules.validate,
                                different: ( value, form ) => value !== form.currentPassword || "La nueva contraseña debe ser distinta a la actual.",
                            },
                        } ) }
                    />
                    <TextField
                        label="Repite la nueva contraseña"
                        type="password"
                        autoComplete="new-password"
                        error={ errors.confirm?.message }
                        { ...register( "confirm", {
                            required: "Repite la nueva contraseña.",
                            validate: ( value, form ) => value === form.newPassword || "Las contraseñas no coinciden.",
                        } ) }
                    />
                </div>

                <div>
                    <Button type="submit" loading={ isSubmitting }>Cambiar contraseña</Button>
                </div>
            </form>
        </SectionCard>
    )
}

export { ChangePasswordForm }
