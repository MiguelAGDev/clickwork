// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Sample backend responses for tests. Each one copies the exact
//      shape the real controller sends (column aliases, prefixes,
//      nulls), taken from the backend SQL, so a test that passes here
//      means the UI reads the real contract.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

// A row as the backend sends it: plain JSON.
type Row = Record<string, unknown>

// --- GET /users/me --- req.user (findById aliases + role, permissions
// from the token) merged with the fields of the role table.
const studentRow: Row = {
    id: 2,
    first_name: "Laura",
    last_name: "Estudiante",
    email: "estudiante.seed@newman.test",
    phone: "8711234567",
    active: 1,
    email_verified: true,
    cv_url: null,
    career_id: 1,
    career_name: "Ingeniería Sistemas Computacionales",
    role: "student",
    permissions: 4095,
    semester: 6,
}

const internRow: Row = {
    id: 3,
    first_name: "Pablo",
    last_name: "Residente",
    email: "intern.seed@newman.test",
    phone: "8717654321",
    active: 1,
    email_verified: true,
    cv_url: "C:\\uploads\\cvs\\cv_3_1700000000000.pdf",
    career_id: 6,
    career_name: "Ingeniería Mecatrónica",
    role: "intern",
    permissions: 4095,
    hostCompany: "Manufactura Digital de la Laguna",
    project: "Automatización de línea de ensamble",
    startDate: "2026-01-15T06:00:00.000Z",
    endDate: "2026-07-15T06:00:00.000Z",
}

const graduateRow: Row = {
    id: 4,
    first_name: "Carlos",
    last_name: "Egresado",
    email: "graduado.seed@newman.test",
    phone: null,
    active: 1,
    email_verified: true,
    cv_url: null,
    career_id: 4,
    career_name: "Ingeniería Industrial",
    role: "graduate",
    permissions: 4095,
    graduate_year: 2024,        // The backend really uses this name here.
    currentJob: "Ingeniero de Procesos",
}

const companyUserRow: Row = {
    id: 5,
    first_name: "Marcela",
    last_name: "Empresa",
    email: "empresa.seed@newman.test",
    phone: "8718889999",
    active: 1,
    email_verified: true,
    cv_url: null,
    career_id: null,
    career_name: null,
    role: "company",
    permissions: 127231,
}

const adminRow: Row = {
    id: 1,
    first_name: "Ana",
    last_name: "Administradora",
    email: "admin.seed@newman.test",
    phone: null,
    active: 1,
    email_verified: true,
    cv_url: null,
    career_id: null,
    career_name: null,
    role: "admin",
    permissions: 4294967295,
}

// --- GET /careers ---
const careerRows: Row[] = [
    { id: 4, name: "Ingeniería Industrial" },
    { id: 1, name: "Ingeniería Sistemas Computacionales" },
    { id: 8, name: "Ingeniería En Gestión Empresarial" },
]

// --- job_posting rows (SELECT *) ---
const jobRow: Row = {
    jb_pst_id: 1,
    jb_pst_job_title: "Desarrollador de Software Jr.",
    jb_pst_requirements: "Conocimientos en JavaScript y bases de datos relacionales.",
    jb_pst_benefits: "Prestaciones de ley, horario flexible.",
    jb_pst_modality: "hybrid",
    jb_pst_schedule: "Lunes a viernes, 9am-6pm",
    jb_pst_contract_type: "full-time",
    jb_pst_experience_level: "junior",
    jb_pst_publication_date: "2026-09-01T06:00:00.000Z",
    jb_pst_expiration_date: "2099-12-01T06:00:00.000Z",
    jb_pst_salary: 15000,
    jb_pst_image_url: null,
    jb_pst_approval_status: "approved",
    jb_pst_rejection_reason: null,
    jb_pst_id_company: 5,
    jb_pst_id_career: 1,
    company_name: "Manufactura Digital de la Laguna",
    company_city: "Torreón",
    company_state: "Coahuila",
}

