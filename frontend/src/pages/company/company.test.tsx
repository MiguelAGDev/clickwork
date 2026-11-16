// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Tests for the company screens: home, own job postings, the form
//      to create and edit a posting, applicants and company profile.
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
import { getToken } from "@/services/tokenStorage.ts"
import {
    applicantRow,
    careerRows,
    companyRow,
    companyUserRow,
    jobRow,
    pendingCompanyRow,
    pendingJobRow,
} from "@/test/fixtures.ts"
import type { Row } from "@/test/fixtures.ts"
import { API, server } from "@/test/server.ts"
import { mockSession, renderApp } from "@/test/utils.tsx"

const ok = ( data: unknown, status = 200 ) => HttpResponse.json( { success: true, data }, { status } )
const fail = ( status: number, message: string, extra: object = {} ) =>
    HttpResponse.json( { success: false, message, ...extra }, { status } )

const rejectedJobRow: Row = {
    ...jobRow,
    jb_pst_id: 4,
    jb_pst_job_title: "Auxiliar Contable",
    jb_pst_approval_status: "rejected",
    jb_pst_rejection_reason: "Falta el sueldo",
}

// Logs in as the seeded company and mocks what most of its screens read.
function mockCompany( company: Row = companyRow, jobs: Row[] = [ jobRow, pendingJobRow ] ) {
    mockSession( companyUserRow )
    server.use(
        http.get( `${ API }/company/me`, () => ok( company ) ),
        http.get( `${ API }/announcements/company/me`, () => ok( jobs ) ),
        http.get( `${ API }/careers`, () => ok( careerRows ) )
    )
}

describe( "CompanyHomePage", () => {
    test( "greets with the company name and shows its numbers", async () => {
        mockCompany()
        // Only the approved posting (id 1) is asked for applicants.
        server.use( http.get( `${ API }/applications/company/applicants/1`, () => ok( [ applicantRow, { ...applicantRow, id: 11 } ] ) ) )

        renderApp( <App />, "/dashboard" )

        // Three requests in a row (company, postings, then applicants) before
        // the name shows: give it more than the default second when the whole
        // suite runs at once.
        expect( await screen.findByRole( "heading", { name: "Hola, Manufactura Digital de la Laguna" }, { timeout: 4000 } ) ).toBeInTheDocument()
        expect( screen.getByRole( "link", { name: /Vacantes publicadas/ } ) ).toHaveTextContent( "1" )
        expect( screen.getByRole( "link", { name: /Vacantes en revisión/ } ) ).toHaveTextContent( "1" )
        expect( screen.getByText( "Postulaciones recibidas" ).parentElement ).toHaveTextContent( "2" )
        expect( screen.getByRole( "link", { name: "Nueva vacante" } ) ).toHaveAttribute( "href", "/company/jobs/new" )
    } )

    test( "explains that the company is in review and hides the way to publish", async () => {
        mockCompany( pendingCompanyRow, [] )

        renderApp( <App />, "/dashboard" )

        expect( await screen.findByText( "Tu empresa está en revisión" ) ).toBeInTheDocument()
        expect( screen.queryByRole( "link", { name: "Nueva vacante" } ) ).not.toBeInTheDocument()
        expect( screen.getByText( "Podrás publicar vacantes cuando un administrador apruebe tu empresa." ) ).toBeInTheDocument()
    } )

    test( "shows the rejection reason", async () => {
        mockCompany( { ...companyRow, approval_status: "rejected", rejection_reason: "RFC no válido" }, [] )

        renderApp( <App />, "/dashboard" )

        expect( await screen.findByText( "Tu empresa fue rechazada" ) ).toBeInTheDocument()
        expect( screen.getByText( /Motivo: RFC no válido/ ) ).toBeInTheDocument()
    } )
} )

