// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      End-to-end: the main path of a candidate against the real
//      backend. Find a job posting, apply, see the application, and
//      edit the profile.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { expect, test } from "@playwright/test"

import { loginAs } from "./helpers.ts"

test( "a student finds a job, applies and sees the application", async ( { page } ) => {
    await loginAs( page, "student" )

    // Home: the seed has two approved postings and no applications yet.
    await expect( page.getByRole( "link", { name: /Aplicaciones activas/ } ) ).toContainText( "0" )

    await page.getByRole( "navigation", { name: "Principal" } ).getByRole( "link", { name: "Vacantes" } ).click()
    await expect( page.getByText( "2 vacantes" ) ).toBeVisible()

    // The search is answered by the backend (LIKE on title and requirements).
    await page.getByRole( "searchbox", { name: "Buscar vacantes" } ).fill( "Software" )
    await page.getByRole( "button", { name: "Buscar" } ).click()
    await expect( page.getByText( "1 vacante", { exact: true } ) ).toBeVisible()

    await page.getByRole( "link", { name: "Desarrollador de Software Jr." } ).click()
    await expect( page.getByRole( "heading", { level: 1, name: "Desarrollador de Software Jr." } ) ).toBeVisible()
    await expect( page.getByText( "Lunes a viernes, 9am-6pm" ) ).toBeVisible()

    // The seeded student has no CV, so it applies without sending one.
    await page.getByRole( "button", { name: "Postularme sin enviar CV" } ).click()
    await expect( page.getByText( "Ya te postulaste a esta vacante" ) ).toBeVisible()

    await page.getByRole( "navigation", { name: "Principal" } ).getByRole( "link", { name: "Aplicaciones" } ).click()
    await expect( page.getByRole( "link", { name: "Desarrollador de Software Jr." } ) ).toBeVisible()
    await expect( page.getByText( "Enviada" ) ).toBeVisible()

    // Back home the number moved, and the posting is no longer recommended.
    await page.getByRole( "navigation", { name: "Principal" } ).getByRole( "link", { name: "Inicio" } ).click()
    await expect( page.getByRole( "link", { name: /Aplicaciones activas/ } ) ).toContainText( "1" )
    await expect( page.getByRole( "region", { name: "Vacantes recomendadas" } ).getByRole( "link", { name: "Desarrollador de Software Jr." } ) ).toHaveCount( 0 )
} )

test( "a student edits its profile and the change is still there after a reload", async ( { page } ) => {
    await loginAs( page, "student" )
    await page.getByRole( "navigation", { name: "Principal" } ).getByRole( "link", { name: "Perfil" } ).click()

    await page.getByLabel( "Teléfono" ).fill( "8710001122" )
    await page.getByLabel( "Semestre" ).fill( "8" )
    await page.getByRole( "button", { name: "Guardar cambios" } ).click()
    await expect( page.getByText( "Guardamos tus cambios." ) ).toBeVisible()

    await page.reload()

    await expect( page.getByLabel( "Teléfono" ) ).toHaveValue( "8710001122" )
    await expect( page.getByLabel( "Semestre" ) ).toHaveValue( "8" )
    // The career saved in the seed is selected once the catalog loads.
    await expect( page.getByLabel( "Carrera" ) ).toHaveValue( "1" )
} )

test( "a graduate reads the fields of its own role", async ( { page } ) => {
    await loginAs( page, "graduate" )
    await page.getByRole( "navigation", { name: "Principal" } ).getByRole( "link", { name: "Perfil" } ).click()

    // The backend sends this as graduate_year; the UI shows it all the same.
    await expect( page.getByLabel( "Año de egreso" ) ).toHaveValue( "2024" )
    await expect( page.getByLabel( "Puesto actual" ) ).toHaveValue( "Ingeniero de Procesos" )
} )
