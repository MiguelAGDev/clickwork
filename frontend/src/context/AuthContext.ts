// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      The auth context object and its type. It lives apart from the
//      provider component so this file exports no components (React
//      Fast Refresh needs component files to export only components).
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { createContext } from "react"

import type { User } from "@/types/models.ts"

// "loading" only happens once: while the app checks if a saved token is
// still good. Screens must wait for it before deciding to redirect.
type AuthStatus = "loading" | "authenticated" | "anonymous"

interface AuthContextValue {
    status: AuthStatus
    user: User | null
    // True after the backend rejected the token (expired or invalid), so
    // the login screen can explain why the user ended up there.
    sessionExpired: boolean
    // True after the user chose to log out (as opposed to being thrown out
    // by an expired token). The guards use it to not send the next login
    // back to the page of the previous session.
    loggedOut: boolean
    // Message to show on the login screen after a logout, if any.
    logoutNotice: string | null
    login: ( email: string, password: string ) => Promise<User>
    // Ends the session. The guards do the redirect to /login by themselves,
    // so callers must NOT navigate after calling this.
    logout: ( notice?: string ) => void
    // Reads the profile again (after editing it, uploading a CV...).
    refreshUser: () => Promise<void>
    // Replaces the user in memory with one a service already returned.
    setUser: ( user: User ) => void
}

// undefined by default so useAuth can tell "no provider above" apart from
// a real value and fail with a clear message.
const AuthContext = createContext<AuthContextValue | undefined>( undefined )

export { AuthContext }
export type { AuthContextValue, AuthStatus }
