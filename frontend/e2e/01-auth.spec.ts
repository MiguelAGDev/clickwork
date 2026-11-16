// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      End-to-end: the session against the real backend. Login, wrong
//      password, protection of private pages and logout.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { expect, test } from "@playwright/test"

import { loginAs, logout, SEED_USERS } from "./helpers.ts"

test( "a visitor without session is sent to the login", async ( { page } ) => {
    await page.goto( "/applications" )

    await expect( page ).toHaveURL( /\/login$/ )
    await expect( page.getByRole( "heading", { name: "Inicia sesión" } ) ).toBeVisible()
} )

test( "a wrong password shows the reason and keeps the visitor out", async ( { page } ) => {
    await page.goto( "/login" )
    await page.getByLabel( "Correo electrónico" ).fill( SEED_USERS.student )
    await page.getByLabel( "Contraseña" ).fill( "NoEsLaContrasena1" )
    await page.getByRole( "button", { name: "Iniciar sesión" } ).click()

    await expect( page.getByRole( "alert" ) ).toHaveText( "Correo o contraseña incorrectos." )
    await expect( page ).toHaveURL( /\/login$/ )
} )

test( "login returns to the page the visitor was trying to open", async ( { page } ) => {
    await page.goto( "/applications" )
    await page.getByLabel( "Correo electrónico" ).fill( SEED_USERS.student )
    await page.getByLabel( "Contraseña" ).fill( "Newman123" )
    await page.getByRole( "button", { name: "Iniciar sesión" } ).click()

    await expect( page ).toHaveURL( /\/applications$/ )
    await expect( page.getByRole( "heading", { name: "Mis aplicaciones" } ) ).toBeVisible()
} )

test( "the session survives a reload and ends on logout", async ( { page } ) => {
    await loginAs( page, "student" )

    await page.reload()
    await expect( page.getByRole( "heading", { level: 1, name: /^Hola, / } ) ).toBeVisible()

    await logout( page )

    // The token is gone: a private page sends back to the login.
    await page.goto( "/dashboard" )
    await expect( page ).toHaveURL( /\/login$/ )
} )

test( "a section of another role is not available", async ( { page } ) => {
    await loginAs( page, "student" )

    await page.goto( "/admin/users" )

    await expect( page.getByRole( "heading", { name: /no está disponible para tu cuenta/ } ) ).toBeVisible()
} )

test( "the email verification link reports an invalid token", async ( { page } ) => {
    await page.goto( "/verify/this-token-does-not-exist" )

    await expect( page.getByRole( "alert" ) ).toHaveText( "El enlace de verificación no es válido." )
} )
