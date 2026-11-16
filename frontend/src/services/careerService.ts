// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Calls to /api/careers: the catalog of careers used in the
//      register form, the profile and the job posting form. Public, no
//      session needed.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { api } from "@/services/api.ts"
import { toCareer } from "@/services/mappers.ts"
import type { Row } from "@/services/mappers.ts"
import type { ApiResponse } from "@/types/api.ts"
import type { Career } from "@/types/models.ts"

// Already sorted by name by the backend.
async function getCareers(): Promise<Career[]> {
    const { data } = await api.get<ApiResponse<Row[]>>( "/careers" )
    return data.data.map( toCareer )
}

export { getCareers }
