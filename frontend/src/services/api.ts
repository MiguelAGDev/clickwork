// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      The one HTTP client of the app. It knows the API URL, attaches
//      the session token to every request and turns any failure into an
//      ApiError with a Spanish message. Screens and services never
//      touch axios directly.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import axios, { AxiosError } from "axios"

import { translateApiMessage } from "@/lib/apiMessages.ts"
import { getToken } from "@/services/tokenStorage.ts"
import { ApiError, NETWORK_ERROR_STATUS } from "@/types/api.ts"
import type { ApiErrorBody } from "@/types/api.ts"

// Extra per-request option. A 401 normally means "your session is over",
// but two endpoints answer 401 for another reason: /auth/login (wrong
// password) and /users/password (wrong current password). They set this
// flag so a typo does not log the user out.
declare module "axios" {
    interface AxiosRequestConfig {
        skipSessionExpiry?: boolean
    }
}

const api = axios.create( {
    // VITE_API_URL is the backend origin; every route lives under /api.
    baseURL: `${ import.meta.env.VITE_API_URL }/api`,
} )

// The auth context registers here what to do when the session dies. A
// callback (instead of importing the context) keeps this file free of React.
let onSessionExpired: ( () => void ) | null = null

function setSessionExpiredHandler( handler: ( () => void ) | null ): void {
    onSessionExpired = handler
}

// Before every request: send the token if there is one.
api.interceptors.request.use( ( config ) => {
    const token = getToken()
    if( token ) {
        config.headers.Authorization = `Bearer ${ token }`
    }
    return config
} )

// Turns whatever axios threw into the ApiError the UI understands.
function toApiError( error: unknown ): ApiError {
    if( error instanceof ApiError ) return error

    if( error instanceof AxiosError && error.response ) {
        const status = error.response.status
        const body = error.response.data as Partial<ApiErrorBody> | undefined

        // 422: one message per field, keyed by the body field name, so a
        // form can show each one next to its input.
        const fieldErrors: Record<string, string> = {}
        for( const issue of body?.errors ?? [] ) {
            // Keep the first message of each field: the validators run in
            // order, so the first one is the most basic rule that failed.
            if( issue.path && !fieldErrors[ issue.path ] ) {
                fieldErrors[ issue.path ] = translateApiMessage( issue.msg, status )
            }
        }

        return new ApiError( translateApiMessage( body?.message, status ), status, fieldErrors )
    }

    // No response at all: backend down, CORS rejection or no network.
    return new ApiError( translateApiMessage( undefined, NETWORK_ERROR_STATUS ), NETWORK_ERROR_STATUS )
}

// After every response: normalize errors and detect a dead session.
api.interceptors.response.use(
    ( response ) => response,
    ( error: unknown ) => {
        const apiError = toApiError( error )
        const skip = error instanceof AxiosError && error.config?.skipSessionExpiry

        if( apiError.status === 401 && !skip ) {
            onSessionExpired?.()
        }

        return Promise.reject( apiError )
    }
)

export { api, toApiError, setSessionExpiredHandler }
