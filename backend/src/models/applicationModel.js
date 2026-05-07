// Authors: 
//      * Azucena Rodriguez Flores  
//      * Miguel Angel Avila Garcia
// Description: Application model that manages job applications between users
//              and job postings. Includes creation and retrieval of applications.
// Date: May 5th 2026

// Lastest Update:
// Date:
// By:

const { pool } = require("../config/db.cjs"); // Import database connection

// Create a new application
// Registers a user application for a specific job posting
async function create(userId, job_posting_id) {

    const sql = `
        INSERT INTO application(
            app_date,
            app_status,
            app_id_user,
            app_id_job_posting
        )
        VALUES (
            CURRENT_TIMESTAMP,
            'pending',
            ?,
            ?
        )
    `;

    // Execute insert query
    const [result] = await pool.query(sql, [
        userId,
        job_posting_id
    ]);

    // Return generated application ID
    return result.insertId;
}

// Get all applications by user
// Returns all applications made by a specific user
// Includes related job posting information
async function getByUser(userId) {

    const sql = `
        SELECT * 
        FROM application a
        JOIN job_posting jp
            ON a.app_id_job_posting = jp.jb_pst_id
        WHERE a.app_id_user = ?
    `;

    const [result] = await pool.query(sql, [userId]);

    return result;
}

// Get all applications for a job posting
// Returns all users who applied to a specific job posting
// Includes related user information
async function getByJobPosting(jobPostingId) {

    const sql = `
        SELECT * 
        FROM application a
        JOIN app_user au
            ON a.app_id_user = au.ap_usr_id
        WHERE a.app_id_job_posting = ?
    `;

    const [result] = await pool.query(sql, [jobPostingId]);

    return result;
}
//Export all model methods
module.exports = {
    create,
    getByJobPosting,
    getByUser
};