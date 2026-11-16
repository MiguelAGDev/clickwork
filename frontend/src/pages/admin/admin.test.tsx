// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Tests for the admin screens: home, review of companies and job
//      postings (approve, reject with a reason) and user accounts.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { describe, expect, test } from "vitest"

import { App } from "@/App.tsx"
import { adminRow, adminUserRows, companyRow, pendingCompanyRow, pendingJobRow } from "@/test/fixtures.ts"
import type { Row } from "@/test/fixtures.ts"
import { API, server } from "@/test/server.ts"
import { mockSession, renderApp } from "@/test/utils.tsx"

const ok = ( data: unknown ) => HttpResponse.json( { success: true, data } )
const done = ( message: string ) => HttpResponse.json( { success: true, message } )
const fail = ( status: number, message: string ) => HttpResponse.json( { success: false, message }, { status } )

// The card (row) that contains a heading with the given name.
function rowOf( name: string ): HTMLElement {
    return screen.getByRole( "heading", { name } ).closest( "div.rounded-xl" ) as HTMLElement
}

describe( "AdminHomePage", () => {
    test( "shows how much waits for review", async () => {
        mockSession( adminRow )
        server.use(
            http.get( `${ API }/admin/companies/pending`, () => ok( [ pendingCompanyRow ] ) ),
            http.get( `${ API }/admin/job-postings/pending`, () => ok( [ pendingJobRow ] ) ),
            http.get( `${ API }/admin/users`, () => ok( [ ...adminUserRows.slice( 0, 2 ), { ...adminUserRows[ 2 ], active: 0 } ] ) )
        )

        renderApp( <App />, "/dashboard" )

        // The preview list appears once the three lists are loaded.
        expect( await screen.findByText( "Grupo Nexo" ) ).toBeInTheDocument()
        expect( screen.getByRole( "link", { name: /Empresas por revisar/ } ) ).toHaveTextContent( "1" )
        expect( screen.getByRole( "link", { name: /Vacantes por revisar/ } ) ).toHaveTextContent( "1" )
        const users = screen.getByRole( "link", { name: /Usuarios activos/ } )
        expect( users ).toHaveTextContent( "2" )
        expect( users ).toHaveTextContent( "De 3 registrados" )
        expect( screen.getByText( "Analista de Datos" ) ).toBeInTheDocument()
    } )

    test( "says so when nothing waits", async () => {
        mockSession( adminRow )
        server.use(
            http.get( `${ API }/admin/companies/pending`, () => ok( [] ) ),
            http.get( `${ API }/admin/job-postings/pending`, () => ok( [] ) ),
            http.get( `${ API }/admin/users`, () => ok( adminUserRows ) )
        )

        renderApp( <App />, "/dashboard" )

        expect( await screen.findByText( "No hay nada por revisar" ) ).toBeInTheDocument()
    } )
} )

