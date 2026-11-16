// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      End-to-end, at API level: the public job list against the real
//      backend. Filters that really filter, no repeated postings, the
//      company of each posting, and a paused company whose postings
//      leave the list until it resumes.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { expect, test } from "@playwright/test"
import type { APIRequestContext } from "@playwright/test"

import { SEED_PASSWORD, SEED_USERS } from "./helpers.ts"

const API = "http://localhost:3100/api"

async function listIds( request: APIRequestContext, query = "" ): Promise<number[]> {
    const res = await request.get( `${ API }/announcements${ query }` )
    expect( res.status() ).toBe( 200 )
    return ( ( await res.json() ).data as { jb_pst_id: number }[] ).map( ( p ) => p.jb_pst_id )
}

test( "the public list carries the company and repeats nothing", async ( { request } ) => {
    const res = await request.get( `${ API }/announcements` )
    const data = ( await res.json() ).data as Record<string, unknown>[]

    expect( data.length ).toBeGreaterThan( 0 )
    for( const posting of data ) {
        // The city is whatever the company tests left: only its presence matters.
        expect( posting ).toMatchObject( { company_name: "Manufactura Digital de la Laguna" } )
        expect( posting.company_city ).toEqual( expect.any( String ) )
    }
    const ids = data.map( ( p ) => p.jb_pst_id )
    expect( new Set( ids ).size ).toBe( ids.length )
} )

test( "contract, level and career filters reach the database", async ( { request } ) => {
    expect( await listIds( request, "?contractType=internship" ) ).toEqual( [ 2 ] )
    expect( await listIds( request, "?experienceLevel=senior" ) ).toEqual( [] )
    expect( await listIds( request, "?careerId=8" ) ).toEqual( [ 2 ] )
    expect( await listIds( request, "?career_id=1" ) ).toEqual( [ 1 ] )
} )

test( "a paused company keeps its account and hides its postings", async ( { request } ) => {
    const login = await request.post( `${ API }/auth/login`, { data: { email: SEED_USERS.company, password: SEED_PASSWORD } } )
    const { token } = await login.json()
    const auth = { headers: { Authorization: `Bearer ${ token }` } }

    const pause = await request.patch( `${ API }/company/toggle-active`, auth )
    expect( ( await pause.json() ).data ).toEqual( { active: false } )

    // Still logged in, and the profile says so.
    const me = await request.get( `${ API }/company/me`, auth )
    expect( me.status() ).toBe( 200 )
    expect( ( await me.json() ).data.active ).toBe( 0 )

    // The seed company owns every posting, so the public list is empty.
    expect( await listIds( request ) ).toEqual( [] )

    const resume = await request.patch( `${ API }/company/toggle-active`, auth )
    expect( ( await resume.json() ).data ).toEqual( { active: true } )
    expect( ( await listIds( request ) ).length ).toBeGreaterThan( 0 )
} )