const internshipJobRow: Row = {
    jb_pst_id: 2,
    jb_pst_job_title: "Practicante de Recursos Humanos",
    jb_pst_requirements: "Estudiante de Ingeniería en Gestión Empresarial o afín.",
    jb_pst_benefits: "Beca de apoyo, horario matutino.",
    jb_pst_modality: "on-site",
    jb_pst_schedule: "Lunes a viernes, 8am-2pm",
    jb_pst_contract_type: "internship",
    jb_pst_experience_level: "junior",
    jb_pst_publication_date: "2026-09-01T06:00:00.000Z",
    jb_pst_expiration_date: "2099-12-01T06:00:00.000Z",
    jb_pst_salary: "6000.00",   // DECIMAL can also arrive as a string.
    jb_pst_image_url: null,
    jb_pst_approval_status: "approved",
    jb_pst_rejection_reason: null,
    jb_pst_id_company: 5,
    jb_pst_id_career: 8,
    company_name: "Manufactura Digital de la Laguna",
    company_city: "Torreón",
    company_state: "Coahuila",
}

const pendingJobRow: Row = {
    ...jobRow,
    jb_pst_id: 3,
    jb_pst_job_title: "Analista de Datos",
    jb_pst_approval_status: "pending",
}

// --- GET /applications/me --- application JOIN job_posting (SELECT *).
const applicationRow: Row = {
    app_id: 10,
    app_date: "2026-10-05T06:00:00.000Z",
    app_status: "under_review",
    app_id_user: 2,
    app_id_job_posting: 1,
    ...jobRow,
}

// --- GET /applications/company/applicants/:id ---
const applicantRow: Row = {
    id: 10,
    date: "2026-10-05T06:00:00.000Z",
    status: "pending",
    applicant_id: 2,
    job_posting_id: 1,
    applicant_first_name: "Laura",
    applicant_last_name: "Estudiante",
    applicant_email: "estudiante.seed@newman.test",
    applicant_phone: "8711234567",
    applicant_cv_url: null,
}

// --- GET /company/me and the admin company lists ---
const companyRow: Row = {
    id: 5,
    name: "Manufactura Digital de la Laguna",
    size: "medium",
    industry: "Software Development",
    city: "Torreón",
    state: "Coahuila",
    address: "Blvd. Independencia #500",
    contact_email: "contacto.seed@newman.test",
    approval_status: "approved",
    rejection_reason: null,
    active: 1,
    permissions: 127231,
}

const pendingCompanyRow: Row = {
    ...companyRow,
    id: 9,
    name: "Grupo Nexo",
    approval_status: "pending",
}

// --- GET /admin/users ---
const adminUserRows: Row[] = [
    {
        id: 5, first_name: "Marcela", last_name: "Empresa", email: "empresa.seed@newman.test", phone: "8718889999", active: 1, email_verified: 1,
        role: "company", cv_url: null, career_id: null, career_name: null,
        company_name: "Manufactura Digital de la Laguna", company_approval_status: "approved",
    },
    {
        id: 2, first_name: "Laura", last_name: "Estudiante", email: "estudiante.seed@newman.test", phone: "8711234567", active: 1, email_verified: 1,
        role: "student", cv_url: null, career_id: 1, career_name: "Ingeniería Sistemas Computacionales",
        company_name: null, company_approval_status: null,
    },
    {
        id: 1, first_name: "Ana", last_name: "Administradora", email: "admin.seed@newman.test", phone: null, active: 1, email_verified: 1,
        role: "admin", cv_url: null, career_id: null, career_name: null,
        company_name: null, company_approval_status: null,
    },
]

export {
    studentRow,
    internRow,
    graduateRow,
    companyUserRow,
    adminRow,
    careerRows,
    jobRow,
    internshipJobRow,
    pendingJobRow,
    applicationRow,
    applicantRow,
    companyRow,
    pendingCompanyRow,
    adminUserRows,
}
export type { Row }
