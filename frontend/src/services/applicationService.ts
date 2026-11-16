// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Calls to /api/applications: a candidate applies and lists its
//      own applications; a company lists who applied to one of its
//      postings and moves an application between statuses.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { api } from "@/services/api.ts"
import { toApplicant, toApplication } from "@/services/mappers.ts"
import type { Row } from "@/services/mappers.ts"
import type { ApiResponse } from "@/types/api.ts"
import type { Applicant, Application, ApplicationStatus } from "@/types/models.ts"

// Applies without sending the CV by email (see userService.rollMe for the
// variant that does). 409 if the user already applied to this posting.
async function applyToJob( jobPostingId: number ): Promise<void> {
    await api.post( "/applications", { job_posting_id: jobPostingId } )
}

async function getMyApplications(): Promise<Application[]> {
    const { data } = await api.get<ApiResponse<Row[]>>( "/applications/me" )
    return data.data.map( toApplication )
}

// Only the company that owns the posting may read this (403 otherwise).
async function getApplicants( jobPostingId: number ): Promise<Applicant[]> {
    const { data } = await api.get<ApiResponse<Row[]>>( `/applications/company/applicants/${ jobPostingId }` )
    return data.data.map( toApplicant )
}

// Any status can follow any other: the backend does not restrict the
// direction on purpose, so a company can reconsider a decision.
async function updateApplicationStatus( applicationId: number, status: ApplicationStatus ): Promise<void> {
    await api.patch( `/applications/${ applicationId }/status`, { status } )
}

export { applyToJob, getMyApplications, getApplicants, updateApplicationStatus }
