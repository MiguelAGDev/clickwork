// Authors: 
//      * Azucena Rodriguez Flores  
//      * Miguel Angel Avila Garcia
// Description: User model — queries for the app_user table
// Date: May 5nd 2026
 
// Latest Update:
// Date:
// By:
 

import { execute } from '../config/db.js'; 



// Called on every authenticated request by authMiddleware to load the session user.
async function findById( id ) {

    const sql = `
        SELECT
            au.ap_usr_id                AS id,
            au.ap_usr_email             AS email,
            au.ap_usr_phone             AS phone,
            au.ap_usr_active            AS active,
            au.ap_usr_email_verified    AS email_verified,
            au.ap_usr_cv_url            AS resume_url,
            au.ap_usr_id_career         AS career_id,
            c.car_name                  AS career_name
        FROM app_user au
        LEFT JOIN careers c ON c.car_id = au.ap_usr_id_career
        WHERE au.ap_usr_id = ?
    `;
    
    const [ rows ] = await execute( sql, [ id ] );
    return rows[0] ?? null;

};

// Used during login to retrieve the hashed password for comparison.
// Returns password hash too — only use internally in authService, never expose to client.
async function findByEmail( email ){

    const sql = `
        SELECT
            au.ap_usr_id                AS id,
            au.ap_usr_email             AS email,
            au.ap_usr_password          AS password,
            au.ap_usr_active            AS active,
            au.ap_usr_email_verified    AS email_verified,
            au.ap_usr_id_career         AS career_id
        FROM app_user au
        WHERE au.ap_usr_email = ?
    `;

    const [ rows ] = await execute( sql, [ email ] );
    return rows[0] ?? null;
    
};

// Inserts a new app_user row.
// email_verified defaults to 0, active defaults to 1 (handled by DB).
// Returns the new user's insertId so authService can create the role row next.
async function create( { email, phone = null, password, careerId = null } ) {

    const sql = `
        INSERT INTO app_user
            (ap_usr_email, ap_usr_phone, ap_usr_password, ap_usr_id_career)
        VALUES (?, ?, ?, ?)
    `;

    const [ result ] = await execute( sql, [ email, phone, password, careerId ] );

    return result.insertId;
};

// Updates editable profile fields: phone and careerId.
// Password, token, and email are intentionally excluded — they have dedicated functions.
async function update( id, { phone = null, careerId } ) {

    const sql = `
        UPDATE app_user
        SET
            ap_usr_phone       = ?,
            ap_usr_id_career   = ?
        WHERE ap_usr_id = ?
    `;

    const [ result ] = await execute( sql, [ phone, careerId, id ] );
    return result.affectedRows;
};

// Saves the file path of the uploaded CV PDF into ap_usr_cv_url.
// Called by userController after Multer processes the file upload.
async function updateCvUrl ( id, url ) { 

    const sql = `
        UPDATE app_user
        SET ap_usr_cv_url = ?
        WHERE ap_usr_id = ?
    `;

    const [ result ] = await execute( sql, [ url, id ] );
    return result.affectedRows;

};  

// Writes the verification or password-reset token and its expiration to the user row.
// Called by authService when sending a verification or reset email.
async function updateToken ( id, token, expiration ) {

    const sql = `
        UPDATE app_user
        SET
            ap_usr_token            = ?,
            ap_usr_token_expiration = ?
        WHERE ap_usr_id = ?
    `;

    const [ result ] = await execute( sql, [ token, expiration, id ] );
    return result.affectedRows;
};

// Sets ap_usr_email_verified = 1 and clears the token and expiration fields.
// Called by authService after the user clicks the verification link.
async function verifyEmail( id ) {
    
    const sql = `
        UPDATE app_user
        SET
            ap_usr_email_verified   = 1,
            ap_usr_token            = NULL,
            ap_usr_token_expiration = NULL
        WHERE ap_usr_id = ?
    `;

    const [ result ] = await execute( sql, [ id ] );
    return result.affectedRows;

};

// Finds a user by their verification or reset token.
// Used to validate the link the user clicked in their email.
// Always check token expiration in authService after calling this.
async function findByToken( token ) {
 
    const sql = `
        SELECT
            au.ap_usr_id                AS id,
            au.ap_usr_email             AS email,
            au.ap_usr_active            AS active,
            au.ap_usr_email_verified    AS emailVerified,
            au.ap_usr_token             AS token,
            au.ap_usr_token_expiration  AS tokenExpiration
        FROM app_user au
        WHERE au.ap_usr_token = ?
    `;
 
    const [ rows ] = await execute( sql, [ token ] );
    return rows[0] ?? null;
 
}
 

export {
    findById,
    findByEmail,
    create,
    update,
    updateCvUrl,
    updateToken,
    verifyEmail,
    findByToken,
};
