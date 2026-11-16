// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Calls to /api/auth: login, register, email verification and
//      password recovery. None of them needs a session.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { api } from "@/services/api.ts"
import type { CompanySize, Role } from "@/types/models.ts"

// What POST /auth/login returns besides success. The token is the session;
// "user" is only a summary, the full profile comes from GET /users/me.
interface LoginResult {
    token: string
    user: { id: number, email: string, role: Role }
}

// Body of POST /auth/register. The field names are the ones the backend
// validates (that is why contact_email is the only snake_case one), so a
// 422 error path can be matched to a form field with no translation table.
interface RegisterInput {
    role: Exclude<Role, "admin">    // admin accounts are not self-registered
    email: string
    password: string
    phone?: string
    careerId?: number
    semester?: number               // student (required)
    hostCompany?: string            // intern
    project?: string                // intern
    startDate?: string              // intern
    endDate?: string                // intern
    graduationYear?: number         // graduate (required)
    currentJob?: string             // graduate
    name?: string                   // company (required)
    size?: CompanySize              // company (required)
    industry?: string               // company (required)
    city?: string                   // company
    state?: string                  // company
    address?: string                // company
    contact_email?: string          // company
}

async function login( email: string, password: string ): Promise<LoginResult> {
    const { data } = await api.post<LoginResult>(
        "/auth/login",
        { email, password },
        { skipSessionExpiry: true }     // 401 here means "wrong credentials".
    )
    return { token: data.token, user: data.user }
}

async function register( input: RegisterInput ): Promise<void> {
    await api.post( "/auth/register", input )
}

async function verifyEmail( token: string ): Promise<void> {
    await api.get( `/auth/verify/${ encodeURIComponent( token ) }` )
}

// The backend always answers 200, whether the email exists or not, so
// nobody can use this to find out which emails are registered.
async function resendVerification( email: string ): Promise<void> {
    await api.post( "/auth/resend-verification", { email } )
}

// Same rule as above: always 200.
async function forgotPassword( email: string ): Promise<void> {
    await api.post( "/auth/forgot-password", { email } )
}

async function resetPassword( token: string, password: string ): Promise<void> {
    await api.post( `/auth/reset-password/${ encodeURIComponent( token ) }`, { password } )
}

export { login, register, verifyEmail, resendVerification, forgotPassword, resetPassword }
export type { LoginResult, RegisterInput }
