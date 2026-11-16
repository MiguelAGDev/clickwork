// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      End-to-end, at API level: the first and last name of an account
//      against the real backend and database. Covers what the Newman
//      suite also asserts, minus the register happy path (it sends a
//      real email). Runs last, so the application it creates does not change
//      what the earlier screen tests expect.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { expect, test } from "@playwright/test"
import type { APIRequestContext } from "@playwright/test"

import { SEED_PASSWORD, SEED_USERS } from "./helpers.ts"

const API = "http://localhost:3100/api"

async function login( request: APIRequestContext, email: string ): Promise<{ token: string, user: Record<string, unknown> }> {
    const res = await request.post( `${ API }/auth/login`, { data: { email, password: SEED_PASSWORD } } )
    expect( res.status() ).toBe( 200 )
    return res.json()
}

const auth = ( token: string ) => ( { headers: { Authorization: `Bearer ${ token }` } } )

test( "login and profile return the names of the seed", async ( { request } ) => {
    const { token, user } = await login( request, SEED_USERS.student )
    expect( user ).toMatchObject( { first_name: "Laura", last_name: "Estudiante" } )

    const me = await ( await request.get( `${ API }/users/me`, auth( token ) ) ).json()
    expect( me.data ).toMatchObject( { first_name: "Laura", last_name: "Estudiante" } )
} )

test( "the profile saves trimmed names and keeps them when omitted", async ( { request } ) => {
    const { token } = await login( request, SEED_USERS.student )

    const put = await request.put( `${ API }/users/me`, { ...auth( token ), data: { firstName: " Laura Elena ", lastName: "Estudiante Prueba" } } )
    expect( put.status() ).toBe( 200 )
    expect( ( await put.json() ).data ).toMatchObject( { first_name: "Laura Elena", last_name: "Estudiante Prueba" } )

    const keep = await request.put( `${ API }/users/me`, { ...auth( token ), data: { phone: "8710001111" } } )
    expect( ( await keep.json() ).data ).toMatchObject( { first_name: "Laura Elena", last_name: "Estudiante Prueba", phone: "8710001111" } )

    // Back to the seed values for the tests that follow.
    await request.put( `${ API }/users/me`, { ...auth( token ), data: { firstName: "Laura", lastName: "Estudiante", phone: "8711234567" } } )
} )

test( "blank or too long names are rejected with 422 on the field", async ( { request } ) => {
    const { token } = await login( request, SEED_USERS.student )

    const empty = await request.put( `${ API }/users/me`, { ...auth( token ), data: { firstName: "   " } } )
    expect( empty.status() ).toBe( 422 )
    expect( ( await empty.json() ).errors.map( ( e: { path: string } ) => e.path ) ).toContain( "firstName" )

    const long = await request.put( `${ API }/users/me`, { ...auth( token ), data: { lastName: "B".repeat( 151 ) } } )
    expect( long.status() ).toBe( 422 )
    expect( ( await long.json() ).errors.find( ( e: { path: string } ) => e.path === "lastName" ).msg ).toContain( "150" )

    const register = await request.post( `${ API }/auth/register`, { data: { email: "sin.nombre@newman.test", password: "Newman123", role: "student", semester: 1 } } )
    expect( register.status() ).toBe( 422 )
    const paths = ( await register.json() ).errors.map( ( e: { path: string } ) => e.path )
    expect( paths ).toContain( "firstName" )
    expect( paths ).toContain( "lastName" )
} )

test( "admin users and company applicants carry the names", async ( { request } ) => {
    const admin = await login( request, SEED_USERS.admin )
    const users = ( await ( await request.get( `${ API }/admin/users`, auth( admin.token ) ) ).json() ).data as Record<string, unknown>[]
    expect( users.every( ( u ) => "first_name" in u && "last_name" in u ) ).toBe( true )
    expect( users.find( ( u ) => u.email === SEED_USERS.admin ) ).toMatchObject( { first_name: "Ana", last_name: "Administradora" } )

    // The student applies, then the company reads the applicant list.
    const student = await login( request, SEED_USERS.student )
    await request.post( `${ API }/applications`, { ...auth( student.token ), data: { job_posting_id: 2 } } )
    const company = await login( request, SEED_USERS.company )
    const applicants = ( await ( await request.get( `${ API }/applications/company/applicants/2`, auth( company.token ) ) ).json() ).data as Record<string, unknown>[]
    expect( applicants.find( ( a ) => a.applicant_email === SEED_USERS.student ) ).toMatchObject( { applicant_first_name: "Laura", applicant_last_name: "Estudiante" } )
} )
