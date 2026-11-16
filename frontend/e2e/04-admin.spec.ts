// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      End-to-end: the admin against the real backend, and the full
//      circle between the three roles. The posting the company created
//      in the previous file is approved here and then shows up for a
//      candidate.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { expect, test } from "@playwright/test"

import { loginAs, logout, SEED_USERS } from "./helpers.ts"

const NEW_JOB = "Analista de Calidad E2E"

test( "an admin approves a posting and a candidate then sees it", async ( { page } ) => {
    await loginAs( page, "admin" )
    await expect( page.getByRole( "link", { name: /Vacantes por revisar/ } ) ).toContainText( "1" )

    await page.getByRole( "navigation", { name: "Principal" } ).getByRole( "link", { name: "Vacantes" } ).click()
    await expect( page.getByRole( "heading", { name: NEW_JOB } ) ).toBeVisible()
    // The company name is resolved from the admin companies list.
    await expect( page.getByText( /^Manufactura Digital de la Laguna · / ) ).toBeVisible()

    await page.getByRole( "button", { name: `Aprobar ${ NEW_JOB }` } ).click()
    await expect( page.getByText( "No hay vacantes por revisar" ) ).toBeVisible()

    await logout( page )

    // The other side: the posting is now public.
    await loginAs( page, "graduate" )
    await page.getByRole( "navigation", { name: "Principal" } ).getByRole( "link", { name: "Vacantes" } ).click()
    await expect( page.getByRole( "link", { name: NEW_JOB } ) ).toBeVisible()
} )

test( "an admin rejects a company with a reason and approves it again", async ( { page } ) => {
    await loginAs( page, "admin" )
    await page.goto( "/admin/companies?view=all" )

    const row = page.locator( "div.rounded-xl" ).filter( { has: page.getByRole( "heading", { name: "Manufactura Digital de la Laguna" } ) } )
    await row.getByRole( "button", { name: /^Rechazar / } ).click()

    const dialog = page.getByRole( "alertdialog" )
    await dialog.getByLabel( "Motivo del rechazo" ).fill( "Prueba E2E: datos por confirmar" )
    await dialog.getByRole( "button", { name: "Rechazar" } ).click()

    await expect( row.getByText( "Rechazada" ) ).toBeVisible()
    await expect( row.getByText( "Motivo del rechazo: Prueba E2E: datos por confirmar" ) ).toBeVisible()

    // Leave the seed company approved for whatever runs next.
    await row.getByRole( "button", { name: /^Aprobar / } ).click()
    await expect( row.getByText( "Aprobada" ) ).toBeVisible()
} )

test( "an admin deactivates an account, which can no longer log in, and reactivates it", async ( { page } ) => {
    await loginAs( page, "admin" )
    await page.getByRole( "navigation", { name: "Principal" } ).getByRole( "link", { name: "Usuarios" } ).click()

    await page.getByRole( "button", { name: "Desactivar Pablo Residente" } ).click()
    await page.getByRole( "alertdialog" ).getByRole( "button", { name: "Desactivar" } ).click()
    await expect( page.getByRole( "button", { name: "Reactivar Pablo Residente" } ) ).toBeVisible()

    await logout( page )

    await page.getByLabel( "Correo electrónico" ).fill( SEED_USERS.intern )
    await page.getByLabel( "Contraseña" ).fill( "Newman123" )
    await page.getByRole( "button", { name: "Iniciar sesión" } ).click()
    await expect( page.getByRole( "alert" ) ).toHaveText( "Tu cuenta está desactivada. Contacta a soporte." )

    // Put it back.
    await loginAs( page, "admin" )
    await page.goto( "/admin/users" )
    await page.getByRole( "button", { name: "Reactivar Pablo Residente" } ).click()
    await page.getByRole( "alertdialog" ).getByRole( "button", { name: "Reactivar" } ).click()
    await expect( page.getByRole( "button", { name: "Desactivar Pablo Residente" } ) ).toBeVisible()
} )
