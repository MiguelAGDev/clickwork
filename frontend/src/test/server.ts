// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      MSW server shared by all tests. It starts with no handlers on
//      purpose: each test declares only the endpoints it needs with
//      server.use( ... ), which keeps the mocked contract next to the
//      assertion that depends on it.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { setupServer } from "msw/node"

const server = setupServer()

// Same origin the HTTP client uses in tests (see test.env in vite.config.ts).
const API = "http://localhost:3000/api"

export { server, API }
