// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      /dashboard is the home of every role (the backend emails link to
//      it). This page only decides which home to show for the role of
//      the logged-in user.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { useAuth } from "@/hooks/useAuth.ts"
import { isCandidate } from "@/lib/roles.ts"
import { AdminHomePage, CandidateHomePage, CompanyHomePage } from "@/pages/lazyPages.ts"

function DashboardPage() {
    const { user } = useAuth()

    if( !user ) return null     // Never happens inside ProtectedRoute.

    // Each home is loaded on demand, so a user only downloads its own.
    if( isCandidate( user.role ) ) return <CandidateHomePage user={ user } />

    if( user.role === "company" ) return <CompanyHomePage user={ user } />

    return <AdminHomePage />
}

export { DashboardPage }
