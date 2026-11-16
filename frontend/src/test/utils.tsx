// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Helpers shared by the tests: render a screen with the same
//      providers the real app has, and start a test already logged in.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { render } from "@testing-library/react"
import type { RenderResult } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import type { ReactElement } from "react"
import { MemoryRouter } from "react-router-dom"

import { AuthProvider } from "@/context/AuthProvider.tsx"
import { setToken } from "@/services/tokenStorage.ts"
import type { Row } from "@/test/fixtures.ts"
import { API, server } from "@/test/server.ts"

// Builds a token with the same structure as a real JWT (three base64url
// parts) and a chosen expiration. The signature is fake: the frontend
// never verifies it, only the backend does.
function makeToken( expiresInSeconds = 3 * 60 * 60 ): string {
    const encode = ( value: object ) => btoa( JSON.stringify( value ) )
        .replace( /\+/g, "-" ).replace( /\//g, "_" ).replace( /=+$/, "" )

    const header = encode( { alg: "HS256", typ: "JWT" } )
    const payload = encode( { id: 1, exp: Math.floor( Date.now() / 1000 ) + expiresInSeconds } )

    return `${ header }.${ payload }.signature`
}

// Leaves the test "logged in": a valid token in storage and GET /users/me
// answering with the given backend row.
function mockSession( userRow: Row ): void {
    setToken( makeToken() )
    server.use(
        http.get( `${ API }/users/me`, () => HttpResponse.json( {
            success: true,
            message: "User profile retrieved successfully.",
            data: userRow,
        } ) )
    )
}

// Renders inside the router and the auth provider, at the given URL.
function renderApp( ui: ReactElement, route = "/" ): RenderResult {
    return render(
        <MemoryRouter initialEntries={ [ route ] }>
            <AuthProvider>{ ui }</AuthProvider>
        </MemoryRouter>
    )
}

export { makeToken, mockSession, renderApp }
