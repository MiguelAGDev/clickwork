// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Translates backend rows into the domain types of
//      types/models.ts, and form values back into the request bodies
//      the backend expects. The backend names come straight from its
//      SQL (column prefixes like jb_pst_ and aliases), and all of that
//      knowledge is kept in this file.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { toDateOnly } from "@/lib/dates.ts"
import type {
    AdminUser,
    Applicant,
    Application,
    ApplicationStatus,
    ApprovalStatus,
    Career,
    Company,
    CompanyInput,
    CompanySize,
    ContractType,
    ExperienceLevel,
    JobPosting,
    JobPostingInput,
    Modality,
    Role,
    User,
} from "@/types/models.ts"

// A row exactly as it arrives: we only know it is an object.
type Row = Record<string, unknown>

function text( value: unknown ): string | null {
    return typeof value === "string" && value !== "" ? value : null
}

function num( value: unknown ): number | null {
    if( value === null || value === undefined || value === "" ) return null
    const n = Number( value )
    return Number.isFinite( n ) ? n : null
}

// GET /users/me -> req.user (userModel.findById aliases + role from the
// token) merged with the role table fields.
function toUser( row: Row ): User {
    return {
        id: Number( row.id ),
        firstName: text( row.first_name ) ?? "",
        lastName: text( row.last_name ) ?? "",
        email: String( row.email ),
        phone: text( row.phone ),
        role: row.role as Role,
        cvUrl: text( row.cv_url ),
        careerId: num( row.career_id ),
        careerName: text( row.career_name ),
        semester: num( row.semester ),
        hostCompany: text( row.hostCompany ),
        project: text( row.project ),
        startDate: toDateOnly( row.startDate ),
        endDate: toDateOnly( row.endDate ),
        // The backend calls it graduate_year when reading and graduationYear
        // when registering. The UI only ever sees graduationYear.
        graduationYear: num( row.graduate_year ?? row.graduationYear ),
        currentJob: text( row.currentJob ),
    }
}

function toCareer( row: Row ): Career {
    return { id: Number( row.id ), name: String( row.name ) }
}

// Any query that returns job_posting columns (SELECT * / jp.*).
function toJobPosting( row: Row ): JobPosting {
    return {
        id: Number( row.jb_pst_id ),
        title: String( row.jb_pst_job_title ),
        requirements: text( row.jb_pst_requirements ),
        benefits: text( row.jb_pst_benefits ),
        modality: row.jb_pst_modality as Modality,
        schedule: text( row.jb_pst_schedule ),
        contractType: row.jb_pst_contract_type as ContractType,
        experienceLevel: row.jb_pst_experience_level as ExperienceLevel,
        publicationDate: toDateOnly( row.jb_pst_publication_date ),
        expirationDate: toDateOnly( row.jb_pst_expiration_date ),
        // DECIMAL can arrive as a string ("15000.00") depending on the
        // driver settings, so always go through Number.
        salary: num( row.jb_pst_salary ),
        imageUrl: text( row.jb_pst_image_url ),
        approvalStatus: row.jb_pst_approval_status as ApprovalStatus,
        rejectionReason: text( row.jb_pst_rejection_reason ),
        companyId: Number( row.jb_pst_id_company ),
        careerId: num( row.jb_pst_id_career ),
    }
}

// Body of POST/PUT /announcements. Empty optional fields go as null: the
// validators skip null, but "" in a numeric field would fail.
function toJobPostingBody( input: JobPostingInput ): Row {
    const body: Row = {
        jb_pst_job_title: input.title,
        jb_pst_requirements: input.requirements,
        jb_pst_benefits: input.benefits || null,
        jb_pst_modality: input.modality,
        jb_pst_schedule: input.schedule,
        jb_pst_contract_type: input.contractType,
        jb_pst_experience_level: input.experienceLevel,
        jb_pst_expiration_date: input.expirationDate,
        jb_pst_salary: input.salary,
    }

    // The backend only rewrites the careers when the list is present, so
    // leaving it out is how an edit keeps the current ones.
    if( input.careerIds !== undefined ) body.careerIds = input.careerIds

    return body
}

// GET /applications/me -> application JOIN job_posting (SELECT *), so each
// row carries the app_* columns and every jb_pst_* column together.
function toApplication( row: Row ): Application {
    return {
        id: Number( row.app_id ),
        date: toDateOnly( row.app_date ),
        status: row.app_status as ApplicationStatus,
        job: toJobPosting( row ),
    }
}

// GET /applications/company/applicants/:id (aliased columns).
function toApplicant( row: Row ): Applicant {
    return {
        id: Number( row.id ),
        date: toDateOnly( row.date ),
        status: row.status as ApplicationStatus,
        applicantId: Number( row.applicant_id ),
        jobPostingId: Number( row.job_posting_id ),
        firstName: text( row.applicant_first_name ) ?? "",
        lastName: text( row.applicant_last_name ) ?? "",
        email: String( row.applicant_email ),
        phone: text( row.applicant_phone ),
        cvUrl: text( row.applicant_cv_url ),
    }
}

// GET /company/me and the admin company lists (same aliases).
function toCompany( row: Row ): Company {
    return {
        id: Number( row.id ),
        name: String( row.name ),
        size: row.size as CompanySize,
        industry: String( row.industry ),
        city: text( row.city ),
        state: text( row.state ),
        address: text( row.address ),
        contactEmail: text( row.contact_email ),
        approvalStatus: row.approval_status as ApprovalStatus,
        rejectionReason: text( row.rejection_reason ),
    }
}

// Body of PUT /company/me (the route validates the cmp_ prefixed names).
function toCompanyBody( input: CompanyInput ): Row {
    return {
        cmp_name: input.name,
        cmp_size: input.size,
        cmp_industry: input.industry,
        cmp_city: input.city,
        cmp_state: input.state,
        cmp_address: input.address,
        cmp_contact_email: input.contactEmail,
    }
}

// GET /admin/users (userModel.getAllUsers aliases).
function toAdminUser( row: Row ): AdminUser {
    return {
        id: Number( row.id ),
        firstName: text( row.first_name ) ?? "",
        lastName: text( row.last_name ) ?? "",
        email: String( row.email ),
        phone: text( row.phone ),
        active: Boolean( row.active ),
        emailVerified: Boolean( row.email_verified ),
        role: row.role as Role,
        careerName: text( row.career_name ),
        companyName: text( row.company_name ),
        companyApprovalStatus: ( text( row.company_approval_status ) as ApprovalStatus | null ),
    }
}

export {
    toUser,
    toCareer,
    toJobPosting,
    toJobPostingBody,
    toApplication,
    toApplicant,
    toCompany,
    toCompanyBody,
    toAdminUser,
}
export type { Row }