describe( "CompanyJobsPage", () => {
    test( "lists the postings with their status and actions", async () => {
        mockCompany( companyRow, [ jobRow, pendingJobRow, rejectedJobRow ] )

        renderApp( <App />, "/company/jobs" )

        const approved = ( await screen.findByRole( "heading", { name: "Desarrollador de Software Jr." } ) ).closest( "div.rounded-xl" ) as HTMLElement
        expect( within( approved ).getByText( "Aprobada" ) ).toBeInTheDocument()
        expect( within( approved ).getByRole( "link", { name: "Aplicantes" } ) ).toHaveAttribute( "href", "/company/jobs/1/applicants" )

        // A posting that is not approved has no applicants to show.
        const pending = screen.getByRole( "heading", { name: "Analista de Datos" } ).closest( "div.rounded-xl" ) as HTMLElement
        expect( within( pending ).getByText( "En revisión" ) ).toBeInTheDocument()
        expect( within( pending ).queryByRole( "link", { name: "Aplicantes" } ) ).not.toBeInTheDocument()

        expect( screen.getByText( /Motivo del rechazo: Falta el sueldo/ ) ).toBeInTheDocument()
        expect( screen.getByRole( "link", { name: "Editar Auxiliar Contable" } ) ).toHaveAttribute( "href", "/company/jobs/4/edit" )
    } )
} )

describe( "JobFormPage", () => {
    test( "creates a posting and returns to the list with a notice", async () => {
        const user = userEvent.setup()
        let body: unknown = null
        mockCompany()
        server.use( http.post( `${ API }/announcements`, async ( { request } ) => {
            body = await request.json()
            return ok( { id: 14 }, 201 )
        } ) )
        renderApp( <App />, "/company/jobs/new" )

        await user.type( await screen.findByLabelText( "Título de la vacante" ), "Analista de Calidad" )
        await user.type( screen.getByLabelText( "Requisitos" ), "Ingeniería Industrial, inglés intermedio." )
        await user.selectOptions( screen.getByLabelText( "Modalidad" ), "on-site" )
        await user.selectOptions( screen.getByLabelText( "Tipo de contrato" ), "full-time" )
        await user.selectOptions( screen.getByLabelText( "Nivel de experiencia" ), "junior" )
        await user.type( screen.getByLabelText( "Horario" ), "Lunes a viernes, 8 a 5" )
        await user.type( screen.getByLabelText( /Sueldo mensual/ ), "14000" )
        await user.type( screen.getByLabelText( "Fecha de cierre" ), "2099-01-31" )
        await user.click( screen.getByRole( "checkbox", { name: "Ingeniería Industrial" } ) )
        await user.click( screen.getByRole( "button", { name: "Crear vacante" } ) )

        expect( await screen.findByText( /Vacante creada/ ) ).toBeInTheDocument()
        expect( screen.getByRole( "heading", { name: "Mis vacantes" } ) ).toBeInTheDocument()
        expect( body ).toEqual( {
            jb_pst_job_title: "Analista de Calidad",
            jb_pst_requirements: "Ingeniería Industrial, inglés intermedio.",
            jb_pst_benefits: null,
            jb_pst_modality: "on-site",
            jb_pst_schedule: "Lunes a viernes, 8 a 5",
            jb_pst_contract_type: "full-time",
            jb_pst_experience_level: "junior",
            jb_pst_expiration_date: "2099-01-31",
            jb_pst_salary: 14000,
            careerIds: [ 4 ],
        } )
    } )

    test( "requires the mandatory fields and rejects a past closing date", async () => {
        const user = userEvent.setup()
        mockCompany()
        renderApp( <App />, "/company/jobs/new" )

        await user.type( await screen.findByLabelText( "Fecha de cierre" ), "2020-01-01" )
        await user.click( screen.getByRole( "button", { name: "Crear vacante" } ) )

        expect( await screen.findByText( "La fecha de cierre no puede ser anterior a hoy." ) ).toBeInTheDocument()
        expect( screen.getByText( "Selecciona la modalidad." ) ).toBeInTheDocument()
        expect( screen.getByText( "Indica el horario." ) ).toBeInTheDocument()
    } )

    test( "does not show the form to a company that is not approved", async () => {
        mockCompany( pendingCompanyRow, [] )

        renderApp( <App />, "/company/jobs/new" )

        expect( await screen.findByText( "Tu empresa está en revisión" ) ).toBeInTheDocument()
        expect( screen.queryByLabelText( "Título de la vacante" ) ).not.toBeInTheDocument()
    } )

    test( "edits a posting: warns it goes back to review and keeps its careers", async () => {
        const user = userEvent.setup()
        let body: Record<string, unknown> | null = null
        mockCompany()
        server.use( http.put( `${ API }/announcements/1`, async ( { request } ) => {
            body = await request.json() as Record<string, unknown>
            return ok( { affectedRows: 1 } )
        } ) )
        renderApp( <App />, "/company/jobs/1/edit" )

        const title = await screen.findByLabelText( "Título de la vacante" )
        expect( title ).toHaveValue( "Desarrollador de Software Jr." )
        expect( screen.getByLabelText( "Fecha de cierre" ) ).toHaveValue( "2099-12-01" )
        expect( screen.getByText( "Esta vacante está publicada" ) ).toBeInTheDocument()

        await user.clear( title )
        await user.type( title, "Desarrollador de Software" )
        await user.click( screen.getByRole( "button", { name: "Guardar cambios" } ) )

        expect( await screen.findByText( /La vacante volvió a revisión/ ) ).toBeInTheDocument()
        expect( body ).toMatchObject( { jb_pst_job_title: "Desarrollador de Software", jb_pst_salary: 15000 } )
        // No career was checked, so the list is not sent at all.
        expect( body ).not.toHaveProperty( "careerIds" )
    } )

    test( "places a 422 error on its field", async () => {
        const user = userEvent.setup()
        mockCompany()
        server.use( http.put( `${ API }/announcements/1`, () => fail( 422, "Validation failed", {
            errors: [ { type: "field", msg: "Job title must not exceed 100 characters.", path: "jb_pst_job_title", location: "body" } ],
        } ) ) )
        renderApp( <App />, "/company/jobs/1/edit" )

        await user.type( await screen.findByLabelText( /Beneficios/ ), " Bono anual." )
        await user.click( screen.getByRole( "button", { name: "Guardar cambios" } ) )

        expect( await screen.findByText( "El título no puede pasar de 100 caracteres." ) ).toBeInTheDocument()
        expect( screen.getByLabelText( "Título de la vacante" ) ).toHaveAttribute( "aria-invalid", "true" )
    } )

    test( "does not open a posting of another company", async () => {
        mockCompany( companyRow, [ jobRow ] )

        renderApp( <App />, "/company/jobs/999/edit" )

        expect( await screen.findByText( "No encontramos esta vacante entre las de tu empresa." ) ).toBeInTheDocument()
    } )
} )

