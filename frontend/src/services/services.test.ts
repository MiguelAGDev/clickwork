// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Tests for the services: that each one reads the real backend
//      shape and hands the UI a normalized object, and that it sends
//      the body the backend validates.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { http, HttpResponse } from "msw"
import { describe, expect, test } from "vitest"

import { getApplicants, getMyApplications } from "@/services/applicationService.ts"
import { getMyCompany, updateMyCompany } from "@/services/companyService.ts"
import { createJobPosting, getJobPostings } from "@/services/jobPostingService.ts"
import { getMe, updateMe } from "@/services/userService.ts"
import { getUsers, setCompanyApproval } from "@/services/adminService.ts"
import {
    adminUserRows,
    applicantRow,
    applicationRow,
    companyRow,
    graduateRow,
    internRow,
    internshipJobRow,
    jobRow,
    studentRow,
} from "@/test/fixtures.ts"
import { API, server } from "@/test/server.ts"

const ok = ( data: unknown ) => HttpResponse.json( { success: true, data } )

describe( "userService", () => {
    test( "getMe normalizes a student", async () => {
        server.use( http.get( `${ API }/users/me`, () => ok( studentRow ) ) )

        const user = await getMe()

        expect( user ).toMatchObject( {
            id: 2,
            role: "student",
            careerId: 1,
            careerName: "Ingeniería Sistemas Computacionales",
            cvUrl: null,
            semester: 6,
            graduationYear: null,
        } )
    } )

    test( "getMe reads graduate_year as graduationYear", async () => {
        server.use( http.get( `${ API }/users/me`, () => ok( graduateRow ) ) )

        const user = await getMe()

        expect( user.graduationYear ).toBe( 2024 )
        expect( user.currentJob ).toBe( "Ingeniero de Procesos" )
    } )

    test( "getMe turns intern timestamps into calendar dates", async () => {
        server.use( http.get( `${ API }/users/me`, () => ok( internRow ) ) )

        const user = await getMe()

        expect( user.startDate ).toBe( "2026-01-15" )
        expect( user.endDate ).toBe( "2026-07-15" )
    } )

    test( "updateMe sends the body and returns the profile read again", async () => {
        let body: unknown = null
        server.use(
            http.put( `${ API }/users/me`, async ( { request } ) => {
                body = await request.json()
                // The real answer has no role fields; it must not be used as the user.
                return HttpResponse.json( { success: true, data: { id: 2, email: "x" } } )
            } ),
            http.get( `${ API }/users/me`, () => ok( { ...studentRow, semester: 7 } ) )
        )

        const user = await updateMe( { phone: "8711234567", careerId: 1, semester: 7 } )

        expect( body ).toEqual( { phone: "8711234567", careerId: 1, semester: 7 } )
        expect( user.semester ).toBe( 7 )
        expect( user.role ).toBe( "student" )
    } )
} )

describe( "jobPostingService", () => {
    test( "getJobPostings removes duplicates and normalizes fields", async () => {
        // A posting linked to two careers comes twice from the backend.
        server.use( http.get( `${ API }/announcements`, () => ok( [ jobRow, jobRow, internshipJobRow ] ) ) )

        const postings = await getJobPostings()

        expect( postings.map( ( p ) => p.id ) ).toEqual( [ 1, 2 ] )
        expect( postings[ 0 ] ).toMatchObject( {
            title: "Desarrollador de Software Jr.",
            modality: "hybrid",
            contractType: "full-time",
            publicationDate: "2026-09-01",
            salary: 15000,
            companyId: 5,
        } )
        expect( postings[ 1 ].salary ).toBe( 6000 )     // arrived as "6000.00"
    } )

    test( "getJobPostings sends only the filters the backend applies and filters the rest itself", async () => {
        let query: URLSearchParams | null = null
        server.use( http.get( `${ API }/announcements`, ( { request } ) => {
            query = new URL( request.url ).searchParams
            return ok( [ jobRow, internshipJobRow ] )
        } ) )

        const postings = await getJobPostings( { search: " recursos ", modality: "on-site", contractType: "internship" } )

        expect( Object.fromEntries( query! ) ).toEqual( { search: "recursos", modality: "on-site" } )
        expect( postings.map( ( p ) => p.id ) ).toEqual( [ 2 ] )
    } )

    test( "createJobPosting sends the jb_pst_ prefixed body", async () => {
        let body: unknown = null
        server.use( http.post( `${ API }/announcements`, async ( { request } ) => {
            body = await request.json()
            return HttpResponse.json( { success: true, data: { id: 14 } }, { status: 201 } )
        } ) )

        const id = await createJobPosting( {
            title: "Analista de Datos",
            requirements: "SQL",
            benefits: "",
            modality: "remote",
            schedule: "Lunes a viernes",
            contractType: "part-time",
            experienceLevel: "mid",
            expirationDate: "2027-01-31",
            salary: null,
            careerIds: [ 1, 4 ],
        } )

        expect( id ).toBe( 14 )
        expect( body ).toEqual( {
            jb_pst_job_title: "Analista de Datos",
            jb_pst_requirements: "SQL",
            jb_pst_benefits: null,
            jb_pst_modality: "remote",
            jb_pst_schedule: "Lunes a viernes",
            jb_pst_contract_type: "part-time",
            jb_pst_experience_level: "mid",
            jb_pst_expiration_date: "2027-01-31",
            jb_pst_salary: null,
            careerIds: [ 1, 4 ],
        } )
    } )
} )

