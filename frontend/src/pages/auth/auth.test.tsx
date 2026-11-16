// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Tests for the public screens: login, register, email
//      verification and password recovery. Each one covers the happy
//      path and at least one failure, with the answers the real backend
//      gives.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { describe, expect, test } from "vitest"

import { App } from "@/App.tsx"
import { careerRows, studentRow } from "@/test/fixtures.ts"
import { API, server } from "@/test/server.ts"
import { makeToken, renderApp } from "@/test/utils.tsx"

const fail = ( status: number, message: string, extra: object = {} ) =>
    HttpResponse.json( { success: false, message, ...extra }, { status } )

describe( "LoginPage", () => {
    test( "logs in and lands on the dashboard", async () => {
        const user = userEvent.setup()
        let body: unknown = null
        server.use(
            http.post( `${ API }/auth/login`, async ( { request } ) => {
                body = await request.json()
                return HttpResponse.json( {
                    success: true,
                    token: makeToken(),
                    user: { id: 2, email: studentRow.email, role: "student", permissions: 4095 },
                } )
            } ),
            http.get( `${ API }/users/me`, () => HttpResponse.json( { success: true, data: studentRow } ) )
        )
        renderApp( <App />, "/login" )

        await user.type( screen.getByLabelText( "Correo electrónico" ), "estudiante.seed@newman.test" )
        await user.type( screen.getByLabelText( "Contraseña" ), "Secret123" )
        await user.click( screen.getByRole( "button", { name: "Iniciar sesión" } ) )

        expect( await screen.findByRole( "heading", { name: "Hola, Laura" } ) ).toBeInTheDocument()
        expect( body ).toEqual( { email: "estudiante.seed@newman.test", password: "Secret123" } )
    } )

    test( "shows the backend reason when the credentials are wrong", async () => {
        const user = userEvent.setup()
        server.use( http.post( `${ API }/auth/login`, () => fail( 401, "Invalid email or password." ) ) )
        renderApp( <App />, "/login" )

        await user.type( screen.getByLabelText( "Correo electrónico" ), "estudiante.seed@newman.test" )
        await user.type( screen.getByLabelText( "Contraseña" ), "wrong" )
        await user.click( screen.getByRole( "button", { name: "Iniciar sesión" } ) )

        expect( await screen.findByRole( "alert" ) ).toHaveTextContent( "Correo o contraseña incorrectos." )
        expect( screen.getByRole( "heading", { name: "Inicia sesión" } ) ).toBeInTheDocument()
    } )

    test( "tells an unverified account to verify its email", async () => {
        const user = userEvent.setup()
        server.use( http.post( `${ API }/auth/login`, () => fail( 403, "Please verify your email before logging in." ) ) )
        renderApp( <App />, "/login" )

        await user.type( screen.getByLabelText( "Correo electrónico" ), "nuevo@correo.com" )
        await user.type( screen.getByLabelText( "Contraseña" ), "Secret123" )
        await user.click( screen.getByRole( "button", { name: "Iniciar sesión" } ) )

        expect( await screen.findByRole( "alert" ) ).toHaveTextContent( "Verifica tu correo antes de iniciar sesión." )
        expect( screen.getByRole( "link", { name: /reenviar verificación/i } ) ).toHaveAttribute( "href", "/resend-verification" )
    } )

    test( "validates the fields before calling the backend", async () => {
        const user = userEvent.setup()
        renderApp( <App />, "/login" )

        await user.type( screen.getByLabelText( "Correo electrónico" ), "no-es-un-correo" )
        await user.click( screen.getByRole( "button", { name: "Iniciar sesión" } ) )

        // No handler is registered for /auth/login: reaching it would fail the test.
        expect( await screen.findByText( "Escribe un correo válido." ) ).toBeInTheDocument()
        expect( screen.getByText( "Escribe tu contraseña." ) ).toBeInTheDocument()
    } )

    test( "sends a visitor without session from a private page to the login", () => {
        renderApp( <App />, "/dashboard" )

        expect( screen.getByRole( "heading", { name: "Inicia sesión" } ) ).toBeInTheDocument()
    } )
} )

