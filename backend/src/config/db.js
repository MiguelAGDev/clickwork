// Authors: 
//      * Azucena Rodriguez Flores  
//      * Miguel Angel Avila Garcia
// Description: Database connection using mysql2 
// Date: May 1st 2026

// Latest Update: Change Common JS to ES Module
// Date: May 6th 2026
// By: Miguel Angel Avila Garcia

import { createPool } from 'mysql2/promise'; // Import mysql2 with promise support to handle async and await
import dotenv from 'dotenv';                 // Load environment variables
dotenv.config();

// Creation a connection 
const pool = createPool({

    host:               process.env.DB_HOST,
    port:               process.env.DB_PORT, 
    user:               process.env.DB_USER,
    password:           process.env.DB_PASSWORD,
    database:           process.env.DB_NAME,
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
        console.log(`MySQL connected - "${process.env.DB_NAME}"`);
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