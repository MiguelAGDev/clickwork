// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Runs once before every test file. Adds the DOM matchers
//      (toBeInTheDocument, toHaveValue...) and starts the MSW server
//      that plays the role of the backend, so no test ever hits a real
//      API.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterAll, afterEach, beforeAll } from "vitest"

import { server } from "@/test/server.ts"

// "error" on unhandled requests: a test that calls an endpoint nobody
// mocked fails loudly instead of hanging until the timeout.
beforeAll( () => server.listen( { onUnhandledFrame: "error" } ) )

afterEach( () => {
    cleanup()
    server.resetHandlers()   // Drop per-test overrides so tests stay independent.
    localStorage.clear()     // The session token lives here; never leak it between tests.
} )

afterAll( () => server.close() )
