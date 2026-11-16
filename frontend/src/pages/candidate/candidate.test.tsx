// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Tests for the candidate screens: home, job list, job detail with
//      the two ways to apply, applications and profile.
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
import {
    applicationRow,
    careerRows,
    internRow,
    internshipJobRow,
    jobRow,
    pendingJobRow,
    studentRow,
} from "@/test/fixtures.ts"
import type { Row } from "@/test/fixtures.ts"
import { API, server } from "@/test/server.ts"
import { mockSession, renderApp } from "@/test/utils.tsx"

const ok = ( data: unknown, status = 200 ) => HttpResponse.json( { success: true, data }, { status } )
const fail = ( status: number, message: string ) => HttpResponse.json( { success: false, message }, { status } )

// The two lists most candidate screens read.
function mockJobsAndApplications( jobs: Row[], applications: Row[] ) {
    server.use(
        http.get( `${ API }/announcements`, () => ok( jobs ) ),
        http.get( `${ API }/applications/me`, () => ok( applications ) )
    )
}

describe( "CandidateHomePage", () => {
    test( "shows the three numbers and recommends jobs the user has not applied to", async () => {
        mockSession( studentRow )
        mockJobsAndApplications( [ jobRow, internshipJobRow ], [ applicationRow ] )

        renderApp( <App />, "/dashboard" )

        expect( await screen.findByRole( "heading", { name: "Hola, Estudiante" } ) ).toBeInTheDocument()

        // 1 application in review = 1 active.
        const active = await screen.findByRole( "link", { name: /Aplicaciones activas/ } )
        expect( active ).toHaveTextContent( "1" )

        // Phone, career and semester are set; the CV is missing: 3 of 4.
        const profile = screen.getByRole( "link", { name: /Perfil completado/ } )
        expect( profile ).toHaveTextContent( "75%" )
        expect( profile ).toHaveTextContent( "Falta: CV" )

        // Job 1 already has an application, so only job 2 is recommended.
        const recommended = screen.getByRole( "region", { name: "Vacantes recomendadas" } )
        expect( await within( recommended ).findByRole( "link", { name: "Practicante de Recursos Humanos" } ) ).toHaveAttribute( "href", "/jobs/2" )
        expect( within( recommended ).queryByRole( "link", { name: "Desarrollador de Software Jr." } ) ).not.toBeInTheDocument()
    } )

    test( "shows an error with retry when the lists fail to load", async () => {
        const user = userEvent.setup()
        mockSession( studentRow )
        server.use(
            http.get( `${ API }/announcements`, () => fail( 500, "boom" ) ),
            http.get( `${ API }/applications/me`, () => ok( [] ) )
        )
        renderApp( <App />, "/dashboard" )

        expect( await screen.findByText( "Ocurrió un error en el servidor. Intenta de nuevo más tarde." ) ).toBeInTheDocument()

        mockJobsAndApplications( [ jobRow ], [] )
        await user.click( screen.getByRole( "button", { name: "Reintentar" } ) )

        expect( await screen.findByRole( "link", { name: "Desarrollador de Software Jr." } ) ).toBeInTheDocument()
    } )
} )

