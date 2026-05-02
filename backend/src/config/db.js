// Authors: 
//      * Azucena Rodriguez Flores  
//      * Miguel Angel Avila Garcia
// Description: Database connection using mysql2 
// Date: May 1st 2026

// Lastest Update:
// Date:
// By: 


const mysql = require('mysql2/promise'); // Import mysql2 with promise support to handle async and await
require('dotenv').config(); // Load environment variables

// Creation a connection 
const pool = mysql.createPool({

    host:                       process.env.DB_HOST,
    port:                       process.env.DB_PORT, 
    user:                       process.env.DB_USER,
    password:                   process.env.DB_PASSWORD,
    database:                   process.env.DB_NAME,
    waitForConnections:         true, // Ensure pool waits until connection is avaible instead of throwing error
    connectionLimit:            10,   // Maximun number of queued connection allowed in pool (0 = unlimited )
    queueLimit:                 0,    // Maximun number of queued connection request (0 = unlimited )
    timezone:                   '-06:00', // Initialize the time zone to use in the db 
    decimalNumbers:             true, // Ensure numeric columns with DECIMAL are returned as js numbers

});

// CONECTION TEST
// Immediately invoked async function to test DB connectivity
(async () => {

    try{

        const connection = await pool.getConnection();
        console.log(`MySQL connected - "${process.env.DB_NAME}"`);
        connection.release();
    }catch(err){

        console.error('MySQL connection error:', err);
        process.exit(1);
    }

})();

module.exports = pool; // Export pool install so other modules can run queries