describe( "AdminCompaniesPage", () => {
    test( "approves a pending company, which then leaves the queue", async () => {
        const user = userEvent.setup()
        let companies: Row[] = [ companyRow, pendingCompanyRow ]
        let body: unknown = null
        mockSession( adminRow )
        server.use(
            http.get( `${ API }/admin/companies`, () => ok( companies ) ),
            http.patch( `${ API }/admin/companies/9/approval`, async ( { request } ) => {
                body = await request.json()
                companies = [ companyRow, { ...pendingCompanyRow, approval_status: "approved" } ]
                return done( "Company approval status updated to 'approved'." )
            } )
        )
        renderApp( <App />, "/admin/companies" )

        // The pending tab shows only the pending company.
        expect( await screen.findByRole( "heading", { name: "Grupo Nexo" } ) ).toBeInTheDocument()
        expect( screen.queryByRole( "heading", { name: "Manufactura Digital de la Laguna" } ) ).not.toBeInTheDocument()

        await user.click( screen.getByRole( "button", { name: "Aprobar Grupo Nexo" } ) )

        expect( await screen.findByText( "No hay empresas por revisar" ) ).toBeInTheDocument()
        expect( body ).toEqual( { status: "approved", reason: null } )
    } )

    test( "rejecting asks for a reason and sends it", async () => {
        const user = userEvent.setup()
        let companies: Row[] = [ pendingCompanyRow ]
        let body: unknown = null
        mockSession( adminRow )
        server.use(
            http.get( `${ API }/admin/companies`, () => ok( companies ) ),
            http.patch( `${ API }/admin/companies/9/approval`, async ( { request } ) => {
                body = await request.json()
                companies = [ { ...pendingCompanyRow, approval_status: "rejected", rejection_reason: "Datos incompletos" } ]
                return done( "Company approval status updated to 'rejected'." )
            } )
        )
        renderApp( <App />, "/admin/companies?view=all" )

        await user.click( await screen.findByRole( "button", { name: "Rechazar Grupo Nexo" } ) )
        const dialog = await screen.findByRole( "alertdialog" )

        // Without a reason nothing is sent.
        await user.click( within( dialog ).getByRole( "button", { name: "Rechazar" } ) )
        expect( within( dialog ).getByRole( "alert" ) ).toHaveTextContent( "Escribe el motivo del rechazo." )
        expect( body ).toBeNull()

        await user.type( within( dialog ).getByLabelText( "Motivo del rechazo" ), "Datos incompletos" )
        await user.click( within( dialog ).getByRole( "button", { name: "Rechazar" } ) )

        expect( await screen.findByText( "Motivo del rechazo: Datos incompletos" ) ).toBeInTheDocument()
        expect( body ).toEqual( { status: "rejected", reason: "Datos incompletos" } )
        // A rejected company can be approved later, but not rejected again.
        expect( within( rowOf( "Grupo Nexo" ) ).getByRole( "button", { name: "Aprobar Grupo Nexo" } ) ).toBeInTheDocument()
        expect( within( rowOf( "Grupo Nexo" ) ).queryByRole( "button", { name: "Rechazar Grupo Nexo" } ) ).not.toBeInTheDocument()
    } )

    test( "the 'all' tab lists every company with its status", async () => {
        mockSession( adminRow )
        server.use( http.get( `${ API }/admin/companies`, () => ok( [ companyRow, pendingCompanyRow ] ) ) )

        renderApp( <App />, "/admin/companies?view=all" )

        expect( within( await screen.findByRole( "heading", { name: "Manufactura Digital de la Laguna" } ).then( () => rowOf( "Manufactura Digital de la Laguna" ) ) ).getByText( "Aprobada" ) ).toBeInTheDocument()
        expect( within( rowOf( "Grupo Nexo" ) ).getByText( "En revisión" ) ).toBeInTheDocument()
        expect( screen.getByRole( "link", { name: /Pendientes/ } ) ).toHaveTextContent( "1" )
    } )

    test( "shows the backend reason when the approval fails", async () => {
        const user = userEvent.setup()
        mockSession( adminRow )
        server.use(
            http.get( `${ API }/admin/companies`, () => ok( [ pendingCompanyRow ] ) ),
            http.patch( `${ API }/admin/companies/9/approval`, () => fail( 404, "Company not found" ) )
        )
        renderApp( <App />, "/admin/companies" )

        await user.click( await screen.findByRole( "button", { name: "Aprobar Grupo Nexo" } ) )

        expect( await screen.findByRole( "alert" ) ).toHaveTextContent( "No encontramos la empresa." )
    } )
} )

describe( "AdminJobsPage", () => {
    test( "shows the pending postings with the company name and approves one", async () => {
        const user = userEvent.setup()
        let jobs: Row[] = [ pendingJobRow ]
        let body: unknown = null
        mockSession( adminRow )
        server.use(
            http.get( `${ API }/admin/job-postings/pending`, () => ok( jobs ) ),
            http.get( `${ API }/admin/companies`, () => ok( [ companyRow ] ) ),
            http.patch( `${ API }/admin/job-postings/3/approval`, async ( { request } ) => {
                body = await request.json()
                jobs = []
                return done( "Job posting approval status updated to 'approved'." )
            } )
        )
        renderApp( <App />, "/admin/jobs" )

        expect( await screen.findByRole( "heading", { name: "Analista de Datos" } ) ).toBeInTheDocument()
        // The posting only carries the company id; the name comes from the companies list.
        expect( screen.getByText( /^Manufactura Digital de la Laguna · / ) ).toBeInTheDocument()
        expect( screen.getByText( "Conocimientos en JavaScript y bases de datos relacionales." ) ).toBeInTheDocument()

        await user.click( screen.getByRole( "button", { name: "Aprobar Analista de Datos" } ) )

        expect( await screen.findByText( "No hay vacantes por revisar" ) ).toBeInTheDocument()
        expect( body ).toEqual( { status: "approved", reason: null } )
    } )

    test( "rejects a posting with a reason", async () => {
        const user = userEvent.setup()
        let jobs: Row[] = [ pendingJobRow ]
        let body: unknown = null
        mockSession( adminRow )
        server.use(
            http.get( `${ API }/admin/job-postings/pending`, () => ok( jobs ) ),
            http.get( `${ API }/admin/companies`, () => ok( [ companyRow ] ) ),
            http.patch( `${ API }/admin/job-postings/3/approval`, async ( { request } ) => {
                body = await request.json()
                jobs = []
                return done( "Job posting approval status updated to 'rejected'." )
            } )
        )
        renderApp( <App />, "/admin/jobs" )

        await user.click( await screen.findByRole( "button", { name: "Rechazar Analista de Datos" } ) )
        const dialog = await screen.findByRole( "alertdialog" )
        await user.type( within( dialog ).getByLabelText( "Motivo del rechazo" ), "Falta el sueldo" )
        await user.click( within( dialog ).getByRole( "button", { name: "Rechazar" } ) )

        expect( await screen.findByText( "No hay vacantes por revisar" ) ).toBeInTheDocument()
        expect( body ).toEqual( { status: "rejected", reason: "Falta el sueldo" } )
    } )
} )

