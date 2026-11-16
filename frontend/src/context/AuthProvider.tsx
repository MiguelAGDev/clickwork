// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Holds the session for the whole app: who is logged in, how to
//      log in and out, and what happens when the token stops being
//      valid. Wraps the app once, in main.tsx.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { useCallback, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"

import { AuthContext } from "@/context/AuthContext.ts"
import type { AuthContextValue, AuthStatus } from "@/context/AuthContext.ts"
import { setSessionExpiredHandler } from "@/services/api.ts"
import * as authService from "@/services/authService.ts"
import { clearToken, getToken, getTokenExpiration, isTokenExpired, setToken } from "@/services/tokenStorage.ts"
import { getMe } from "@/services/userService.ts"
import type { User } from "@/types/models.ts"

interface SessionState {
    status: AuthStatus
    user: User | null
    sessionExpired: boolean
}

// Decides the first state without waiting for an effect: with no usable
// token there is nothing to check, so the app can render right away.
function getInitialState(): SessionState {
    const token = getToken()

    if( !token ) return { status: "anonymous", user: null, sessionExpired: false }

    if( isTokenExpired( token ) ) {
        clearToken()
        return { status: "anonymous", user: null, sessionExpired: true }
    }

    return { status: "loading", user: null, sessionExpired: false }
}

function AuthProvider( { children }: { children: ReactNode } ) {
    const [ session, setSession ] = useState<SessionState>( getInitialState )

    // Ends the session because the token is no longer accepted.
    const expireSession = useCallback( () => {
        clearToken()
        setSession( { status: "anonymous", user: null, sessionExpired: true } )
    }, [] )

    // Tell the HTTP client what to do on a 401. Cleaned up on unmount so a
    // stale provider is never called.
    useEffect( () => {
        setSessionExpiredHandler( expireSession )
        return () => setSessionExpiredHandler( null )
    }, [ expireSession ] )

    // On first load with a saved token: ask the backend who it belongs to.
    // If the token is bad the 401 handler above already ends the session.
    useEffect( () => {
        if( session.status !== "loading" ) return

        let cancelled = false

        getMe().then(
            ( user ) => {
                if( !cancelled ) setSession( { status: "authenticated", user, sessionExpired: false } )
            },
            () => {
                // Any failure other than 401 (server down, 403 for a
                // deactivated account...) also means we cannot show the
                // app, but the token is kept: a reload may work later.
                if( !cancelled ) setSession( ( current ) => (
                    current.status === "loading"
                        ? { status: "anonymous", user: null, sessionExpired: false }
                        : current
                ) )
            }
        )

        return () => { cancelled = true }
    }, [ session.status ] )

    // The token lasts 3 hours and cannot be renewed. Instead of letting the
    // user find out on the next click, end the session at that moment.
    useEffect( () => {
        if( session.status !== "authenticated" ) return

        const token = getToken()
        const expiresAt = token ? getTokenExpiration( token ) : null
        if( expiresAt === null ) return

        // setTimeout breaks above ~24.8 days; no real token lasts that long,
        // but clamping keeps a misconfigured one from firing immediately.
        const delay = Math.min( Math.max( expiresAt - Date.now(), 0 ), 2_147_000_000 )
        const timer = setTimeout( expireSession, delay )

        return () => clearTimeout( timer )
    }, [ session.status, expireSession ] )

    const login = useCallback( async ( email: string, password: string ) => {
        const { token } = await authService.login( email, password )
        setToken( token )

        try {
            const user = await getMe()
            setSession( { status: "authenticated", user, sessionExpired: false } )
            return user
        } catch( error ) {
            clearToken()    // Half a session is worse than none.
            throw error
        }
    }, [] )

    const logout = useCallback( () => {
        clearToken()
        setSession( { status: "anonymous", user: null, sessionExpired: false } )
    }, [] )

    const setUser = useCallback( ( user: User ) => {
        setSession( ( current ) => ( current.status === "authenticated" ? { ...current, user } : current ) )
    }, [] )

    const refreshUser = useCallback( async () => {
        setUser( await getMe() )
    }, [ setUser ] )

    // useMemo: without it every render would create a new object and
    // re-render every component that reads the context.
    const value = useMemo<AuthContextValue>( () => ( {
        status: session.status,
        user: session.user,
        sessionExpired: session.sessionExpired,
        login,
        logout,
        refreshUser,
        setUser,
    } ), [ session, login, logout, refreshUser, setUser ] )

    return <AuthContext.Provider value={ value }>{ children }</AuthContext.Provider>
}

export { AuthProvider }
