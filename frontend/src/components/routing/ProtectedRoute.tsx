// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Route guards. ProtectedRoute lets a route render only with a
//      session (and, optionally, only for some roles). PublicOnlyRoute
//      does the opposite for login/register: a logged-in user is sent
//      to the dashboard.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { Navigate, Outlet, useLocation } from "react-router-dom"

import { FullPageSpinner } from "@/components/ui/Spinner.tsx"
import { useAuth } from "@/hooks/useAuth.ts"
import { ForbiddenPage } from "@/pages/ForbiddenPage.tsx"
import type { Role } from "@/types/models.ts"

interface ProtectedRouteProps {
    // Roles allowed in. Omit it to allow any logged-in user.
    roles?: readonly Role[]
}

// Used as a layout route: <Route element={ <ProtectedRoute roles=... /> }>
// with the real routes nested inside. <Outlet /> is where they render.
function ProtectedRoute( { roles }: ProtectedRouteProps ) {
    const { status, user } = useAuth()
    const location = useLocation()

    // Still checking the saved token: redirecting now would send a
    // logged-in user to /login on every page reload.
    if( status === "loading" ) return <FullPageSpinner />

    if( status === "anonymous" || !user ) {
        // Remember where the user was going, to return there after login.
        const from = location.pathname + location.search
        return <Navigate to="/login" replace state={ { from } } />
    }

    // Logged in but with another role. This only hides the screen: the
    // real protection is the backend, which checks the role on each request.
    if( roles && !roles.includes( user.role ) ) return <ForbiddenPage />

    return <Outlet />
}

function PublicOnlyRoute() {
    const { status } = useAuth()
    const location = useLocation()

    if( status === "loading" ) return <FullPageSpinner />

    if( status === "authenticated" ) {
        // This is also what moves the user on right after a login: the
        // session appears, this guard re-renders and redirects. "from" is
        // the page ProtectedRoute interrupted, if there was one.
        const from = ( location.state as { from?: string } | null )?.from
        return <Navigate to={ from ?? "/dashboard" } replace />
    }

    return <Outlet />
}

export { ProtectedRoute, PublicOnlyRoute }
