// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Calls to /api/company: the profile of the company that belongs
//      to the logged-in user.
//
// Date: November 16th 2026

// Latest Update: toggle-active now pauses or resumes the company instead
//      of deactivating the account.
// Date: November 16th 2026
// By: Miguel Angel Avila Garcia

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

// Pauses the company when it is active and resumes it when paused. While
// paused its postings are hidden from candidates; the account keeps
// working, so the company can undo this itself. Returns the new state.
async function toggleMyCompanyActive(): Promise<boolean> {
    const { data } = await api.patch<ApiResponse<{ active: boolean }>>( "/company/toggle-active" )
    return data.data.active
}

export { getMyCompany, updateMyCompany, toggleMyCompanyActive }