describe( "RegisterPage", () => {
    test( "registers a student with the fields of its role", async () => {
        const user = userEvent.setup()
        let body: unknown = null
        server.use(
            http.get( `${ API }/careers`, () => HttpResponse.json( { success: true, data: careerRows } ) ),
            http.post( `${ API }/auth/register`, async ( { request } ) => {
                body = await request.json()
                return HttpResponse.json(
                    { success: true, message: "Account created. Please check your inbox to verify your email." },
                    { status: 201 }
                )
            } )
        )
        renderApp( <App />, "/register" )

        await user.type( screen.getByLabelText( "Nombre", { exact: true } ), " Nueva " )
        await user.type( screen.getByLabelText( "Apellido" ), "Cuenta" )
        await user.type( screen.getByLabelText( "Correo electrónico" ), "nueva@correo.com" )
        await user.type( screen.getByLabelText( "Contraseña" ), "Secret123" )
        await user.selectOptions( await screen.findByLabelText( /Carrera/ ), await screen.findByRole( "option", { name: "Ingeniería Industrial" } ) )
        await user.type( screen.getByLabelText( "Semestre" ), "6" )
        await user.click( screen.getByRole( "button", { name: "Crear cuenta" } ) )

        expect( await screen.findByRole( "heading", { name: "Revisa tu correo" } ) ).toBeInTheDocument()
        expect( screen.getByText( "nueva@correo.com" ) ).toBeInTheDocument()
        expect( body ).toEqual( {
            role: "student",
            firstName: "Nueva",      // trimmed before sending
            lastName: "Cuenta",
            email: "nueva@correo.com",
            password: "Secret123",
            careerId: 4,
            semester: 6,
        } )
    } )

    test( "switches to the company fields and sends them", async () => {
        const user = userEvent.setup()
        let body: unknown = null
        server.use(
            http.get( `${ API }/careers`, () => HttpResponse.json( { success: true, data: careerRows } ) ),
            http.post( `${ API }/auth/register`, async ( { request } ) => {
                body = await request.json()
                return HttpResponse.json( { success: true, message: "ok" }, { status: 201 } )
            } )
        )
        renderApp( <App />, "/register" )

        await user.click( screen.getByRole( "radio", { name: /Empresa/ } ) )

        // The student and candidate fields are gone, the company ones are in.
        expect( screen.queryByLabelText( "Semestre" ) ).not.toBeInTheDocument()
        expect( screen.queryByLabelText( /Carrera/ ) ).not.toBeInTheDocument()

        await user.type( screen.getByLabelText( "Nombre del contacto" ), "Rosa" )
        await user.type( screen.getByLabelText( "Apellido" ), "Nexo" )
        await user.type( screen.getByLabelText( "Correo electrónico" ), "rh@gruponexo.com" )
        await user.type( screen.getByLabelText( "Contraseña" ), "Secret123" )
        await user.type( screen.getByLabelText( "Nombre de la empresa" ), "Grupo Nexo" )
        await user.selectOptions( screen.getByLabelText( "Tamaño" ), "medium" )
        await user.type( screen.getByLabelText( "Giro" ), "Manufactura" )
        await user.type( screen.getByLabelText( /Correo de contacto/ ), "vacantes@gruponexo.com" )
        await user.click( screen.getByRole( "button", { name: "Crear cuenta" } ) )

        await screen.findByRole( "heading", { name: "Revisa tu correo" } )
        expect( screen.getByRole( "status" ) ).toHaveTextContent( /un administrador revisará tu empresa/i )
        expect( body ).toEqual( {
            role: "company",
            firstName: "Rosa",
            lastName: "Nexo",
            email: "rh@gruponexo.com",
            password: "Secret123",
            name: "Grupo Nexo",
            size: "medium",
            industry: "Manufactura",
            contact_email: "vacantes@gruponexo.com",
        } )
    } )

    test( "requires a non-blank first and last name", async () => {
        const user = userEvent.setup()
        server.use( http.get( `${ API }/careers`, () => HttpResponse.json( { success: true, data: careerRows } ) ) )
        renderApp( <App />, "/register" )

        await user.type( screen.getByLabelText( "Nombre", { exact: true } ), "   " )
        await user.type( screen.getByLabelText( "Correo electrónico" ), "nueva@correo.com" )
        await user.type( screen.getByLabelText( "Contraseña" ), "Secret123" )
        await user.type( screen.getByLabelText( "Semestre" ), "6" )
        await user.click( screen.getByRole( "button", { name: "Crear cuenta" } ) )

        // No handler for /auth/register: reaching it would fail the test.
        expect( await screen.findByText( "Escribe tu nombre." ) ).toBeInTheDocument()
        expect( screen.getByText( "Escribe tu apellido." ) ).toBeInTheDocument()
    } )

    test( "requires the fields of the role before sending", async () => {
        const user = userEvent.setup()
        server.use( http.get( `${ API }/careers`, () => HttpResponse.json( { success: true, data: careerRows } ) ) )
        renderApp( <App />, "/register" )

        await user.type( screen.getByLabelText( "Correo electrónico" ), "nueva@correo.com" )
        await user.type( screen.getByLabelText( "Contraseña" ), "corta" )
        await user.click( screen.getByRole( "button", { name: "Crear cuenta" } ) )

        expect( await screen.findByText( "La contraseña debe tener al menos 8 caracteres." ) ).toBeInTheDocument()
        expect( screen.getByText( "Indica tu semestre." ) ).toBeInTheDocument()
    } )

    test( "places a 422 error next to its field", async () => {
        const user = userEvent.setup()
        server.use(
            http.get( `${ API }/careers`, () => HttpResponse.json( { success: true, data: careerRows } ) ),
            http.post( `${ API }/auth/register`, () => fail( 422, "Validation failed", {
                errors: [ { type: "field", msg: "Invalid phone number.", path: "phone", location: "body", value: "1234567890" } ],
            } ) )
        )
        renderApp( <App />, "/register" )

        await user.type( screen.getByLabelText( "Nombre", { exact: true } ), "Nueva" )
        await user.type( screen.getByLabelText( "Apellido" ), "Cuenta" )
        await user.type( screen.getByLabelText( "Correo electrónico" ), "nueva@correo.com" )
        await user.type( screen.getByLabelText( "Contraseña" ), "Secret123" )
        await user.type( screen.getByLabelText( /Teléfono/ ), "1234567890" )
        await user.type( screen.getByLabelText( "Semestre" ), "6" )
        await user.click( screen.getByRole( "button", { name: "Crear cuenta" } ) )

        expect( await screen.findByText( "Escribe un teléfono válido." ) ).toBeInTheDocument()
        expect( screen.getByLabelText( /Teléfono/ ) ).toHaveAttribute( "aria-invalid", "true" )
    } )

    test( "marks the email when the account already exists", async () => {
        const user = userEvent.setup()
        server.use(
            http.get( `${ API }/careers`, () => HttpResponse.json( { success: true, data: careerRows } ) ),
            http.post( `${ API }/auth/register`, () => fail( 409, "An account with this email already exists." ) )
        )
        renderApp( <App />, "/register" )

        await user.type( screen.getByLabelText( "Nombre", { exact: true } ), "Laura" )
        await user.type( screen.getByLabelText( "Apellido" ), "Estudiante" )
        await user.type( screen.getByLabelText( "Correo electrónico" ), "estudiante.seed@newman.test" )
        await user.type( screen.getByLabelText( "Contraseña" ), "Secret123" )
        await user.type( screen.getByLabelText( "Semestre" ), "6" )
        await user.click( screen.getByRole( "button", { name: "Crear cuenta" } ) )

        expect( await screen.findByText( "Ya existe una cuenta con este correo." ) ).toBeInTheDocument()
        expect( screen.getByLabelText( "Correo electrónico" ) ).toHaveAttribute( "aria-invalid", "true" )
    } )
} )

