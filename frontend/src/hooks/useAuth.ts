// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Shortcut to read the session from any component: const { user,
//      login, logout } = useAuth(). Fails loudly if used outside
//      <AuthProvider>.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { useContext } from "react"

import { AuthContext } from "@/context/AuthContext.ts"
import type { AuthContextValue } from "@/context/AuthContext.ts"

function useAuth(): AuthContextValue {
    const context = useContext( AuthContext )

    if( !context ) {
        throw new Error( "useAuth must be used inside <AuthProvider>" )
    }

    return context
}

export { useAuth }
