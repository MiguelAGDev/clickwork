// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Spanish names for the values the backend stores in English
//      (enums of the database), and the color each status is shown with.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import type { BadgeTone } from "@/components/ui/Badge.tsx"
import type {
    ApplicationStatus,
    ApprovalStatus,
    CompanySize,
    ContractType,
    ExperienceLevel,
    Modality,
} from "@/types/models.ts"

const MODALITY_LABELS: Record<Modality, string> = {
    "on-site": "Presencial",
    hybrid: "Híbrido",
    remote: "Remoto",
}

const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
    "full-time": "Tiempo completo",
    "part-time": "Medio tiempo",
    internship: "Prácticas o residencia",
    freelance: "Freelance",
}

const EXPERIENCE_LEVEL_LABELS: Record<ExperienceLevel, string> = {
    junior: "Junior",
    mid: "Intermedio",
    senior: "Senior",
}

const COMPANY_SIZE_LABELS: Record<CompanySize, string> = {
    micro: "Micro",
    small: "Pequeña",
    medium: "Mediana",
    large: "Grande",
}

// Status of an application, in the order a process usually follows.
const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
    pending: "Enviada",
    under_review: "En revisión",
    interview: "Entrevista",
    accepted: "Aceptada",
    rejected: "No seleccionada",
}

const APPLICATION_STATUS_TONES: Record<ApplicationStatus, BadgeTone> = {
    pending: "neutral",
    under_review: "info",
    interview: "warning",
    accepted: "success",
    rejected: "danger",
}

// Review status of a company or a job posting (decided by an admin).
const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, string> = {
    pending: "En revisión",
    approved: "Aprobada",
    rejected: "Rechazada",
}

const APPROVAL_STATUS_TONES: Record<ApprovalStatus, BadgeTone> = {
    pending: "warning",
    approved: "success",
    rejected: "danger",
}

const moneyFormatter = new Intl.NumberFormat( "es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
} )

// 15000 -> "$15,000". The backend stores one number and no period, so the
// screens add "al mes" themselves where it applies.
function formatSalary( salary: number | null ): string | null {
    return salary === null ? null : moneyFormatter.format( salary )
}

export {
    MODALITY_LABELS,
    CONTRACT_TYPE_LABELS,
    EXPERIENCE_LEVEL_LABELS,
    COMPANY_SIZE_LABELS,
    APPLICATION_STATUS_LABELS,
    APPLICATION_STATUS_TONES,
    APPROVAL_STATUS_LABELS,
    APPROVAL_STATUS_TONES,
    formatSalary,
}