describe( "VerifyEmailPage", () => {
    test( "verifies the token of the link", async () => {
        server.use( http.get( `${ API }/auth/verify/good-token`, () => HttpResponse.json( {
            success: true,
            message: "Email verified successfully. You can now log in.",
        } ) ) )

        renderApp( <App />, "/verify/good-token" )

        expect( await screen.findByRole( "heading", { name: "Correo verificado" } ) ).toBeInTheDocument()
        expect( screen.getByRole( "link", { name: "Iniciar sesión" } ) ).toHaveAttribute( "href", "/login" )
    } )

    test( "offers a new link when the token expired", async () => {
        server.use( http.get( `${ API }/auth/verify/old-token`, () => fail(
            410,
            "Verification link has expired. Please register again or request a new link."
        ) ) )

        renderApp( <App />, "/verify/old-token" )

        expect( await screen.findByRole( "alert" ) ).toHaveTextContent( "El enlace de verificación venció. Solicita uno nuevo." )
        expect( screen.getByRole( "link", { name: "Pedir un enlace nuevo" } ) ).toHaveAttribute( "href", "/resend-verification" )
    } )
} )

describe( "ForgotPasswordPage", () => {
    test( "confirms without revealing if the email exists", async () => {
        const user = userEvent.setup()
        let body: unknown = null
        server.use( http.post( `${ API }/auth/forgot-password`, async ( { request } ) => {
            body = await request.json()
            return HttpResponse.json( { success: true, message: "A password reset link has been sent." } )
        } ) )
        renderApp( <App />, "/forgot-password" )

        await user.type( screen.getByLabelText( "Correo electrónico" ), "alguien@correo.com" )
        await user.click( screen.getByRole( "button", { name: "Enviar enlace" } ) )

        expect( await screen.findByRole( "status" ) ).toHaveTextContent( /si tu correo existe/i )
        expect( body ).toEqual( { email: "alguien@correo.com" } )
    } )

    test( "shows the rate limit message", async () => {
        const user = userEvent.setup()
        server.use( http.post( `${ API }/auth/forgot-password`, () => fail(
            429,
            "Too many forgot password attempts from this IP, please try again after an hour"
        ) ) )
        renderApp( <App />, "/forgot-password" )

        await user.type( screen.getByLabelText( "Correo electrónico" ), "alguien@correo.com" )
        await user.click( screen.getByRole( "button", { name: "Enviar enlace" } ) )

        expect( await screen.findByRole( "alert" ) ).toHaveTextContent( "Demasiadas solicitudes de recuperación. Intenta de nuevo en una hora." )
    } )
} )

