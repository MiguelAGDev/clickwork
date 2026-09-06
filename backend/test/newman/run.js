// Authors:
//      * Miguel Angel Avila Garcia
// Description: Orchestrator for the Newman integration tests. Resets
//              clickwork_test (resource/clean.sql + resource/seed.sql), boots the
//              real app with NODE_ENV=test, runs each *.json collection
//              in this folder in order (auth -> users -> company -> ...),
//              sharing one environment across all of them so a JWT saved
//              by one collection's login step is available to the next.
//              See notclaude/bitacora/2026-09-06-plan-newman-db-pruebas.md.
// Date: September 6th 2026

import { spawn, spawnSync } from 'child_process';
import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import newman from 'newman';

const __dirname    = path.dirname( fileURLToPath( import.meta.url ) );
const BACKEND_DIR  = path.resolve( __dirname, '..', '..' );

dotenv.config( { path: path.join( BACKEND_DIR, '.env' ) } );

const PORT     = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${ PORT }`;

// Collections run in this order -- each may read/overwrite {{token}}
// in the shared environment (see auth.json / company.json).
const COLLECTIONS = [
    'auth.json',
    'users.json',
    'company.json',
    'job-postings.json',
    'applications.json',
    'admin.json',
];


// Runs a .sql file against clickwork_test via the mysql CLI, piping the
// file through stdin. --default-character-set=utf8mb4 is required here --
// without it this client mangles accented characters (confirmed while
// building the seed, see bitácora).
function runSqlFile( fileName ) {

    const filePath = path.join( __dirname, 'resource', fileName );

    const args = [
        '-h', process.env.DB_HOST_TEST || 'localhost',
        '-P', process.env.DB_PORT_TEST || '3306',
        '-u', process.env.DB_USER_TEST || 'root',
        '--default-character-set=utf8mb4',
    ];

    if( process.env.DB_PASSWORD_TEST ){
        args.push( `-p${ process.env.DB_PASSWORD_TEST }` );
    }

    args.push( process.env.DB_NAME_TEST || 'clickwork_test' );

    const result = spawnSync( 'mysql', args, {
        input: fs.readFileSync( filePath ),
    } );

    if( result.status !== 0 ){
        throw new Error( `${ fileName } failed:\n${ result.stderr.toString() }` );
    }

}


// Polls baseUrl until the server answers (or throws after timeoutMs).
async function waitForServer( timeoutMs = 15000 ) {

    const start = Date.now();

    while( Date.now() - start < timeoutMs ){

        try {
            const res = await fetch( `${ BASE_URL }/api/announcements` );
            if( res.status < 500 ) return;
        } catch( _err ){
            // Not up yet -- keep polling.
        }

        await new Promise( r => setTimeout( r, 300 ) );

    }

    throw new Error( 'Server did not become ready in time.' );

}


// Wraps newman.run in a Promise -- collection/environment are plain
// objects (or the previous run's summary.environment, for chaining).
function runCollection( collectionPath, environment ) {

    return new Promise( ( resolve, reject ) => {

        newman.run( {
            collection:  JSON.parse( fs.readFileSync( collectionPath, 'utf8' ) ),
            environment,
            reporters:   'cli',
        }, ( err, summary ) => {

            if( err ) return reject( err );
            resolve( summary );

        } );

    } );

}


async function main() {

    console.log( '--- Resetting clickwork_test ---' );
    runSqlFile( 'clean.sql' );
    runSqlFile( 'seed.sql' );

    console.log( '--- Starting server (NODE_ENV=test) ---' );

    const server = spawn( 'node', [ 'index.js' ], {
        cwd: BACKEND_DIR,
        env: { ...process.env, NODE_ENV: 'test' },
        stdio: [ 'ignore', 'pipe', 'pipe' ],
    } );

    server.stderr.on( 'data', d => process.stderr.write( d ) );

    let environment = JSON.parse(
        fs.readFileSync( path.join( __dirname, 'env.json' ), 'utf8' )
    );

    // Absolute path, injected at runtime (not hardcoded in env.json) so
    // the CV-upload test in users.json works regardless of where this
    // repo is checked out. The actual PDF is gitignored (real personal
    // info) -- see .gitignore, *.pdf.
    environment.values.push( {
        key:     'cvFilePath',
        value:   path.join( __dirname, 'resource', 'Miguel Avila - Resume.pdf' ),
        enabled: true,
    } );

    let totalFailures = 0;

    try {

        await waitForServer();
        console.log( '--- Server ready, running collections ---' );

        for( const fileName of COLLECTIONS ){

            console.log( `\n=== ${ fileName } ===` );

            const summary = await runCollection(
                path.join( __dirname, fileName ),
                environment
            );

            environment = summary.environment;
            totalFailures += summary.run.failures.length;

        }

    } finally {

        server.kill();

    }

    if( totalFailures > 0 ){
        console.error( `\n${ totalFailures } assertion(s) failed.` );
        process.exit( 1 );
    }

    console.log( '\nAll collections passed.' );
    process.exit( 0 );

}

main().catch( err => {
    console.error( err );
    process.exit( 1 );
} );
