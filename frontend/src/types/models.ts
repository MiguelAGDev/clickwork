// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Domain types the UI works with. They are the clean, camelCase
//      shape the services return after normalizing the backend rows, so
//      a column rename in the backend only touches the mapper in
//      services/, never the screens.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

type Role = "student" | "intern" | "graduate" | "company" | "admin"

// The three roles that look for a job share every candidate screen.
type CandidateRole = "student" | "intern" | "graduate"

type ApprovalStatus = "pending" | "approved" | "rejected"

type ApplicationStatus = "pending" | "under_review" | "interview" | "accepted" | "rejected"

type Modality = "remote" | "on-site" | "hybrid"

type ContractType = "full-time" | "part-time" | "internship" | "freelance"

type ExperienceLevel = "junior" | "mid" | "senior"

type CompanySize = "micro" | "small" | "medium" | "large"

// Logged-in user: app_user columns plus the fields of its role table.
// Role fields that do not apply to the current role are always null.
interface User {
    id: number
    email: string
    phone: string | null
    role: Role
    cvUrl: string | null
    careerId: number | null
    careerName: string | null
    semester: number | null         // student
    hostCompany: string | null      // intern
    project: string | null          // intern
    startDate: string | null        // intern, YYYY-MM-DD
    endDate: string | null          // intern, YYYY-MM-DD
    graduationYear: number | null   // graduate
    currentJob: string | null       // graduate
}

interface Career {
    id: number
    name: string
}

interface JobPosting {
    id: number
    title: string
    requirements: string | null
    benefits: string | null
    modality: Modality
    schedule: string | null
    contractType: ContractType
    experienceLevel: ExperienceLevel
    publicationDate: string | null  // YYYY-MM-DD
    expirationDate: string | null   // YYYY-MM-DD
    salary: number | null
    imageUrl: string | null
    approvalStatus: ApprovalStatus
    rejectionReason: string | null
    companyId: number               // user id of the company that owns it
    careerId: number | null
}

// What the create/edit form sends: the fields a company can actually edit.
interface JobPostingInput {
    title: string
    requirements: string
    benefits: string
    modality: Modality
    schedule: string
    contractType: ContractType
    experienceLevel: ExperienceLevel
    expirationDate: string
    salary: number | null
    // undefined = do not touch the careers the posting already has.
    careerIds: number[] | undefined
}

// An application as the candidate sees it: its own status plus the posting.
interface Application {
    id: number
    date: string | null
    status: ApplicationStatus
    job: JobPosting
}

// An application as the company sees it: who applied to one of its postings.
interface Applicant {
    id: number
    date: string | null
    status: ApplicationStatus
    applicantId: number
    jobPostingId: number
    email: string
    phone: string | null
    cvUrl: string | null
}

interface Company {
    id: number                      // same value as the owner user id
    name: string
    size: CompanySize
    industry: string
    city: string | null
    state: string | null
    address: string | null
    contactEmail: string | null
    approvalStatus: ApprovalStatus
    rejectionReason: string | null
}

interface CompanyInput {
    name: string
    size: CompanySize
    industry: string
    city: string
    state: string
    address: string
    contactEmail: string
}

// Row of the admin user list: the user plus a summary of its role table.
interface AdminUser {
    id: number
    email: string
    phone: string | null
    active: boolean
    emailVerified: boolean
    role: Role
    careerName: string | null
    companyName: string | null
    companyApprovalStatus: ApprovalStatus | null
}

export type {
    Role,
    CandidateRole,
    ApprovalStatus,
    ApplicationStatus,
    Modality,
    ContractType,
    ExperienceLevel,
    CompanySize,
    User,
    Career,
    JobPosting,
    JobPostingInput,
    Application,
    Applicant,
    Company,
    CompanyInput,
    AdminUser,
}
