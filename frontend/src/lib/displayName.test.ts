// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Tests for the name helpers, including accounts migrated with an
//      empty last name and the fallback to the email.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { describe, expect, test } from "vitest"

import { getDisplayName, getFullName, getInitials } from "@/lib/displayName.ts"

const laura = { firstName: "Laura", lastName: "Estudiante", email: "estudiante.seed@newman.test" }
const migrated = { firstName: "Azu", lastName: "", email: "azu@email.com" }
const blank = { firstName: "", lastName: "", email: "nadie@email.com" }

describe( "displayName", () => {
    test( "full name joins both names", () => {
        expect( getFullName( laura ) ).toBe( "Laura Estudiante" )
        expect( getFullName( migrated ) ).toBe( "Azu" )
        expect( getFullName( blank ) ).toBe( "nadie@email.com" )
    } )

    test( "display name is the first name", () => {
        expect( getDisplayName( laura ) ).toBe( "Laura" )
        expect( getDisplayName( blank ) ).toBe( "nadie@email.com" )
    } )

    test( "initials come from both names, or the first two letters", () => {
        expect( getInitials( laura ) ).toBe( "LE" )
        expect( getInitials( migrated ) ).toBe( "AZ" )
        expect( getInitials( blank ) ).toBe( "NA" )
    } )
} )