describe( "applicationService", () => {
    test( "getMyApplications splits the joined row into application and job", async () => {
        server.use( http.get( `${ API }/applications/me`, () => ok( [ applicationRow ] ) ) )

        const [ application ] = await getMyApplications()

        expect( application ).toMatchObject( { id: 10, status: "under_review", date: "2026-10-05" } )
        expect( application.job ).toMatchObject( { id: 1, title: "Desarrollador de Software Jr." } )
    } )

    test( "getApplicants reads the aliased columns", async () => {
        server.use( http.get( `${ API }/applications/company/applicants/1`, () => ok( [ applicantRow ] ) ) )

        const [ applicant ] = await getApplicants( 1 )

        expect( applicant ).toEqual( {
            id: 10,
            date: "2026-10-05",
            status: "pending",
            applicantId: 2,
            jobPostingId: 1,
            email: "estudiante.seed@newman.test",
            phone: "8711234567",
            cvUrl: null,
        } )
    } )
} )

describe( "companyService", () => {
    test( "getMyCompany normalizes the company", async () => {
        server.use( http.get( `${ API }/company/me`, () => ok( companyRow ) ) )

        const company = await getMyCompany()

        expect( company ).toMatchObject( {
            id: 5,
            name: "Manufactura Digital de la Laguna",
            contactEmail: "contacto.seed@newman.test",
            approvalStatus: "approved",
            rejectionReason: null,
        } )
    } )

    test( "updateMyCompany sends the cmp_ prefixed body", async () => {
        let body: unknown = null
        server.use(
            http.put( `${ API }/company/me`, async ( { request } ) => {
                body = await request.json()
                return HttpResponse.json( { success: true, message: "Company updated successfully" } )
            } ),
            http.get( `${ API }/company/me`, () => ok( companyRow ) )
        )

        await updateMyCompany( {
            name: "Manufactura Digital de la Laguna",
            size: "medium",
            industry: "Software Development",
            city: "Torreón",
            state: "Coahuila",
            address: "Blvd. Independencia #500",
            contactEmail: "contacto.seed@newman.test",
        } )

        expect( body ).toEqual( {
            cmp_name: "Manufactura Digital de la Laguna",
            cmp_size: "medium",
            cmp_industry: "Software Development",
            cmp_city: "Torreón",
            cmp_state: "Coahuila",
            cmp_address: "Blvd. Independencia #500",
            cmp_contact_email: "contacto.seed@newman.test",
        } )
    } )
} )

describe( "adminService", () => {
    test( "getUsers normalizes flags and company summary", async () => {
        server.use( http.get( `${ API }/admin/users`, () => ok( adminUserRows ) ) )

        const users = await getUsers()

        expect( users[ 0 ] ).toEqual( {
            id: 5,
            email: "empresa.seed@newman.test",
            phone: "8718889999",
            active: true,
            emailVerified: true,
            role: "company",
            careerName: null,
            companyName: "Manufactura Digital de la Laguna",
            companyApprovalStatus: "approved",
        } )
    } )

    test( "setCompanyApproval sends status and reason", async () => {
        let body: unknown = null
        server.use( http.patch( `${ API }/admin/companies/9/approval`, async ( { request } ) => {
            body = await request.json()
            return HttpResponse.json( { success: true, message: "Company approval status updated to 'rejected'." } )
        } ) )

        await setCompanyApproval( 9, "rejected", "Datos incompletos" )

        expect( body ).toEqual( { status: "rejected", reason: "Datos incompletos" } )
    } )
} )
