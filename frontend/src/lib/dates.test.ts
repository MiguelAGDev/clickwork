// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Tests for the date helpers, in particular that a MySQL DATE
//      keeps its calendar day whatever timezone the browser is in.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { describe, expect, test } from "vitest"

import { daysBetween, formatDate, toDateOnly } from "@/lib/dates.ts"

describe( "toDateOnly", () => {
    test( "recovers the calendar day from the timestamp the backend sends", () => {
        // 2026-09-01 at midnight in the backend timezone (-06:00).
        expect( toDateOnly( "2026-09-01T06:00:00.000Z" ) ).toBe( "2026-09-01" )
    } )

    test( "keeps a plain date as it is", () => {
        expect( toDateOnly( "2026-12-31" ) ).toBe( "2026-12-31" )
    } )

    test( "returns null for a missing or invalid value", () => {
        expect( toDateOnly( null ) ).toBeNull()
        expect( toDateOnly( "" ) ).toBeNull()
        expect( toDateOnly( "not a date" ) ).toBeNull()
    } )
} )

describe( "daysBetween", () => {
    test( "counts whole days, across months", () => {
        expect( daysBetween( "2026-08-30", "2026-09-02" ) ).toBe( 3 )
        expect( daysBetween( "2026-09-02", "2026-08-30" ) ).toBe( -3 )
    } )
} )

describe( "formatDate", () => {
    test( "formats in Spanish", () => {
        expect( formatDate( "2026-09-01" ) ).toMatch( /^1 sept?\.? 2026$/ )
    } )

    test( "returns empty text for a missing date", () => {
        expect( formatDate( null ) ).toBe( "" )
    } )
} )