describe( "ApplicantsPage", () => {
    test( "lists who applied and changes a status", async () => {
        const user = userEvent.setup()
        let body: unknown = null
        mockCompany()
        server.use(
            http.get( `${ API }/applications/company/applicants/1`, () => ok( [ applicantRow ] ) ),
            http.patch( `${ API }/applications/10/status`, async ( { request } ) => {
                body = await request.json()
                return HttpResponse.json( { success: true, message: "Application status updated to 'interview'." } )
            } )
        )
        renderApp( <App />, "/company/jobs/1/applicants" )

        expect( await screen.findByRole( "heading", { name: "Laura Estudiante" } ) ).toBeInTheDocument()
        expect( screen.getByRole( "link", { name: "estudiante.seed@newman.test" } ) ).toHaveAttribute( "href", "mailto:estudiante.seed@newman.test" )
        expect( screen.getByText( "Desarrollador de Software Jr. · 1 postulación" ) ).toBeInTheDocument()

        const select = screen.getByLabelText( "Estado de la postulación de Laura Estudiante" )
        expect( select ).toHaveValue( "pending" )
        await user.selectOptions( select, "interview" )

        // The badge next to the email follows the new status.
        expect( await screen.findByText( "Entrevista", { selector: "span" } ) ).toBeInTheDocument()
        expect( select ).toHaveValue( "interview" )
        expect( body ).toEqual( { status: "interview" } )
    } )

    test( "keeps the old status and says why when the change fails", async () => {
        const user = userEvent.setup()
        mockCompany()
        server.use(
            http.get( `${ API }/applications/company/applicants/1`, () => ok( [ applicantRow ] ) ),
            http.patch( `${ API }/applications/10/status`, () => fail( 404, "Application not found" ) )
        )
        renderApp( <App />, "/company/jobs/1/applicants" )

        const select = await screen.findByLabelText( "Estado de la postulación de Laura Estudiante" )
        await user.selectOptions( select, "accepted" )

        expect( await screen.findByRole( "alert" ) ).toHaveTextContent( "No encontramos esta postulación." )
        expect( select ).toHaveValue( "pending" )
    } )

    test( "shows an empty state when nobody applied", async () => {
        mockCompany()
        server.use( http.get( `${ API }/applications/company/applicants/1`, () => ok( [] ) ) )

        renderApp( <App />, "/company/jobs/1/applicants" )

        expect( await screen.findByText( "Todavía nadie se ha postulado" ) ).toBeInTheDocument()
    } )

    test( "reports a posting that belongs to another company", async () => {
        mockCompany()
        server.use( http.get( `${ API }/applications/company/applicants/50`, () => fail(
            403,
            "You are not authorized to view applicants for this job posting."
        ) ) )

        renderApp( <App />, "/company/jobs/50/applicants" )

        expect( await screen.findByRole( "alert" ) ).toHaveTextContent( "Esta vacante no pertenece a tu empresa." )
        expect( screen.queryByRole( "button", { name: "Reintentar" } ) ).not.toBeInTheDocument()
    } )
} )

