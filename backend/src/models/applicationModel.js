// Authors: 
//      * Azucena Rodriguez Flores  
//      * Miguel Angel Avila Garcia
// Description: Application model — queries for the application table.
//              Logs every CV send (Roll Me action) and supports retrieval
//              by user and by job posting.
// Date: May 5th 2026

// Latest Update:
// Date:
// By:

import { execute } from '../config/db.js';


// Logs a CV send. Called immediately after emailService sends the CV.
// Status defaults to 'pending'. Returns the new application ID.
// Called by postulacionController (Roll Me button).
async function createApplication( userId, jobPostingId ) {

    const sql = `
        INSERT INTO application (
            app_date,
            app_status,
            app_id_user,
            app_id_job_posting
        )
        VALUES (CURRENT_TIMESTAMP, 'pending', ?, ?)
    `;

    const [ result ] = await execute( sql, [ userId, jobPostingId ] );

    return result.insertId;

}


// Returns all applications made by a specific user, joined with job posting data.
// Used by postulacionController for the "my Roll Me history" page.
async function findApplicationsByUser( userId ) {

    const sql = `
        SELECT *
        FROM application a
        JOIN job_posting jp
            ON a.app_id_job_posting = jp.jb_pst_id
        WHERE a.app_id_user = ?
    `;

    const [ rows ] = await execute( sql, [ userId ] );

    return rows;

}


// Returns all applicants for a specific posting, joined with safe user data only.
// Used by applicationsController so a company can see who sent their CV.
// IMPORTANT: this must never SELECT * against app_user — that table holds
// ap_usr_password (bcrypt hash) and ap_usr_token / ap_usr_token_expiration
// (live verification/reset tokens). See backend audit C3.
async function findApplicationsByJobPosting( jobPostingId ) {

    const sql = `
        SELECT
            a.app_id                AS id,
            a.app_date               AS date,
            a.app_status             AS status,
            a.app_id_user            AS applicant_id,
            a.app_id_job_posting     AS job_posting_id,
            au.ap_usr_email          AS applicant_email,
            au.ap_usr_phone          AS applicant_phone,
            au.ap_usr_cv_url         AS applicant_cv_url
        FROM application a
        JOIN app_user au
            ON a.app_id_user = au.ap_usr_id
        WHERE a.app_id_job_posting = ?
    `;

    const [ rows ] = await execute( sql, [ jobPostingId ] );

    return rows;

}

// Returns a single application for a specific user and job posting.
// Used by userController ( Roll Me ) to prevent duplicate applications. Returns null if no application exists.
async function findApplicationByUserAndJobPosting( userId, jobPostingId ){

    const sql = `
        SELECT *
        FROM application a
        WHERE app_id_user           = ? 
            AND app_id_job_posting  = ?
        LIMIT 1
    `;

    const [ rows ] = await execute( sql, [ userId, jobPostingId ] );

    return rows[ 0 ] ?? null;
}

export {
    createApplication,
    findApplicationsByUser,
    findApplicationsByJobPosting,
    findApplicationByUserAndJobPosting,
};