// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Tests for the HTTP client: the token header, the translation of
//      backend errors into ApiError, and the detection of a dead
//      session.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { http, HttpResponse } from "msw"
import { afterEach, describe, expect, test, vi } from "vitest"

import { api, setSessionExpiredHandler } from "@/services/api.ts"
import { setToken } from "@/services/tokenStorage.ts"
import { API, server } from "@/test/server.ts"
import { ApiError } from "@/types/api.ts"

afterEach( () => setSessionExpiredHandler( null ) )

// Runs a request that is expected to fail and returns the error it threw.
async function failing( request: Promise<unknown> ): Promise<ApiError> {
    try {
        await request
    } catch( error ) {
        return error as ApiError
    }
    throw new Error( "The request was expected to fail" )
}

describe( "api client", () => {
    test( "sends the saved token as a Bearer header", async () => {
        let header: string | null = null
        server.use( http.get( `${ API }/users/me`, ( { request } ) => {
            header = request.headers.get( "authorization" )
            return HttpResponse.json( { success: true, data: {} } )
        } ) )
        setToken( "abc.def.ghi" )

        await api.get( "/users/me" )

        expect( header ).toBe( "Bearer abc.def.ghi" )
    } )

    test( "turns a backend error into an ApiError with a Spanish message", async () => {
        server.use( http.post( `${ API }/auth/register`, () => HttpResponse.json(
            { success: false, message: "An account with this email already exists." },
            { status: 409 }
        ) ) )

        const error = await failing( api.post( "/auth/register", {} ) )

        expect( error ).toBeInstanceOf( ApiError )
        expect( error.status ).toBe( 409 )
        expect( error.message ).toBe( "Ya existe una cuenta con este correo." )
    } )

    test( "maps 422 errors[] to one message per field", async () => {
        server.use( http.post( `${ API }/auth/register`, () => HttpResponse.json( {
            success: false,
            message: "Validation failed",
            errors: [
                { type: "field", msg: "Pasword must be at least 8 characteres.", path: "password", location: "body" },
                { type: "field", msg: "Password must contain at least one uppercase letter.", path: "password", location: "body" },
                { type: "field", msg: "Semester is required.", path: "semester", location: "body" },
            ],
        }, { status: 422 } ) ) )

        const error = await failing( api.post( "/auth/register", {} ) )

        expect( error.status ).toBe( 422 )
        expect( error.fieldErrors ).toEqual( {
            password: "La contraseña debe tener al menos 8 caracteres.",    // first rule wins
            semester: "Indica tu semestre.",
        } )
    } )

    test( "keeps an unknown backend message as it is", async () => {
        server.use( http.get( `${ API }/careers`, () => HttpResponse.json(
            { success: false, message: "Some brand new message" },
            { status: 400 }
        ) ) )

        const error = await failing( api.get( "/careers" ) )

        expect( error.message ).toBe( "Some brand new message" )
    } )

    test( "hides the detail of a 500 error", async () => {
        server.use( http.get( `${ API }/careers`, () => HttpResponse.json(
            { success: false, message: "ER_NO_SUCH_TABLE: Table 'careers' doesn't exist" },
            { status: 500 }
        ) ) )

        const error = await failing( api.get( "/careers" ) )

        expect( error.message ).toBe( "Ocurrió un error en el servidor. Intenta de nuevo más tarde." )
    } )

    test( "reports status 0 when the server cannot be reached", async () => {
        server.use( http.get( `${ API }/careers`, () => HttpResponse.error() ) )

        const error = await failing( api.get( "/careers" ) )

        expect( error.status ).toBe( 0 )
        expect( error.message ).toMatch( /no pudimos conectar/i )
    } )

    test( "a 401 ends the session", async () => {
        const onExpired = vi.fn()
        setSessionExpiredHandler( onExpired )
        server.use( http.get( `${ API }/users/me`, () => HttpResponse.json(
            { success: false, message: "Invalid or expired token" },
            { status: 401 }
        ) ) )

        await failing( api.get( "/users/me" ) )

        expect( onExpired ).toHaveBeenCalledTimes( 1 )
    } )

    test( "a 401 does not end the session when the request opts out", async () => {
        const onExpired = vi.fn()
        setSessionExpiredHandler( onExpired )
        server.use( http.post( `${ API }/auth/login`, () => HttpResponse.json(
            { success: false, message: "Invalid email or password." },
            { status: 401 }
        ) ) )

        const error = await failing( api.post( "/auth/login", {}, { skipSessionExpiry: true } ) )

        expect( onExpired ).not.toHaveBeenCalled()
        expect( error.message ).toBe( "Correo o contraseña incorrectos." )
    } )
} )