describe( "ResendVerificationPage", () => {
    test( "sends the email and confirms", async () => {
        const user = userEvent.setup()
        server.use( http.post( `${ API }/auth/resend-verification`, () => HttpResponse.json( {
            success: true,
            message: "A verification email has been sent. Please check your inbox.",
        } ) ) )
        renderApp( <App />, "/resend-verification" )

        await user.type( screen.getByLabelText( "Correo electrónico" ), "alguien@correo.com" )
        await user.click( screen.getByRole( "button", { name: "Reenviar enlace" } ) )

        expect( await screen.findByRole( "status" ) ).toHaveTextContent( /te enviamos un nuevo enlace/i )
    } )
} )

describe( "ResetPasswordPage", () => {
    test( "saves the new password and returns to the login with a notice", async () => {
        const user = userEvent.setup()
        let body: unknown = null
        server.use( http.post( `${ API }/auth/reset-password/reset-token`, async ( { request } ) => {
            body = await request.json()
            return HttpResponse.json( { success: true, message: "Password has been reset succesfully. You can now log in" } )
        } ) )
        renderApp( <App />, "/reset-password/reset-token" )

        await user.type( screen.getByLabelText( "Nueva contraseña" ), "Nueva1234" )
        await user.type( screen.getByLabelText( "Repite la contraseña" ), "Nueva1234" )
        await user.click( screen.getByRole( "button", { name: "Guardar contraseña" } ) )

        expect( await screen.findByRole( "heading", { name: "Inicia sesión" } ) ).toBeInTheDocument()
        expect( screen.getByRole( "status" ) ).toHaveTextContent( "Tu contraseña se actualizó. Ya puedes iniciar sesión." )
        expect( body ).toEqual( { password: "Nueva1234" } )
    } )

    test( "does not send when the two passwords differ", async () => {
        const user = userEvent.setup()
        renderApp( <App />, "/reset-password/reset-token" )

        await user.type( screen.getByLabelText( "Nueva contraseña" ), "Nueva1234" )
        await user.type( screen.getByLabelText( "Repite la contraseña" ), "Otra12345" )
        await user.click( screen.getByRole( "button", { name: "Guardar contraseña" } ) )

        expect( await screen.findByText( "Las contraseñas no coinciden." ) ).toBeInTheDocument()
    } )

    test( "offers a new link when the token expired", async () => {
        const user = userEvent.setup()
        server.use( http.post( `${ API }/auth/reset-password/old-token`, () => fail(
            410,
            "Reset link has expired. Please request a new one."
        ) ) )
        renderApp( <App />, "/reset-password/old-token" )

        await user.type( screen.getByLabelText( "Nueva contraseña" ), "Nueva1234" )
        await user.type( screen.getByLabelText( "Repite la contraseña" ), "Nueva1234" )
        await user.click( screen.getByRole( "button", { name: "Guardar contraseña" } ) )

        await waitFor( () => expect( screen.getByRole( "alert" ) ).toHaveTextContent( /venció/ ) )
        expect( screen.getByRole( "link", { name: "Pedir un enlace nuevo" } ) ).toHaveAttribute( "href", "/forgot-password" )
    } )
} )
