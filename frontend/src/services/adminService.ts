// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Calls to /api/admin: review companies and job postings, and
//      manage user accounts. Every route requires the admin role (403
//      otherwise).
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { api } from "@/services/api.ts"
import { toAdminUser, toCompany, toJobPosting } from "@/services/mappers.ts"
import type { Row } from "@/services/mappers.ts"
import type { ApiResponse } from "@/types/api.ts"
import type { AdminUser, ApprovalStatus, Company, JobPosting } from "@/types/models.ts"

// The backend stores the reason in a 300 char column but validates 255.
const REJECTION_REASON_MAX = 255

async function getCompanies(): Promise<Company[]> {
    const { data } = await api.get<ApiResponse<Row[]>>( "/admin/companies" )
    return data.data.map( toCompany )
}

async function getPendingCompanies(): Promise<Company[]> {
    const { data } = await api.get<ApiResponse<Row[]>>( "/admin/companies/pending" )
    return data.data.map( toCompany )
}

// "reason" is mandatory when the status is "rejected" (400 if missing) and
// discarded by the backend for any other status.
async function setCompanyApproval( companyId: number, status: ApprovalStatus, reason?: string ): Promise<void> {
    await api.patch( `/admin/companies/${ companyId }/approval`, { status, reason: reason || null } )
}

async function getPendingJobPostings(): Promise<JobPosting[]> {
    const { data } = await api.get<ApiResponse<Row[]>>( "/admin/job-postings/pending" )
    return data.data.map( toJobPosting )
}

// Same rule for "reason" as setCompanyApproval.
async function setJobPostingApproval( jobPostingId: number, status: ApprovalStatus, reason?: string ): Promise<void> {
    await api.patch( `/admin/job-postings/${ jobPostingId }/approval`, { status, reason: reason || null } )
}

async function getUsers(): Promise<AdminUser[]> {
    const { data } = await api.get<ApiResponse<Row[]>>( "/admin/users" )
    return data.data.map( toAdminUser )
}

// Flips active/inactive. An inactive account cannot log in or call the API.
async function toggleUserActive( userId: number ): Promise<void> {
    await api.patch( `/admin/users/${ userId }/toggle-active` )
}

export {
    getCompanies,
    getPendingCompanies,
    setCompanyApproval,
    getPendingJobPostings,
    setJobPostingApproval,
    getUsers,
    toggleUserActive,
    REJECTION_REASON_MAX,
}