describe( "JobsPage", () => {
    test( "lists the open jobs", async () => {
        mockSession( studentRow )
        mockJobsAndApplications( [ jobRow, internshipJobRow ], [] )

        renderApp( <App />, "/jobs" )

        expect( await screen.findByText( "2 vacantes" ) ).toBeInTheDocument()
        expect( screen.getByRole( "link", { name: "Desarrollador de Software Jr." } ) ).toBeInTheDocument()
        expect( screen.getByText( "Híbrido · Tiempo completo · Junior · $15,000 al mes" ) ).toBeInTheDocument()
    } )

    test( "hides jobs whose expiration date already passed", async () => {
        mockSession( studentRow )
        mockJobsAndApplications( [ jobRow, { ...internshipJobRow, jb_pst_expiration_date: "2020-01-01T06:00:00.000Z" } ], [] )

        renderApp( <App />, "/jobs" )

        expect( await screen.findByText( "1 vacante" ) ).toBeInTheDocument()
        expect( screen.queryByRole( "link", { name: "Practicante de Recursos Humanos" } ) ).not.toBeInTheDocument()
    } )

    test( "filters by contract type", async () => {
        const user = userEvent.setup()
        mockSession( studentRow )
        mockJobsAndApplications( [ jobRow, internshipJobRow ], [] )
        renderApp( <App />, "/jobs" )
        await screen.findByText( "2 vacantes" )

        await user.selectOptions( screen.getByLabelText( "Tipo de contrato" ), "internship" )

        expect( await screen.findByText( "1 vacante" ) ).toBeInTheDocument()
        expect( screen.getByRole( "link", { name: "Practicante de Recursos Humanos" } ) ).toBeInTheDocument()
    } )

    test( "sends the search to the backend and explains an empty result", async () => {
        const user = userEvent.setup()
        mockSession( studentRow )
        const searches: ( string | null )[] = []
        server.use( http.get( `${ API }/announcements`, ( { request } ) => {
            const search = new URL( request.url ).searchParams.get( "search" )
            searches.push( search )
            return ok( search ? [] : [ jobRow ] )
        } ) )
        renderApp( <App />, "/jobs" )
        await screen.findByText( "1 vacante" )

        await user.type( screen.getByRole( "searchbox", { name: "Buscar vacantes" } ), "contador" )
        await user.click( screen.getByRole( "button", { name: "Buscar" } ) )

        expect( await screen.findByText( "No encontramos vacantes" ) ).toBeInTheDocument()
        expect( searches ).toEqual( [ null, "contador" ] )
    } )

    test( "saves a job and shows it under 'only saved'", async () => {
        const user = userEvent.setup()
        mockSession( studentRow )
        mockJobsAndApplications( [ jobRow, internshipJobRow ], [] )
        renderApp( <App />, "/jobs" )
        await screen.findByText( "2 vacantes" )

        await user.click( screen.getByRole( "button", { name: "Guardar Practicante de Recursos Humanos" } ) )
        await user.click( screen.getByRole( "checkbox", { name: "Solo guardadas" } ) )

        expect( await screen.findByText( "1 vacante" ) ).toBeInTheDocument()
        expect( screen.getByRole( "button", { name: "Quitar Practicante de Recursos Humanos de guardadas" } ) ).toHaveAttribute( "aria-pressed", "true" )
    } )
} )

describe( "JobDetailPage", () => {
    test( "applies without CV and then shows the application", async () => {
        const user = userEvent.setup()
        mockSession( studentRow )      // This student has no CV.
        let applications: Row[] = []
        let body: unknown = null
        server.use(
            http.get( `${ API }/announcements/1`, () => ok( jobRow ) ),
            http.get( `${ API }/applications/me`, () => ok( applications ) ),
            http.post( `${ API }/applications`, async ( { request } ) => {
                body = await request.json()
                applications = [ { ...applicationRow, app_status: "pending" } ]
                return ok( { id: 10 }, 201 )
            } )
        )
        renderApp( <App />, "/jobs/1" )

        expect( await screen.findByRole( "heading", { name: "Desarrollador de Software Jr." } ) ).toBeInTheDocument()
        expect( screen.getByRole( "link", { name: "Subir mi CV" } ) ).toHaveAttribute( "href", "/profile" )

        await user.click( screen.getByRole( "button", { name: "Postularme sin enviar CV" } ) )

        expect( await screen.findByText( "Ya te postulaste a esta vacante" ) ).toBeInTheDocument()
        expect( screen.getByRole( "status" ) ).toHaveTextContent( "Tu postulación quedó registrada." )
        expect( body ).toEqual( { job_posting_id: 1 } )
    } )

    test( "applies sending the CV through Roll Me", async () => {
        const user = userEvent.setup()
        mockSession( internRow )       // This intern has a CV.
        let applications: Row[] = []
        let body: unknown = null
        server.use(
            http.get( `${ API }/announcements/1`, () => ok( jobRow ) ),
            http.get( `${ API }/applications/me`, () => ok( applications ) ),
            http.post( `${ API }/users/roll-me`, async ( { request } ) => {
                body = await request.json()
                applications = [ { ...applicationRow, app_status: "pending" } ]
                return ok( { applicationId: 10, jobPostingId: 1 }, 201 )
            } )
        )
        renderApp( <App />, "/jobs/1" )

        await user.click( await screen.findByRole( "button", { name: "Postularme con mi CV" } ) )

        expect( await screen.findByRole( "status" ) ).toHaveTextContent( "Te postulaste y enviamos tu CV a la empresa." )
        expect( body ).toEqual( { jobPostingId: 1 } )
    } )

    test( "shows why Roll Me failed and lets the user try again", async () => {
        const user = userEvent.setup()
        mockSession( internRow )
        server.use(
            http.get( `${ API }/announcements/1`, () => ok( jobRow ) ),
            http.get( `${ API }/applications/me`, () => ok( [] ) ),
            http.post( `${ API }/users/roll-me`, () => fail( 502, "Your CV could not be sent to the company. Please try again." ) )
        )
        renderApp( <App />, "/jobs/1" )

        await user.click( await screen.findByRole( "button", { name: "Postularme con mi CV" } ) )

        expect( await screen.findByRole( "alert" ) ).toHaveTextContent( "No pudimos enviar tu CV a la empresa. Intenta de nuevo." )
        expect( screen.getByRole( "button", { name: "Postularme con mi CV" } ) ).toBeEnabled()
    } )

    test( "shows the status instead of the buttons when the user already applied", async () => {
        mockSession( studentRow )
        server.use(
            http.get( `${ API }/announcements/1`, () => ok( jobRow ) ),
            http.get( `${ API }/applications/me`, () => ok( [ applicationRow ] ) )
        )

        renderApp( <App />, "/jobs/1" )

        expect( await screen.findByText( "Ya te postulaste a esta vacante" ) ).toBeInTheDocument()
        expect( screen.getByText( "En revisión" ) ).toBeInTheDocument()
        expect( screen.queryByRole( "button", { name: /Postularme/ } ) ).not.toBeInTheDocument()
    } )

    test( "does not offer to apply to a job that is not published", async () => {
        mockSession( studentRow )
        server.use(
            http.get( `${ API }/announcements/3`, () => ok( pendingJobRow ) ),
            http.get( `${ API }/applications/me`, () => ok( [] ) )
        )

        renderApp( <App />, "/jobs/3" )

        expect( await screen.findByText( /no está publicada/ ) ).toBeInTheDocument()
        expect( screen.queryByRole( "button", { name: /Postularme/ } ) ).not.toBeInTheDocument()
    } )

    test( "shows a not found message for an unknown job", async () => {
        mockSession( studentRow )
        server.use(
            http.get( `${ API }/announcements/99`, () => fail( 404, "Job posting not found" ) ),
            http.get( `${ API }/applications/me`, () => ok( [] ) )
        )

        renderApp( <App />, "/jobs/99" )

        expect( await screen.findByRole( "alert" ) ).toHaveTextContent( "No encontramos esta vacante." )
        expect( screen.queryByRole( "button", { name: "Reintentar" } ) ).not.toBeInTheDocument()
    } )
} )

