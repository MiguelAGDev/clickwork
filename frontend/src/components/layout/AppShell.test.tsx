// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Tests for the frame of the private screens: each role sees its
//      own navigation, the user menu closes the session, and unknown
//      URLs show the 404 screen.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test } from "vitest"

import { App } from "@/App.tsx"
import { getToken } from "@/services/tokenStorage.ts"
import { adminRow, companyUserRow, studentRow } from "@/test/fixtures.ts"
import type { Row } from "@/test/fixtures.ts"
import { mockSession, renderApp } from "@/test/utils.tsx"

// Names of the links in the main navigation, in order.
async function navLabels( userRow: Row ): Promise<string[]> {
    mockSession( userRow )
    renderApp( <App />, "/dashboard" )

    const nav = await screen.findByRole( "navigation", { name: "Principal" } )
    return within( nav ).getAllByRole( "link" ).map( ( link ) => link.textContent ?? "" )
}

describe( "AppShell", () => {
    test( "shows the candidate navigation", async () => {
        expect( await navLabels( studentRow ) ).toEqual( [ "Inicio", "Vacantes", "Aplicaciones", "Perfil" ] )
    } )

    test( "shows the company navigation", async () => {
        expect( await navLabels( companyUserRow ) ).toEqual( [ "Inicio", "Mis vacantes", "Perfil" ] )
    } )

    test( "shows the admin navigation", async () => {
        expect( await navLabels( adminRow ) ).toEqual( [ "Inicio", "Empresas", "Vacantes", "Usuarios" ] )
    } )

    test( "marks the link of the current page", async () => {
        mockSession( studentRow )
        renderApp( <App />, "/dashboard" )

        const nav = await screen.findByRole( "navigation", { name: "Principal" } )

        expect( within( nav ).getByRole( "link", { name: "Inicio" } ) ).toHaveAttribute( "aria-current", "page" )
        expect( within( nav ).getByRole( "link", { name: "Vacantes" } ) ).not.toHaveAttribute( "aria-current" )
    } )

    test( "the user menu closes the session", async () => {
        const user = userEvent.setup()
        mockSession( studentRow )
        renderApp( <App />, "/dashboard" )

        await user.click( await screen.findByRole( "button", { name: "Menú de usuario" } ) )
        expect( await screen.findByText( "estudiante.seed@newman.test" ) ).toBeInTheDocument()
        await user.click( screen.getByRole( "menuitem", { name: "Cerrar sesión" } ) )

        expect( await screen.findByRole( "heading", { name: "Inicia sesión" } ) ).toBeInTheDocument()
        expect( getToken() ).toBeNull()
    } )

    test( "hides the sections of other roles", async () => {
        mockSession( studentRow )
        renderApp( <App />, "/admin/users" )

        expect( await screen.findByRole( "heading", { name: /no está disponible para tu cuenta/i } ) ).toBeInTheDocument()
    } )
} )

describe( "NotFoundPage", () => {
    test( "shows the 404 screen for an unknown URL", () => {
        renderApp( <App />, "/esta-ruta-no-existe" )

        expect( screen.getByRole( "heading", { name: "No encontramos esta página" } ) ).toBeInTheDocument()
    } )
} )
