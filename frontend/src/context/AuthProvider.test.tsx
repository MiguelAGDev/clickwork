// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Tests for the session: logging in, restoring a saved session on
//      reload, and ending it when the token expires or the backend
//      rejects it.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { describe, expect, test } from "vitest"

import { AuthProvider } from "@/context/AuthProvider.tsx"
import { useAuth } from "@/hooks/useAuth.ts"
import { getToken, setToken } from "@/services/tokenStorage.ts"
import { studentRow } from "@/test/fixtures.ts"
import { API, server } from "@/test/server.ts"
import { makeToken, mockSession } from "@/test/utils.tsx"

// Minimal screen that shows the session and exposes its actions.
function Probe() {
    const { status, user, sessionExpired, login, logout } = useAuth()

    return (
        <div>
            <p>status: { status }</p>
            <p>user: { user?.email ?? "none" }</p>
            <p>expired: { String( sessionExpired ) }</p>
            <button onClick={ () => { login( "estudiante.seed@newman.test", "Secret123" ).catch( () => {} ) } }>login</button>
            <button onClick={ () => logout() }>logout</button>
        </div>
    )
}

function renderProbe() {
    return render( <AuthProvider><Probe /></AuthProvider> )
}

describe( "AuthProvider", () => {
    test( "starts anonymous when there is no token", () => {
        renderProbe()

        expect( screen.getByText( "status: anonymous" ) ).toBeInTheDocument()
    } )

    test( "restores the session from a saved token", async () => {
        mockSession( studentRow )

        renderProbe()

        expect( screen.getByText( "status: loading" ) ).toBeInTheDocument()
        expect( await screen.findByText( "status: authenticated" ) ).toBeInTheDocument()
        expect( screen.getByText( "user: estudiante.seed@newman.test" ) ).toBeInTheDocument()
    } )

    test( "drops a token that already expired without calling the backend", () => {
        setToken( makeToken( -60 ) )

        renderProbe()

        expect( screen.getByText( "status: anonymous" ) ).toBeInTheDocument()
        expect( screen.getByText( "expired: true" ) ).toBeInTheDocument()
        expect( getToken() ).toBeNull()
    } )

    test( "ends the session when the backend rejects the token", async () => {
        setToken( makeToken() )
        server.use( http.get( `${ API }/users/me`, () => HttpResponse.json(
            { success: false, message: "Invalid or expired token" },
            { status: 401 }
        ) ) )

        renderProbe()

        expect( await screen.findByText( "status: anonymous" ) ).toBeInTheDocument()
        expect( screen.getByText( "expired: true" ) ).toBeInTheDocument()
        expect( getToken() ).toBeNull()
    } )

    test( "login saves the token and loads the profile", async () => {
        const token = makeToken()
        server.use(
            http.post( `${ API }/auth/login`, () => HttpResponse.json( {
                success: true,
                token,
                user: { id: 2, email: "estudiante.seed@newman.test", role: "student", permissions: 4095 },
            } ) ),
            http.get( `${ API }/users/me`, () => HttpResponse.json( { success: true, data: studentRow } ) )
        )
        renderProbe()

        await userEvent.click( screen.getByRole( "button", { name: "login" } ) )

        expect( await screen.findByText( "status: authenticated" ) ).toBeInTheDocument()
        expect( getToken() ).toBe( token )
    } )

    test( "a failed login keeps the user anonymous and is not treated as an expired session", async () => {
        server.use( http.post( `${ API }/auth/login`, () => HttpResponse.json(
            { success: false, message: "Invalid email or password." },
            { status: 401 }
        ) ) )
        renderProbe()

        await userEvent.click( screen.getByRole( "button", { name: "login" } ) )

        await waitFor( () => expect( getToken() ).toBeNull() )
        expect( screen.getByText( "status: anonymous" ) ).toBeInTheDocument()
        expect( screen.getByText( "expired: false" ) ).toBeInTheDocument()
    } )

    test( "logout clears the token and the user", async () => {
        mockSession( studentRow )
        renderProbe()
        await screen.findByText( "status: authenticated" )

        await userEvent.click( screen.getByRole( "button", { name: "logout" } ) )

        expect( screen.getByText( "status: anonymous" ) ).toBeInTheDocument()
        expect( screen.getByText( "user: none" ) ).toBeInTheDocument()
        expect( getToken() ).toBeNull()
    } )
} )
