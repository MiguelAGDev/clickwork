// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Validation rules for react-hook-form, shared by the forms. They
//      repeat the backend rules (express-validator) so the user gets the
//      answer while typing; the backend still has the last word.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import type { RegisterOptions } from "react-hook-form"

import { toApiError } from "@/services/api.ts"
import type { ApiError } from "@/types/api.ts"

const REQUIRED = "Este campo es obligatorio."

const emailRules = {
    required: "Escribe tu correo.",
    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Escribe un correo válido." },
} satisfies RegisterOptions

// Same three rules as the backend: 8 characters, one uppercase, one number.
const newPasswordRules = {
    required: "Escribe una contraseña.",
    minLength: { value: 8, message: "La contraseña debe tener al menos 8 caracteres." },
    validate: {
        uppercase: ( value: string ) => /[A-Z]/.test( value ) || "La contraseña debe incluir al menos una mayúscula.",
        number: ( value: string ) => /[0-9]/.test( value ) || "La contraseña debe incluir al menos un número.",
    },
} satisfies RegisterOptions

const PASSWORD_HINT = "Mínimo 8 caracteres, con una mayúscula y un número."

// Same limit as the backend (and the varchar(150) column).
const NAME_MAX = 150

const firstNameRules = {
    required: "Escribe tu nombre.",
    validate: ( value: string ) => value.trim().length > 0 || "Escribe tu nombre.",
    maxLength: { value: NAME_MAX, message: `El nombre no puede pasar de ${ NAME_MAX } caracteres.` },
} satisfies RegisterOptions

const lastNameRules = {
    required: "Escribe tu apellido.",
    validate: ( value: string ) => value.trim().length > 0 || "Escribe tu apellido.",
    maxLength: { value: NAME_MAX, message: `El apellido no puede pasar de ${ NAME_MAX } caracteres.` },
} satisfies RegisterOptions

// Marks on the form the fields the backend rejected (422). "fields" is the
// list of names the form really has: an error for any other field cannot
// be shown next to an input, so it is reported back as not handled.
// Returns true when every backend field error found its input.
function applyFieldErrors<Name extends string>(
    error: unknown,
    setError: ( name: Name, error: { type: string, message: string } ) => void,
    fields: readonly Name[]
): { apiError: ApiError, handled: boolean } {
    const apiError = toApiError( error )
    const entries = Object.entries( apiError.fieldErrors )
    let matched = 0

    for( const [ path, message ] of entries ) {
        if( ( fields as readonly string[] ).includes( path ) ) {
            setError( path as Name, { type: "server", message } )
            matched++
        }
    }

    return { apiError, handled: entries.length > 0 && matched === entries.length }
}

export { REQUIRED, emailRules, newPasswordRules, firstNameRules, lastNameRules, PASSWORD_HINT, applyFieldErrors }
