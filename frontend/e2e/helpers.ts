// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Shared pieces of the end-to-end tests: the users the seed creates
//      and how to log in as one of them.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { expect } from "@playwright/test"
import type { Page } from "@playwright/test"

// Users of backend/test/newman/resource/seed.sql. They all share one password.
const SEED_PASSWORD = "Newman123"

const SEED_USERS = {
    admin: "admin.seed@newman.test",
    student: "estudiante.seed@newman.test",
    intern: "intern.seed@newman.test",
    graduate: "graduado.seed@newman.test",
    company: "empresa.seed@newman.test",
} as const

type SeedUser = keyof typeof SEED_USERS

// Logs in through the real form and waits for the home to be on screen.
async function loginAs( page: Page, who: SeedUser ): Promise<void> {
    await page.goto( "/login" )
    await page.getByLabel( "Correo electrónico" ).fill( SEED_USERS[ who ] )
    await page.getByLabel( "Contraseña" ).fill( SEED_PASSWORD )
    await page.getByRole( "button", { name: "Iniciar sesión" } ).click()

    await expect( page ).toHaveURL( /\/dashboard$/ )
    await expect( page.getByRole( "heading", { level: 1, name: /^Hola, / } ) ).toBeVisible()
}

async function logout( page: Page ): Promise<void> {
    await page.getByRole( "button", { name: "Menú de usuario" } ).click()
    await page.getByRole( "menuitem", { name: "Cerrar sesión" } ).click()

    await expect( page.getByRole( "heading", { name: "Inicia sesión" } ) ).toBeVisible()
}

export { SEED_USERS, SEED_PASSWORD, loginAs, logout }
export type { SeedUser }
