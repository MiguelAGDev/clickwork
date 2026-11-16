// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Calls to /api/announcements (job postings): the public list of
//      approved postings, one posting, and the postings a company owns,
//      creates and edits.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { api } from "@/services/api.ts"
import { toJobPosting, toJobPostingBody } from "@/services/mappers.ts"
import type { Row } from "@/services/mappers.ts"
import type { ApiResponse } from "@/types/api.ts"
import type { ContractType, ExperienceLevel, JobPosting, JobPostingInput, Modality } from "@/types/models.ts"

interface JobPostingFilters {
    search?: string
    modality?: Modality | ""
    contractType?: ContractType | ""
    experienceLevel?: ExperienceLevel | ""
}

// The list joins job_posting_career, so a posting linked to several
// careers comes back once per career. Keep the first of each id.
function dedupeById( postings: JobPosting[] ): JobPosting[] {
    const seen = new Set<number>()
    return postings.filter( ( posting ) => {
        if( seen.has( posting.id ) ) return false
        seen.add( posting.id )
        return true
    } )
}

// Approved postings only (the backend filters by status).
async function getJobPostings( filters: JobPostingFilters = {} ): Promise<JobPosting[]> {
    // Only "search" and "modality" are sent: they are the filters the
    // backend really applies today. Contract type and experience level are
    // accepted by the route but never reach the SQL, so they are applied
    // here, on the result, to behave the same once the backend is fixed.
    const params: Record<string, string> = {}
    if( filters.search?.trim() ) params.search = filters.search.trim()
    if( filters.modality ) params.modality = filters.modality

    const { data } = await api.get<ApiResponse<Row[]>>( "/announcements", { params } )

    return dedupeById( data.data.map( toJobPosting ) )
        .filter( ( p ) => !filters.contractType || p.contractType === filters.contractType )
        .filter( ( p ) => !filters.experienceLevel || p.experienceLevel === filters.experienceLevel )
}

// Returns the posting whatever its approval status (the route is public
// and does not filter), so the screen decides what to show for pending ones.
async function getJobPosting( id: number ): Promise<JobPosting> {
    const { data } = await api.get<ApiResponse<Row>>( `/announcements/${ id }` )
    return toJobPosting( data.data )
}

async function getMyCompanyJobPostings(): Promise<JobPosting[]> {
    const { data } = await api.get<ApiResponse<Row[]>>( "/announcements/company/me" )
    return data.data.map( toJobPosting )
}

// Returns the id of the new posting. It is created as "pending".
async function createJobPosting( input: JobPostingInput ): Promise<number> {
    const { data } = await api.post<ApiResponse<{ id: number }>>( "/announcements", toJobPostingBody( input ) )
    return data.data.id
}

// Editing sends the posting back to "pending" until an admin approves it.
async function updateJobPosting( id: number, input: JobPostingInput ): Promise<void> {
    await api.put( `/announcements/${ id }`, toJobPostingBody( input ) )
}

export { getJobPostings, getJobPosting, getMyCompanyJobPostings, createJobPosting, updateJobPosting }
export type { JobPostingFilters }
