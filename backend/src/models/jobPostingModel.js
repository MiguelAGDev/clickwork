// Authors: 
//      * Azucena Rodriguez Flores  
//      * Miguel Angel Avila Garcia
// Description: Job Posting model that manages database operations related to job postings.
//              Includes CRUD operations, dynamic filtering, and career associations.
// Date: May 5th 2026

// Lastest Update:
// Date:
// By:

const { pool } = require("../config/db.cjs"); // Import database connection

//  Create a new job posting
// Inserts a job posting with default approval status 'pending'
const create = async (companyId, data) => {
    // Extract job posting fields
    const {
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
        jb_pst_image_url
    } = data;

    // SQL query to insert job posting
    const query = 
    `INSERT INTO job_posting(
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
    VALUES (?,?,?,?,?,?,?,?,?,?,?, 'pending', NULL, ?)`; 
    
    // Execute query
    const [result] = await pool.query(query, [
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
        companyId 
    ]);

    // Return generated ID
    return result.insertId;
}

//  Get job posting by ID
// Returns a single job or null if not found
const getById = async (id) => {
    const query = `
        SELECT * FROM job_posting
        WHERE jb_pst_id = ?
    `;

    const [result] = await pool.query(query, [id]);

    return result.length > 0 ? result[0] : null;
}

// 🔹 Get job postings by company
// Returns all job postings belonging to a specific company
const getByCompany = async (companyId) => {
    const query = `
        SELECT * FROM job_posting
        WHERE jb_pst_id_company = ?
    `;

    const [result] = await pool.query(query, [companyId]);

    return result;
}

//  Get all approved job postings with optional filters
// Filters include modality, contract type, experience level, career, and search text
const getAll = async (filters = {}) => {

    let query = `
        SELECT jp.*
        FROM job_posting jp
        LEFT JOIN job_posting_career jpc 
            ON jp.jb_pst_id = jpc.jpc_id_job_posting
        WHERE jp.jb_pst_approval_status = 'approved'
    `;

    let values = [];

    if (filters.modality) {
        query += ` AND jp.jb_pst_modality = ?`;
        values.push(filters.modality);
    }

    if (filters.contractType) {
        query += ` AND jp.jb_pst_contract_type = ?`;
        values.push(filters.contractType);
    }

    if (filters.experienceLevel) {
        query += ` AND jp.jb_pst_experience_level = ?`;
        values.push(filters.experienceLevel);
    }

    
    if (filters.careerId) {
        query += ` AND jpc.jpc_id_career = ?`;
        values.push(filters.careerId);
    }

    if (filters.search) {
        query += `
            AND (
                jp.jb_pst_job_title LIKE ?
                OR jp.jb_pst_requirements LIKE ?
            )
        `;
        values.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    const [result] = await pool.query(query, values);
    return result;
};

//  Attach careers to a job posting
// Inserts multiple records into the relation table
const attachCareers = async (jobId, careerIds) => {
    for (const careerId of careerIds) {
        const query = `
            INSERT INTO job_posting_career (jpc_id_job_posting, jpc_id_career)
            VALUES (?, ?)
        `;

        await pool.query(query, [jobId, careerId]);
    }
}

//  Remove all careers associated with a job posting
const detachCareers = async (jobId) => {
    const query = `
        DELETE FROM job_posting_career
        WHERE jpc_id_job_posting = ?
    `;

    const [result] = await pool.query(query, [jobId]);

    return result.affectedRows;
}

// Update job posting data
// Updates editable fields only
const update = async (id, data) => {
    const {
        jb_pst_job_title,
        jb_pst_requirements,
        jb_pst_benefits,
        jb_pst_modality,
        jb_pst_schedule,
        jb_pst_contract_type,
        jb_pst_experience_level,
        jb_pst_expiration_date,
        jb_pst_salary,
        jb_pst_image_url
    } = data;

    const query = `
        UPDATE job_posting SET
            jb_pst_job_title = ?,
            jb_pst_requirements = ?,
            jb_pst_benefits = ?,
            jb_pst_modality = ?,
            jb_pst_schedule = ?,
            jb_pst_contract_type = ?,
            jb_pst_experience_level = ?,
            jb_pst_expiration_date = ?,
            jb_pst_salary = ?,
            jb_pst_image_url = ?
        WHERE jb_pst_id = ?
    `;

    const [result] = await pool.query(query, [
        jb_pst_job_title,
        jb_pst_requirements,
        jb_pst_benefits,
        jb_pst_modality,
        jb_pst_schedule,
        jb_pst_contract_type,
        jb_pst_experience_level,
        jb_pst_expiration_date,
        jb_pst_salary,
        jb_pst_image_url,
        id
    ]);

    return result.affectedRows;
}

// Update approval status
// Changes job status and handles rejection reason
const updateApprovalStatus = async (id, status, reason) => {

    if (status !== 'rejected') {
        reason = null;
    }

    const query = `
        UPDATE job_posting
        SET jb_pst_approval_status = ?, 
            jb_pst_rejection_reason = ?
        WHERE jb_pst_id = ?
    `;

    const [result] = await pool.query(query, [status, reason, id]);

    return result.affectedRows;
}

// Get all pending job postings
// Used for admin approval flow
const getPending = async () => {
    const query = `
        SELECT * FROM job_posting
        WHERE jb_pst_approval_status = 'pending'
        ORDER BY jb_pst_publication_date DESC
    `;

    const [result] = await pool.query(query);

    return result;
}
// Export all model methods
module.exports = {
    create,
    getById,
    getByCompany,
    getAll,
    attachCareers,
    detachCareers,
    update,
    updateApprovalStatus,
    getPending
};