// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Calls to /api/users: the logged-in user profile, password
//      change, CV upload and Roll Me (apply and send the CV by email).
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { api } from "@/services/api.ts"
import { toUser } from "@/services/mappers.ts"
import type { Row } from "@/services/mappers.ts"
import type { ApiResponse } from "@/types/api.ts"
import type { User } from "@/types/models.ts"

// Fields PUT /users/me accepts. Which role fields apply depends on the
// role in the token; the backend ignores the ones of other roles.
interface ProfileInput {
    firstName: string
    lastName: string
    phone: string
    careerId: number | null
    semester?: number | null        // student
    hostCompany?: string | null     // intern
    project?: string | null         // intern
    endDate?: string | null         // intern
    currentJob?: string | null      // graduate
}

const CV_MAX_BYTES = 5 * 1024 * 1024     // Same limit as the backend (multer).

async function getMe(): Promise<User> {
    const { data } = await api.get<ApiResponse<Row>>( "/users/me" )
    return toUser( data.data )
}

// Returns the fresh profile. PUT /users/me answers without the role or the
// role fields, so the complete user is read again with GET /users/me.
async function updateMe( input: ProfileInput ): Promise<User> {
    await api.put( "/users/me", input )
    return getMe()
}

async function changePassword( currentPassword: string, newPassword: string ): Promise<void> {
    await api.put(
        "/users/password",
        { currentPassword, newPassword },
        { skipSessionExpiry: true }     // 401 here means "wrong current password".
    )
}

// The backend expects multipart/form-data with the file in the "cv" field.
async function uploadCv( file: File ): Promise<User> {
    const form = new FormData()
    form.append( "cv", file )
    await api.post( "/users/cv", form )
    return getMe()
}

// Creates the application AND emails the CV to the company. If the email
// fails the backend undoes the application and answers 502.
async function rollMe( jobPostingId: number ): Promise<void> {
    await api.post( "/users/roll-me", { jobPostingId } )
}

export { getMe, updateMe, changePassword, uploadCv, rollMe, CV_MAX_BYTES }
export type { ProfileInput }
