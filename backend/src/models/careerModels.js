// Authors: 
//      * Azucena Rodriguez Flores  
//      * Miguel Angel Avila Garcia
// Description: Career model — queries for the careers table
// Date: May 6th 2026

// Latest Update:
// Date:
// By:

const pool = require('../config/db');


// Returns all careers ordered alphabetically.
// Used to populate dropdowns in the register and profile forms.
async function getAll() {

    const sql = `
        SELECT
            c.car_id    AS id,
            c.car_name  AS name
        FROM careers c
        ORDER BY c.car_name ASC
    `;

    const [ rows ] = await pool.execute( sql );
    return rows;

}


// Returns a single career by its primary key.
// Used to validate that a careerId actually exists before assigning it to a user.
async function getById( id ) {

    const sql = `
        SELECT
            c.car_id    AS id,
            c.car_name  AS name
        FROM careers c
        WHERE c.car_id = ?
    `;

    const [ rows ] = await pool.execute( sql, [ id ] );
    return rows[0] ?? null;

}

module.exports = {
    getAll,
    getById,
};