// Authors: 
//      * Azucena Rodriguez Flores  
//      * Miguel Angel Avila Garcia
// Description: Job Posting model — queries for the job_posting and job_posting_career tables.
//              Handles creation, retrieval, filtering, career associations,
//              content updates, and the admin approval workflow.
// Date: May 5th 2026

// Latest Update:
// Date:
// By:

import { execute } from '../config/db.js';


// Inserts a new job posting linked to a company.
// Approval status defaults to 'pending'. Returns the new posting ID.
// Called by companyController right before attachJobPostingCareers().
async function createJobPosting( companyId, {
    job_title,
    requirements    = null,
    benefits        = null,
    modality,
    schedule        = null,
    contract_type,
    experience_level,
    publication_date,
    expiration_date = null,
    salary          = null,
    image_url       = null,
} ) {

    const sql = `
        INSERT INTO job_posting (
            jb_pst_job_title,
            jb_pst_requirements,
            jb_pst_benefits,
            jb_pst_modality,
            jb_pst_schedule,
            jb_pst_contract_type,
            jb_pst_experience_level,
            jb_pst_publication_date,
            jb_pst_expiration_date,
            jb_pst_salary,
            jb_pst_image_url,
            jb_pst_approval_status,
            jb_pst_rejection_reason,
            jb_pst_id_company
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NULL, ?)
    `;

    const [ result ] = await execute( sql, [
        job_title,
        requirements,
        benefits,
        modality,
        schedule,
        contract_type,
        experience_level,
        publication_date,
        expiration_date,
        salary,
        image_url,
        companyId,
    ] );

    return result.insertId;

}


// Fetches a single job posting by primary key.
// Returns null if not found. Used by convocatoriasController (detail page).
async function findJobPostingById( id ) {

    const sql = `
        SELECT *
        FROM job_posting
        WHERE jb_pst_id = ?
    `;

    const [ rows ] = await execute( sql, [ id ] );

    return rows[0] ?? null;

}


// Returns all job postings created by a specific company, regardless of approval status.
// Used by companyController for the "my postings" page.
async function findJobPostingsByCompany( companyId ) {

    const sql = `
        SELECT *
        FROM job_posting
        WHERE jb_pst_id_company = ?
    `;

    const [ rows ] = await execute( sql, [ companyId ] );

    return rows;

}


// Returns all approved job postings with optional filters.
// Accepts modality, contract_type, experience_level, career_id, and a text search.
// Used by convocatoriasController for the browse/search page.
async function getAllJobPostings( filters = {} ) {

    let query = `
        SELECT jp.*
        FROM job_posting jp
        LEFT JOIN job_posting_career jpc
            ON jp.jb_pst_id = jpc.jpc_id_job_posting
        WHERE jp.jb_pst_approval_status = 'approved'
    `;

    const values = [];

    if ( filters.modality ) {
        query += ` AND jp.jb_pst_modality = ?`;
        values.push( filters.modality );
    }

    if ( filters.contract_type ) {
        query += ` AND jp.jb_pst_contract_type = ?`;
        values.push( filters.contract_type );
    }

    if ( filters.experience_level ) {
        query += ` AND jp.jb_pst_experience_level = ?`;
        values.push( filters.experience_level );
    }

    if ( filters.career_id ) {
        query += ` AND jpc.jpc_id_career = ?`;
        values.push( filters.career_id );
    }

    if ( filters.search ) {
        query += `
            AND (
                jp.jb_pst_job_title    LIKE ?
                OR jp.jb_pst_requirements LIKE ?
            )
        `;
        values.push( `%${ filters.search }%`, `%${ filters.search }%` );
    }

    const [ rows ] = await execute( query, values );

    return rows;

}


// Inserts rows in job_posting_career to associate careers with a posting.
// Called right after createJobPosting() or during an edit to sync the career list.
async function attachJobPostingCareers( jobId, careerIds ) {

    for ( const careerId of careerIds ) {

        const sql = `
            INSERT INTO job_posting_career (jpc_id_job_posting, jpc_id_career)
            VALUES (?, ?)
        `;

        await execute( sql, [ jobId, careerId ] );

    }

}


// Deletes all career associations for a posting.
// Always called before re-inserting an updated career list during an edit.
async function detachJobPostingCareers( jobId ) {

    const sql = `
        DELETE FROM job_posting_career
        WHERE jpc_id_job_posting = ?
    `;

    const [ result ] = await execute( sql, [ jobId ] );

    return result.affectedRows;

}


// Updates the editable content fields of a job posting.
// Does not touch approval status or publication date.
async function updateJobPosting( id, {
    job_title,
    requirements    = null,
    benefits        = null,
    modality,
    schedule        = null,
    contract_type,
    experience_level,
    expiration_date = null,
    salary          = null,
    image_url       = null,
} ) {

    const sql = `
        UPDATE job_posting SET
            jb_pst_job_title        = ?,
            jb_pst_requirements     = ?,
            jb_pst_benefits         = ?,
            jb_pst_modality         = ?,
            jb_pst_schedule         = ?,
            jb_pst_contract_type    = ?,
            jb_pst_experience_level = ?,
            jb_pst_expiration_date  = ?,
            jb_pst_salary           = ?,
            jb_pst_image_url        = ?
        WHERE jb_pst_id = ?
    `;

    const [ result ] = await execute( sql, [
        job_title,
        requirements,
        benefits,
        modality,
        schedule,
        contract_type,
        experience_level,
        expiration_date,
        salary,
        image_url,
        id,
    ] );

    return result.affectedRows;

}


// Called by admin to approve or reject a job posting.
// Clears rejection reason automatically when approving.
async function updateJobPostingApprovalStatus( id, status, reason = null ) {

    if ( status !== 'rejected' ) {
        reason = null;
    }

    const sql = `
        UPDATE job_posting
        SET jb_pst_approval_status  = ?,
            jb_pst_rejection_reason = ?
        WHERE jb_pst_id = ?
    `;

    const [ result ] = await execute( sql, [ status, reason, id ] );

    return result.affectedRows;

}


// Returns all job postings pending admin review.
// Used by adminController to populate the admin panel.
async function getPendingJobPostings() {

    const sql = `
        SELECT *
        FROM job_posting
        WHERE jb_pst_approval_status = 'pending'
        ORDER BY jb_pst_publication_date DESC
    `;

    const [ rows ] = await execute( sql );

    return rows;

}


export {
    createJobPosting,
    findJobPostingById,
    findJobPostingsByCompany,
    getAllJobPostings,
    attachJobPostingCareers,
    detachJobPostingCareers,
    updateJobPosting,
    updateJobPostingApprovalStatus,
    getPendingJobPostings,
};