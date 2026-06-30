// Authors: 
//      * Azucena Rodriguez Flores  
//      * Miguel Angel Avila Garcia
// Description: User model — queries for the app_user table
// Date: May 5nd 2026
 
// Latest Update: Add admin functions getAllUsers and toggleActiveUser 
// Date: June 28th 2026 
// By: Miguel Angel Avila Garcia
 

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
            au.ap_usr_cv_url            AS cv_url,
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
// email_verified defaults to 0, active is explicitly set based on role (1 for most, 0 for company pending approval).
// Returns the new user's insertId so authService can create the role row next.
async function create( { email, phone = null, password, careerId = null, active } ) {

    const sql = `
        INSERT INTO app_user
            (ap_usr_email, ap_usr_phone, ap_usr_password, ap_usr_id_career, ap_usr_active)
        VALUES (?, ?, ?, ?, ?)
    `;

    const [ result ] = await execute( sql, [ email, phone, password, careerId, active ] );

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
            au.ap_usr_email_verified    AS email_verified,
            au.ap_usr_token             AS token,
            au.ap_usr_token_expiration  AS tokenExpiration
        FROM app_user au
        WHERE au.ap_usr_token = ?
    `;
 
    const [ rows ] = await execute( sql, [ token ] );
    return rows[0] ?? null;
 
}


// ──────────────────────────
//      ADMIN FUNCTIONS
// ──────────────────────────
 
// Returns all users with role-specific info joined from student, intern, graduate, company tables.
// Used by adminController to display all registered users with comprehensive data.
// Includes role-specific fields for each user type.
async function getAllUsers () {

    const sql = `
    
        SELECT
            au.ap_usr_id                AS id,
            au.ap_usr_email             AS email,
            au.ap_usr_phone             AS phone,
            au.ap_usr_active            AS active,
            au.ap_usr_email_verified    AS email_verified,
            au.ap_usr_role              AS role,
            au.ap_usr_cv_url            AS cv_url,
            c.car_id                    AS career_id,
            c.car_name                  AS career_name,
 
            -- Student-specific fields
            s.std_semester              AS student_semester,
            s.std_id                    AS student_id,
 
            -- Intern-specific fields
            i.itn_host_company          AS intern_host_company,
            i.itn_project               AS intern_project,
            i.itn_start_date            AS intern_start_date,
            i.itn_end_date              AS intern_end_date,
 
            -- Graduate-specific fields
            g.grd_graduation_year       AS graduate_graduation_year,
            g.grd_current_job           AS graduate_current_job,
 
            -- Company-specific fields
            cmp.cmp_name                AS company_name,
            cmp.cmp_size                AS company_size,
            cmp.cmp_industry            AS company_industry,
            cmp.cmp_approval_status     AS company_approval_status,
            cmp.cmp_rejection_reason    AS company_rejection_reason
        FROM app_user au
        LEFT JOIN careers c ON c.car_id = au.ap_usr_id_career
        LEFT JOIN student s ON s.std_id_user = au.ap_usr_id
        LEFT JOIN intern i ON i.itn_id_user = au.ap_usr_id
        LEFT JOIN graduate g ON g.grd_id_user = au.ap_usr_id
        LEFT JOIN company cmp ON cmp.cmp_id_user = au.ap_usr_id
        ORDER BY au.ap_usr_id DESC 

    `;

    const [ rows ] = await execute( sql );
    return rows;

};


// Toggles a user's active status (1 ↔ 0).
// Active = 1: user can access the platform.
// Active = 0: user is deactivated and cannot log in.
// Used by admin to activate/deactivate user accounts.
// Returns the number of affected rows (0 if user not found, 1 if toggled).
async function toggleUserActive( id ) {

    const sql = `
        UPDATE app_user
            SET ap_usr_active = IF( ap_usr_active = 1, 0, 1 )
            WHERE ap_usr_id = ?
    `;

    const [ result ] = await execute( sql, [ id ] );
    return result.affectedRows;
    
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
