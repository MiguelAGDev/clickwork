// Authors: 
//      * Azucena Rodriguez Flores  
//      * Miguel Angel Avila Garcia
// Description: Database connection using mysql2 
// Date: May 1st 2026

// Latest Update: Add NODE_ENV=test switch to DB_*_TEST vars
// Date: September 6th 2026
// By: Miguel Angel Avila Garcia

import { createPool } from 'mysql2/promise'; // Import mysql2 with promise support to handle async and await
import dotenv from 'dotenv';                 // Load environment variables
dotenv.config();

// When NODE_ENV=test (only set by the Newman test runner), talk to the
// disposable clickwork_test database instead of the real one — never the
// other way around, since DB_*_TEST only ever exists in a local .env.
const isTest = process.env.NODE_ENV === 'test';

if( isTest && !process.env.DB_NAME_TEST ){
    throw new Error( 'NODE_ENV=test pero DB_NAME_TEST no está definida en .env' );
}

const DB_HOST     = process.env[ isTest ? 'DB_HOST_TEST'     : 'DB_HOST' ];
const DB_PORT     = process.env[ isTest ? 'DB_PORT_TEST'     : 'DB_PORT' ];
const DB_USER     = process.env[ isTest ? 'DB_USER_TEST'     : 'DB_USER' ];
const DB_PASSWORD = process.env[ isTest ? 'DB_PASSWORD_TEST' : 'DB_PASSWORD' ];
const DB_NAME     = process.env[ isTest ? 'DB_NAME_TEST'     : 'DB_NAME' ];

// Creation a connection
const pool = createPool({

    host:               DB_HOST,
    port:               DB_PORT,
    user:               DB_USER,
    password:           DB_PASSWORD,
    database:           DB_NAME,
    waitForConnections: true,          // Ensure pool waits until connection is available instead of throwing error
    connectionLimit:    10,            // Maximum number of queued connection allowed in pool (0 = unlimited)
    queueLimit:         0,             // Maximum number of queued connection request (0 = unlimited)
    timezone:           '-06:00',      // Initialize the time zone to use in the db
    decimalNumbers:     true,          // Ensure numeric columns with DECIMAL are returned as js numbers

});

// CONNECTION TEST
// Immediately invoked async function to test DB connectivity
(async () => {

    try {

        const connection = await pool.getConnection();
        console.log(`MySQL connected - "${DB_NAME}"`);
        connection.release();

    } catch(err) {
        console.error('MySQL connection error:', err);
        process.exit(1);
    }

})();

// Thin wrapper so models can call execute(sql, params) directly
const execute = (sql, params) => pool.execute(sql, params);

// Exposed so authService can set @current_user_id for audit-log triggers
const getConnection = () => pool.getConnection();

export { execute, getConnection }; // Export execute and getConnection so other modules can run queries