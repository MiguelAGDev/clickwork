// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      End-to-end tests: a real browser against the real backend and the
//      test database (clickwork_test). They start their own backend and
//      their own Vite server on separate ports, so they can run while
//      the normal dev servers (3000 and 5173) are in use.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { defineConfig } from "@playwright/test"

const API_PORT = 3100
const WEB_PORT = 5174
const WEB_URL = `http://localhost:${ WEB_PORT }`

export default defineConfig( {
    testDir: "./e2e",

    // One test at a time, in file order: they share one database, and a
    // later test builds on what an earlier one left (company creates a
    // posting, admin approves it, candidate applies).
    fullyParallel: false,
    workers: 1,

    // Empties clickwork_test and loads the seed before the first test.
    globalSetup: "./e2e/global-setup.ts",

    reporter: [ [ "list" ] ],

    use: {
        baseURL: WEB_URL,
        // Edge is installed with Windows, so there is no browser to download.
        channel: "msedge",
        locale: "es-MX",
        trace: "retain-on-failure",
    },

    webServer: [
        {
            // NODE_ENV=test makes the backend use the test database and
            // skip the rate limits. FRONTEND_URL is the origin CORS allows.
            command: "node index.js",
            cwd: "../backend",
            env: { NODE_ENV: "test", PORT: String( API_PORT ), FRONTEND_URL: WEB_URL },
            url: `http://localhost:${ API_PORT }/api/careers`,
            reuseExistingServer: false,
        },
        {
            command: `npx vite --port ${ WEB_PORT } --strictPort`,
            env: { VITE_API_URL: `http://localhost:${ API_PORT }` },
            url: WEB_URL,
            reuseExistingServer: false,
        },
    ],
} )
