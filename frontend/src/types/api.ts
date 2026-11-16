// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Shapes of what travels over HTTP. Every backend response is {
//      success, message?, data? }; every error is { success: false,
//      message } and the 422 ones add errors[] from express-validator.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

// One entry of errors[] in a 422 response (express-validator format).
interface ValidationIssue {
    type: string
    msg: string
    path: string        // name of the body field that failed, e.g. "email"
    location: string
    value?: unknown
}

interface ApiErrorBody {
    success: false
    message: string
    errors?: ValidationIssue[]
}

interface ApiResponse<T> {
    success: true
    message?: string
    data: T
}

// status 0 means the request never got an answer (server down, CORS, offline).
const NETWORK_ERROR_STATUS = 0

// Single error type the whole UI handles. Services never let a raw axios
// error escape, so a screen only needs: err.message to show, err.status to
// branch on, and err.fieldErrors to mark inputs.
class ApiError extends Error {
    status: number
    fieldErrors: Record<string, string>

    constructor( message: string, status: number, fieldErrors: Record<string, string> = {} ) {
        super( message )
        this.name = "ApiError"
        this.status = status
        this.fieldErrors = fieldErrors
    }
}

export { ApiError, NETWORK_ERROR_STATUS }
export type { ValidationIssue, ApiErrorBody, ApiResponse }
