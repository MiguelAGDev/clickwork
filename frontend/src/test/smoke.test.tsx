// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Smallest possible test: proves the toolchain (Vitest + jsdom +
//      Testing Library + the @/ alias) works end to end.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { expect, test } from "vitest"

import { App } from "@/App.tsx"

test( "renders the route that matches the URL", () => {
    render(
        <MemoryRouter initialEntries={ [ "/login" ] }>
            <App />
        </MemoryRouter>
    )

    expect( screen.getByRole( "heading", { name: /login/i } ) ).toBeInTheDocument()
} )
