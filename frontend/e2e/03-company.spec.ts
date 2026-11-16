// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      End-to-end: the main path of a company against the real backend.
//      See who applied, move an application to another status, publish
//      a posting and edit the company profile. Runs after the candidate
//      tests, which leave one application on posting 1.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { expect, test } from "@playwright/test"

import { loginAs, SEED_USERS } from "./helpers.ts"

test( "a company reviews an applicant and changes the status", async ( { page } ) => {
    await loginAs( page, "company" )

    // The home greets with the company name, read from GET /company/me.
    await expect( page.getByRole( "heading", { level: 1 } ) ).toHaveText( "Hola, Manufactura Digital de la Laguna" )
    await expect( page.getByRole( "link", { name: /Vacantes publicadas/ } ) ).toContainText( "2" )

    await page.getByRole( "navigation", { name: "Principal" } ).getByRole( "link", { name: "Mis vacantes" } ).click()
    const row = page.locator( "div.rounded-xl" ).filter( { has: page.getByRole( "heading", { name: "Desarrollador de Software Jr." } ) } )
    await row.getByRole( "link", { name: "Aplicantes" } ).click()

    // The student applied in the candidate tests.
    await expect( page.getByRole( "heading", { name: "Laura Estudiante" } ) ).toBeVisible()
    await expect( page.getByRole( "link", { name: SEED_USERS.student } ) ).toBeVisible()
    const status = page.getByLabel( "Estado de la postulación de Laura Estudiante" )
    await expect( status ).toHaveValue( "pending" )

    await status.selectOption( "interview" )
    await expect( page.locator( "span" ).filter( { hasText: /^Entrevista$/ } ) ).toBeVisible()

    // Reload: the status really was saved in the database.
    await page.reload()
    await expect( page.getByLabel( "Estado de la postulación de Laura Estudiante" ) ).toHaveValue( "interview" )
} )

test( "a company publishes a posting, which waits for review", async ( { page } ) => {
    await loginAs( page, "company" )
    await page.getByRole( "link", { name: "Nueva vacante" } ).click()

    await page.getByLabel( "Título de la vacante" ).fill( "Analista de Calidad E2E" )
    await page.getByLabel( "Requisitos" ).fill( "Ingeniería Industrial.\nInglés intermedio." )
    await page.getByLabel( "Modalidad" ).selectOption( "on-site" )
    await page.getByLabel( "Tipo de contrato" ).selectOption( "full-time" )
    await page.getByLabel( "Nivel de experiencia" ).selectOption( "junior" )
    await page.getByLabel( "Horario" ).fill( "Lunes a viernes, 8 a 5" )
    await page.getByLabel( /Sueldo mensual/ ).fill( "14000" )
    await page.getByLabel( "Fecha de cierre" ).fill( "2099-01-31" )
    await page.getByRole( "checkbox", { name: "Ingeniería Industrial" } ).check()
    await page.getByRole( "button", { name: "Crear vacante" } ).click()

    await expect( page ).toHaveURL( /\/company\/jobs$/ )
    await expect( page.getByText( /Vacante creada/ ) ).toBeVisible()

    const row = page.locator( "div.rounded-xl" ).filter( { has: page.getByRole( "heading", { name: "Analista de Calidad E2E" } ) } )
    await expect( row.getByText( "En revisión" ) ).toBeVisible()
    await expect( row.getByText( /Cierra el 31 ene 2099/ ) ).toBeVisible()
} )

test( "a company edits its profile", async ( { page } ) => {
    await loginAs( page, "company" )
    await page.getByRole( "navigation", { name: "Principal" } ).getByRole( "link", { name: "Perfil" } ).click()

    await expect( page.getByLabel( "Nombre de la empresa" ) ).toHaveValue( "Manufactura Digital de la Laguna" )
    await page.getByLabel( "Ciudad" ).fill( "Gómez Palacio" )
    await page.getByLabel( "Estado", { exact: true } ).fill( "Durango" )
    await page.getByRole( "button", { name: "Guardar cambios" } ).click()
    await expect( page.getByText( "Guardamos los datos de tu empresa." ) ).toBeVisible()

    await page.reload()
    await expect( page.getByLabel( "Ciudad" ) ).toHaveValue( "Gómez Palacio" )
    await expect( page.getByLabel( "Estado", { exact: true } ) ).toHaveValue( "Durango" )
} )