describe( "CompanyProfilePage", () => {
    test( "saves the company data", async () => {
        const user = userEvent.setup()
        let body: unknown = null
        let current: Row = companyRow
        mockCompany()
        server.use(
            http.get( `${ API }/company/me`, () => ok( current ) ),
            http.put( `${ API }/company/me`, async ( { request } ) => {
                body = await request.json()
                current = { ...companyRow, city: "Gómez Palacio" }
                return HttpResponse.json( { success: true, message: "Company updated successfully" } )
            } )
        )
        renderApp( <App />, "/company/profile" )

        const city = await screen.findByLabelText( "Ciudad" )
        await user.clear( city )
        await user.type( city, "Gómez Palacio" )
        await user.click( screen.getByRole( "button", { name: "Guardar cambios" } ) )

        expect( await screen.findByText( "Guardamos los datos de tu empresa." ) ).toBeInTheDocument()
        expect( body ).toEqual( {
            cmp_name: "Manufactura Digital de la Laguna",
            cmp_size: "medium",
            cmp_industry: "Software Development",
            cmp_city: "Gómez Palacio",
            cmp_state: "Coahuila",
            cmp_address: "Blvd. Independencia #500",
            cmp_contact_email: "contacto.seed@newman.test",
        } )
    } )

    test( "pauses the company after confirming, and can resume it", async () => {
        const user = userEvent.setup()
        let active = true
        mockCompany()
        server.use( http.patch( `${ API }/company/toggle-active`, () => {
            active = !active
            return HttpResponse.json( { success: true, message: "ok", data: { active } } )
        } ) )
        renderApp( <App />, "/company/profile" )

        await user.click( await screen.findByRole( "button", { name: "Pausar empresa" } ) )

        const dialog = await screen.findByRole( "alertdialog" )
        expect( dialog ).toHaveTextContent( /Tu cuenta sigue activa/ )
        expect( active ).toBe( true )      // Nothing is sent until the user confirms.

        await user.click( within( dialog ).getByRole( "button", { name: "Sí, pausar" } ) )

        // Still logged in, on the same screen, with the paused notice.
        expect( await screen.findByRole( "button", { name: "Reanudar empresa" } ) ).toBeInTheDocument()
        expect( screen.getByText( "Tu empresa está en pausa" ) ).toBeInTheDocument()
        expect( getToken() ).not.toBeNull()

        await user.click( screen.getByRole( "button", { name: "Reanudar empresa" } ) )

        expect( await screen.findByRole( "button", { name: "Pausar empresa" } ) ).toBeInTheDocument()
        expect( screen.queryByText( "Tu empresa está en pausa" ) ).not.toBeInTheDocument()
    } )

    test( "cancelling the confirmation pauses nothing", async () => {
        const user = userEvent.setup()
        mockCompany()
        renderApp( <App />, "/company/profile" )

        await user.click( await screen.findByRole( "button", { name: "Pausar empresa" } ) )
        await user.click( within( await screen.findByRole( "alertdialog" ) ).getByRole( "button", { name: "Cancelar" } ) )

        // No handler for PATCH /company/toggle-active: calling it would fail the test.
        expect( screen.queryByRole( "alertdialog" ) ).not.toBeInTheDocument()
        expect( screen.getByRole( "heading", { name: "Perfil de la empresa" } ) ).toBeInTheDocument()
    } )
} )
