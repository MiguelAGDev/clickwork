// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Which links the header shows to each role, and where "my
//      account" leads. One place to change when a section is added.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { isCandidate } from "@/lib/roles.ts"
import type { Role } from "@/types/models.ts"

interface NavItem {
    label: string
    to: string
    // true = active only on the exact URL. Needed for "Inicio": without it
    // /dashboard would also look active on any URL that starts with it.
    end?: boolean
}

const HOME: NavItem = { label: "Inicio", to: "/dashboard", end: true }

function getNavItems( role: Role ): NavItem[] {
    if( isCandidate( role ) ) {
        return [
            HOME,
            { label: "Vacantes", to: "/jobs" },
            { label: "Aplicaciones", to: "/applications" },
            { label: "Perfil", to: "/profile" },
        ]
    }

    if( role === "company" ) {
        return [
            HOME,
            { label: "Mis vacantes", to: "/company/jobs" },
            { label: "Perfil", to: "/company/profile" },
        ]
    }

    return [
        HOME,
        { label: "Empresas", to: "/admin/companies" },
        { label: "Vacantes", to: "/admin/jobs" },
        { label: "Usuarios", to: "/admin/users" },
    ]
}

// Where the "Mi cuenta" entry of the user menu goes.
function getAccountPath( role: Role ): string {
    if( isCandidate( role ) ) return "/profile"
    if( role === "company" ) return "/company/profile"
    return "/account"
}

export { getNavItems, getAccountPath }
export type { NavItem }