describe( "ApplicationsPage", () => {
    test( "lists the applications with their status", async () => {
        mockSession( studentRow )
        server.use( http.get( `${ API }/applications/me`, () => ok( [ applicationRow ] ) ) )

        renderApp( <App />, "/applications" )

        expect( await screen.findByRole( "link", { name: "Desarrollador de Software Jr." } ) ).toHaveAttribute( "href", "/jobs/1" )
        expect( screen.getByText( "En revisión" ) ).toBeInTheDocument()
        expect( screen.getByText( "1 en total, 1 activa" ) ).toBeInTheDocument()
        expect( screen.getByText( /Te postulaste el 5 oct/ ) ).toBeInTheDocument()
    } )

    test( "invites to explore jobs when there are none", async () => {
        mockSession( studentRow )
        server.use( http.get( `${ API }/applications/me`, () => ok( [] ) ) )

        renderApp( <App />, "/applications" )

        expect( await screen.findByText( "Todavía no te has postulado" ) ).toBeInTheDocument()
        expect( screen.getByRole( "link", { name: "Ver vacantes" } ) ).toHaveAttribute( "href", "/jobs" )
    } )
} )

describe( "ProfilePage", () => {
    test( "saves the profile with the fields of the role", async () => {
        const user = userEvent.setup()
        let saved: Row = studentRow
        let body: unknown = null
        mockSession( studentRow )
        server.use(
            http.get( `${ API }/careers`, () => ok( careerRows ) ),
            http.get( `${ API }/users/me`, () => ok( saved ) ),
            http.put( `${ API }/users/me`, async ( { request } ) => {
                body = await request.json()
                saved = { ...studentRow, phone: "8719990000", semester: 7 }
                return ok( { id: 2 } )
            } )
        )
        renderApp( <App />, "/profile" )

        const phone = await screen.findByLabelText( "Teléfono" )
        await user.clear( phone )
        await user.type( phone, "8719990000" )
        const semester = screen.getByLabelText( "Semestre" )
        await user.clear( semester )
        await user.type( semester, "7" )
        await user.click( screen.getByRole( "button", { name: "Guardar cambios" } ) )

        expect( await screen.findByText( "Guardamos tus cambios." ) ).toBeInTheDocument()
        expect( body ).toEqual( { phone: "8719990000", careerId: 1, semester: 7 } )
        expect( screen.getByLabelText( "Semestre" ) ).toHaveValue( 7 )
    } )

    test( "an intern always sends its three residency fields together", async () => {
        const user = userEvent.setup()
        let body: unknown = null
        mockSession( internRow )
        server.use(
            http.get( `${ API }/careers`, () => ok( careerRows ) ),
            http.put( `${ API }/users/me`, async ( { request } ) => {
                body = await request.json()
                return ok( { id: 3 } )
            } )
        )
        renderApp( <App />, "/profile" )

        const project = await screen.findByLabelText( "Proyecto" )
        await user.clear( project )
        await user.click( screen.getByRole( "button", { name: "Guardar cambios" } ) )

        await screen.findByText( "Guardamos tus cambios." )
        expect( body ).toEqual( {
            phone: "8717654321",
            careerId: 6,
            hostCompany: "Manufactura Digital de la Laguna",
            project: null,              // cleared: null, never an empty string
            endDate: "2026-07-15",
        } )
    } )

    test( "rejects a CV that is not a PDF before uploading it", async () => {
        // applyAccept off: lets the test pick a file the input would filter out.
        const user = userEvent.setup( { applyAccept: false } )
        mockSession( studentRow )
        server.use( http.get( `${ API }/careers`, () => ok( careerRows ) ) )
        renderApp( <App />, "/profile" )

        const file = new File( [ "hola" ], "cv.txt", { type: "text/plain" } )
        await user.upload( await screen.findByLabelText( "Archivo de CV en PDF" ), file )

        // No handler for POST /users/cv: an upload attempt would fail the test.
        expect( await screen.findByText( "Solo se aceptan archivos PDF." ) ).toBeInTheDocument()
    } )

    test( "uploads a PDF and shows the CV as loaded", async () => {
        const user = userEvent.setup()
        let current: Row = studentRow
        let fieldName: string | null = null
        mockSession( studentRow )
        server.use(
            http.get( `${ API }/careers`, () => ok( careerRows ) ),
            http.get( `${ API }/users/me`, () => ok( current ) ),
            http.post( `${ API }/users/cv`, async ( { request } ) => {
                // The multipart body is read as text: each part starts with
                // a header that names its form field.
                const body = await request.text()
                fieldName = /name="(\w+)"; filename="cv\.pdf"/.exec( body )?.[ 1 ] ?? null
                current = { ...studentRow, cv_url: "uploads/cvs/cv_2_1.pdf" }
                return ok( current )
            } )
        )
        renderApp( <App />, "/profile" )
        expect( await screen.findByText( "Aún no has subido tu CV" ) ).toBeInTheDocument()

        const file = new File( [ "%PDF-1.4" ], "cv.pdf", { type: "application/pdf" } )
        await user.upload( screen.getByLabelText( "Archivo de CV en PDF" ), file )

        expect( await screen.findByText( "Tu CV se guardó." ) ).toBeInTheDocument()
        expect( screen.getByText( "Tienes un CV cargado" ) ).toBeInTheDocument()
        expect( fieldName ).toBe( "cv" )
    } )

    test( "marks the current password when the backend says it is wrong, without closing the session", async () => {
        const user = userEvent.setup()
        mockSession( studentRow )
        server.use(
            http.get( `${ API }/careers`, () => ok( careerRows ) ),
            http.put( `${ API }/users/password`, () => fail( 401, "Current password is incorrect." ) )
        )
        renderApp( <App />, "/profile" )

        await user.type( await screen.findByLabelText( "Contraseña actual" ), "Vieja1234" )
        await user.type( screen.getByLabelText( "Nueva contraseña" ), "Nueva1234" )
        await user.type( screen.getByLabelText( "Repite la nueva contraseña" ), "Nueva1234" )
        await user.click( screen.getByRole( "button", { name: "Cambiar contraseña" } ) )

        expect( await screen.findByText( "La contraseña actual es incorrecta." ) ).toBeInTheDocument()
        // Still inside the app: a 401 from this endpoint is not a dead session.
        expect( screen.getByRole( "heading", { name: "Mi perfil" } ) ).toBeInTheDocument()
    } )
} )
