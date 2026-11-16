// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Calls to /api/company: the profile of the company that belongs
//      to the logged-in user.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { api } from "@/services/api.ts"
import { toCompany, toCompanyBody } from "@/services/mappers.ts"
import type { Row } from "@/services/mappers.ts"
import type { ApiResponse } from "@/types/api.ts"
import type { Company, CompanyInput } from "@/types/models.ts"

async function getMyCompany(): Promise<Company> {
    const { data } = await api.get<ApiResponse<Row>>( "/company/me" )
    return toCompany( data.data )
}

// PUT /company/me requires every field, so the form always sends them all.
// It answers without the company, so it is read again to return it fresh.
async function updateMyCompany( input: CompanyInput ): Promise<Company> {
    await api.put( "/company/me", toCompanyBody( input ) )
    return getMyCompany()
}

// Flips the active flag of the company ACCOUNT. Once inactive the backend
// rejects every request and every login of that account, so from the
// company side this is a one-way action: only an admin can undo it.
async function deactivateMyCompany(): Promise<void> {
    await api.patch( "/company/toggle-active" )
}

export { getMyCompany, updateMyCompany, deactivateMyCompany }
