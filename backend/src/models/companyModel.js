// Authors: 
//      * Azucena Rodriguez Flores  
//      * Miguel Angel Avila Garcia
// Description: Company model that manages database interactions for the company entity.
//              Includes methods for creating, retrieving, updating company data,
//              as well as handling approval status and pending company queries.
// Date: May 2nd 2026

// Lastest Update:
// Date:
// By:

import { execute } from '../config/db.js'; // Import database connection

// Create a new company associated with a user
// Inserts company data into the database with default approval status 'pending'
async function create(userId, data) {
    // Extract relevant fields from input object
    
    const {
        cmp_name,
        cmp_size,
        cmp_industry,
        cmp_city,
        cmp_state,
        cmp_address,
        cmp_contact_email
    } = data;

    // SQL query to insert new company
    const sql =
        `INSERT INTO company 
         (cmp_id_user,cmp_name,cmp_size,cmp_industry,cmp_city,cmp_state,
          cmp_address,cmp_contact_email,cmp_approval_status,cmp_rejection_reason)
          VALUES (?,?,?,?,?,?,?,?,'pending',NULL)`;

    // Execute query with parameterized values to prevent SQL injection
    const [result] = await execute(sql, [
        userId,
        cmp_name,
        cmp_size,
        cmp_industry,
        cmp_city,
        cmp_state,
        cmp_address,
        cmp_contact_email
    ]);

    // Return the generated ID of the new company
    return result.insertId;

}

// Retrieve company by user ID
// Returns the first matching company or null if not found
async function findByUserId(userId) {
    const sql = `SELECT * FROM company WHERE cmp_id_user = ?`;

    // Execute query
    const [result] = await execute(sql, [userId]);

    // Return first result if exists, otherwise null
    return result.length > 0 ? result[0] : null;
}

// Update company data
// Updates editable fields for a company associated with a user
async function update(userId, data) {
    // Extract editable fields
    const {
        cmp_name,
        cmp_size,
        cmp_industry,
        cmp_city,
        cmp_state,
        cmp_address,
        cmp_contact_email
    } = data;

    // SQL query to update company fields
    const sql =
        `UPDATE company SET
            cmp_name = ?,
            cmp_size = ?,
            cmp_industry = ?,
            cmp_city = ?,
            cmp_state = ?,
            cmp_address = ?,
            cmp_contact_email = ?
         WHERE cmp_id_user = ?`;

    // Execute update query
    const [result] = await execute(sql, [
        cmp_name,
        cmp_size,
        cmp_industry,
        cmp_city,
        cmp_state,
        cmp_address,
        cmp_contact_email,
        userId
    ]);

    // Return number of affected rows
    return result.affectedRows;
}

// Update approval status of a company
// Handles approval workflow logic including validation of status and rejection reason
async function updateApprovalStatus(userId, status, reason) {
    
    // Handle rejection reason logic
    if (status !== 'rejected') {
        reason = null; // Clear reason if not rejected
    } else if (!reason) {
        throw new Error('Rejection reason required'); // Require reason if rejected
    }

    // SQL query to update approval status
    const sql =
        `UPDATE company
         SET cmp_approval_status = ?, cmp_rejection_reason = ?
         WHERE cmp_id_user = ?`;

    // Execute update
    const [result] = await execute(sql, [status, reason, userId]);

    // Return number of affected rows
    return result.affectedRows;
}

// Get all pending companies
// Retrieves all companies with approval status 'pending' ordered by user ID
async function getPending() {
    const sql =
        `SELECT * FROM company 
         WHERE cmp_approval_status = 'pending'
         ORDER BY cmp_id_user DESC`;

    // Execute query
    const [result] = await execute(sql);

    // Return array of pending companies
    return result;
}

// Export all model methods
export default { create, findByUserId, update, updateApprovalStatus, getPending };