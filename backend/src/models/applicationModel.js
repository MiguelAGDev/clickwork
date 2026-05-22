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


// Returns all applicants for a specific posting, joined with user data.
// Used by companyController so companies can see who sent their CV.
async function findApplicationsByJobPosting( jobPostingId ) {

    const sql = `
        SELECT *
        FROM application a
        JOIN app_user au
            ON a.app_id_user = au.ap_usr_id
        WHERE a.app_id_job_posting = ?
    `;

    const [ rows ] = await execute( sql, [ jobPostingId ] );

    return rows;

}


export {
    createApplication,
    findApplicationsByUser,
    findApplicationsByJobPosting,
};