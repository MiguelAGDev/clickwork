// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      End-to-end: automatic accessibility scan (axe) of the main screen
//      of each role. It fails on serious or critical problems: missing
//      labels, unreadable contrast, broken ARIA.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"
import type { Page } from "@playwright/test"

import { loginAs } from "./helpers.ts"
import type { SeedUser } from "./helpers.ts"

// Scans the page and returns "rule: element" for each serious problem.
async function seriousProblems( page: Page ): Promise<string[]> {
    await page.waitForLoadState( "networkidle" )
    const { violations } = await new AxeBuilder( { page } ).withTags( [ "wcag2a", "wcag2aa" ] ).analyze()

    return violations
        .filter( ( violation ) => violation.impact === "serious" || violation.impact === "critical" )
        .flatMap( ( violation ) => violation.nodes.map( ( node ) => `${ violation.id }: ${ node.target.join( " " ) }` ) )
}

for( const path of [ "/login", "/register", "/forgot-password" ] ) {
    test( `public screen ${ path } has no serious accessibility problems`, async ( { page } ) => {
        await page.goto( path )
        expect( await seriousProblems( page ) ).toEqual( [] )
    } )
}

const PRIVATE_SCREENS: [ SeedUser, string[] ][] = [
    [ "student", [ "/dashboard", "/jobs", "/jobs/1", "/applications", "/profile" ] ],
    [ "company", [ "/dashboard", "/company/jobs", "/company/jobs/new", "/company/jobs/1/applicants", "/company/profile" ] ],
    [ "admin", [ "/dashboard", "/admin/companies?view=all", "/admin/jobs", "/admin/users" ] ],
]

for( const [ who, paths ] of PRIVATE_SCREENS ) {
    test( `the ${ who } screens have no serious accessibility problems`, async ( { page } ) => {
        await loginAs( page, who )

        for( const path of paths ) {
            await page.goto( path )
            await expect( page.getByRole( "heading", { level: 1 } ) ).toBeVisible()
            expect( await seriousProblems( page ), path ).toEqual( [] )
        }
    } )
}
