// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Small helpers about roles: which ones are candidates and how
//      each role is called in the UI.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import type { CandidateRole, Role } from "@/types/models.ts"

const CANDIDATE_ROLES: readonly CandidateRole[] = [ "student", "intern", "graduate" ]

// student, intern and graduate share the same screens (they look for jobs).
function isCandidate( role: Role ): role is CandidateRole {
    return ( CANDIDATE_ROLES as readonly Role[] ).includes( role )
}

const ROLE_LABELS: Record<Role, string> = {
    student: "Estudiante",
    intern: "Residente",
    graduate: "Egresado",
    company: "Empresa",
    admin: "Administrador",
}

export { CANDIDATE_ROLES, isCandidate, ROLE_LABELS }
