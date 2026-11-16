// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Runs once before the end-to-end tests: leaves the test database
//      in a known state by running the same two SQL files the backend
//      Newman suite uses (clean.sql, then seed.sql). It only ever
//      touches the database named in DB_NAME_TEST.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { spawnSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"

const BACKEND_DIR = path.resolve( import.meta.dirname, "..", "..", "backend" )
const SQL_DIR = path.join( BACKEND_DIR, "test", "newman", "resource" )

// Reads KEY=VALUE lines from backend/.env. The database credentials live
// only there; this avoids copying them into the frontend.
function readBackendEnv(): Record<string, string> {
    const env: Record<string, string> = {}

    for( const line of fs.readFileSync( path.join( BACKEND_DIR, ".env" ), "utf8" ).split( /\r?\n/ ) ) {
        const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec( line )
        if( match ) env[ match[ 1 ] ] = match[ 2 ].replace( /^(['"])(.*)\1$/, "$2" )
    }

    return env
}

function runSqlFile( env: Record<string, string>, fileName: string ): void {
    if( !env.DB_NAME_TEST ) {
        throw new Error( "DB_NAME_TEST is not set in backend/.env: refusing to run without a test database." )
    }

    const args = [
        "-h", env.DB_HOST_TEST || "localhost",
        "-P", env.DB_PORT_TEST || "3306",
        "-u", env.DB_USER_TEST || "root",
        "--default-character-set=utf8mb4",
    ]
    if( env.DB_PASSWORD_TEST ) args.push( `-p${ env.DB_PASSWORD_TEST }` )
    args.push( env.DB_NAME_TEST )

    // The mysql client must be in the PATH (same requirement as the
    // backend "npm run test:newman").
    const result = spawnSync( "mysql", args, { input: fs.readFileSync( path.join( SQL_DIR, fileName ) ) } )

    if( result.error ) throw new Error( `Could not run the mysql client: ${ result.error.message }` )
    if( result.status !== 0 ) throw new Error( `${ fileName } failed:\n${ result.stderr.toString() }` )
}

export default function globalSetup(): void {
    const env = readBackendEnv()

    runSqlFile( env, "clean.sql" )
    runSqlFile( env, "seed.sql" )
}
