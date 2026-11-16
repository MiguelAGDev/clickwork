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

import { PageHeader } from "@/components/layout/PageHeader.tsx"
import { useAuth } from "@/hooks/useAuth.ts"
import { getDisplayName } from "@/lib/displayName.ts"

function DashboardPage() {
    const { user } = useAuth()

    if( !user ) return null     // Never happens inside ProtectedRoute.

    // The home of each role replaces this greeting in its own step.
    return (
        <PageHeader
            title={ `Hola, ${ getDisplayName( user.email ) }` }
            subtitle="Aquí tienes un resumen de tu actividad"
        />
    )
}

export { DashboardPage }
