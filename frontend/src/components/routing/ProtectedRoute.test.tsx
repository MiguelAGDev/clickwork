// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Tests for the route guards: who gets in, who is sent to login
//      and who sees the "no permission" screen.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { screen } from "@testing-library/react"
import { Route, Routes } from "react-router-dom"
import { describe, expect, test } from "vitest"

import { ProtectedRoute, PublicOnlyRoute } from "@/components/routing/ProtectedRoute.tsx"
import { adminRow, studentRow } from "@/test/fixtures.ts"
import { mockSession, renderApp } from "@/test/utils.tsx"

function TestRoutes() {
    return (
        <Routes>
            <Route element={ <PublicOnlyRoute /> }>
                <Route path="/login" element={ <p>login screen</p> } />
            </Route>
            <Route element={ <ProtectedRoute /> }>
                <Route path="/dashboard" element={ <p>dashboard screen</p> } />
            </Route>
            <Route element={ <ProtectedRoute roles={ [ "admin" ] } /> }>
                <Route path="/admin/users" element={ <p>admin screen</p> } />
            </Route>
        </Routes>
    )
}

describe( "ProtectedRoute", () => {
    test( "sends an anonymous visitor to login", () => {
        renderApp( <TestRoutes />, "/dashboard" )

        expect( screen.getByText( "login screen" ) ).toBeInTheDocument()
    } )

    test( "lets a logged-in user in", async () => {
        mockSession( studentRow )

        renderApp( <TestRoutes />, "/dashboard" )

        expect( await screen.findByText( "dashboard screen" ) ).toBeInTheDocument()
    } )

    test( "shows the no-permission screen to another role", async () => {
        mockSession( studentRow )

        renderApp( <TestRoutes />, "/admin/users" )

        expect( await screen.findByRole( "heading", { name: /no está disponible para tu cuenta/i } ) ).toBeInTheDocument()
        expect( screen.queryByText( "admin screen" ) ).not.toBeInTheDocument()
    } )

    test( "lets the allowed role in", async () => {
        mockSession( adminRow )

        renderApp( <TestRoutes />, "/admin/users" )

        expect( await screen.findByText( "admin screen" ) ).toBeInTheDocument()
    } )
} )

describe( "PublicOnlyRoute", () => {
    test( "sends a logged-in user away from login", async () => {
        mockSession( studentRow )

        renderApp( <TestRoutes />, "/login" )

        expect( await screen.findByText( "dashboard screen" ) ).toBeInTheDocument()
    } )
} )