describe( "AdminUsersPage", () => {
    test( "lists the accounts and filters them by role", async () => {
        const user = userEvent.setup()
        mockSession( adminRow )
        server.use( http.get( `${ API }/admin/users`, () => ok( adminUserRows ) ) )
        renderApp( <App />, "/admin/users" )

        expect( await screen.findByText( "3 cuentas" ) ).toBeInTheDocument()
        expect( within( rowOf( "empresa.seed@newman.test" ) ).getByText( /^Manufactura Digital de la Laguna/ ) ).toBeInTheDocument()

        await user.selectOptions( screen.getByLabelText( "Tipo de cuenta" ), "student" )

        expect( await screen.findByText( "1 cuenta de 3" ) ).toBeInTheDocument()
        expect( screen.getByRole( "heading", { name: "estudiante.seed@newman.test" } ) ).toBeInTheDocument()
        expect( screen.queryByRole( "heading", { name: "empresa.seed@newman.test" } ) ).not.toBeInTheDocument()
    } )

    test( "deactivates an account after confirming", async () => {
        const user = userEvent.setup()
        let users: Row[] = adminUserRows
        let toggled = false
        mockSession( adminRow )
        server.use(
            http.get( `${ API }/admin/users`, () => ok( users ) ),
            http.patch( `${ API }/admin/users/2/toggle-active`, () => {
                toggled = true
                users = adminUserRows.map( ( row ) => ( row.id === 2 ? { ...row, active: 0 } : row ) )
                return done( "User active status toggle succesfully" )
            } )
        )
        renderApp( <App />, "/admin/users" )

        await user.click( await screen.findByRole( "button", { name: "Desactivar estudiante.seed@newman.test" } ) )
        const dialog = await screen.findByRole( "alertdialog" )
        expect( dialog ).toHaveTextContent( "no podrá iniciar sesión" )
        expect( toggled ).toBe( false )

        await user.click( within( dialog ).getByRole( "button", { name: "Desactivar" } ) )

        expect( await screen.findByRole( "button", { name: "Reactivar estudiante.seed@newman.test" } ) ).toBeInTheDocument()
        expect( within( rowOf( "estudiante.seed@newman.test" ) ).getByText( "Inactiva" ) ).toBeInTheDocument()
        expect( toggled ).toBe( true )
    } )

    test( "does not let the admin deactivate its own account", async () => {
        mockSession( adminRow )
        server.use( http.get( `${ API }/admin/users`, () => ok( adminUserRows ) ) )

        renderApp( <App />, "/admin/users" )

        const own = within( await screen.findByRole( "heading", { name: "admin.seed@newman.test" } ).then( () => rowOf( "admin.seed@newman.test" ) ) )
        expect( own.getByText( "Tu cuenta" ) ).toBeInTheDocument()
        expect( own.queryByRole( "button" ) ).not.toBeInTheDocument()
    } )
} )

describe( "AccountPage", () => {
    test( "shows the admin account and the password form", async () => {
        mockSession( adminRow )

        renderApp( <App />, "/account" )

        expect( await screen.findByRole( "heading", { name: "Mi cuenta" } ) ).toBeInTheDocument()
        expect( screen.getByLabelText( "Correo electrónico" ) ).toHaveValue( "admin.seed@newman.test" )
        expect( screen.getByRole( "button", { name: "Cambiar contraseña" } ) ).toBeInTheDocument()
    } )
} )
