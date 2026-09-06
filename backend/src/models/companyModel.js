// Authors: 
//      * Azucena Rodriguez Flores  
//      * Miguel Angel Avila Garcia
// Description: Company model — queries for the company table.
//              Handles creation, retrieval, profile updates, approval workflow,
//              and pending company listings.
// Date: May 2nd 2026

// Latest Update: Add getAllCompanies; drop SELECT * and alias columns
// (cmp_* -> unprefixed) in findCompanyByUserId, getPendingCompanies,
// getAllCompanies. Field rename required fixing 9 call sites across
// applicationsController/userController/jobPostingController that read
// company.cmp_* — see notclaude/bitacora/.
// Date: September 2nd 2026
// By: Claude (Sonnet 5), at Miguel's explicit request

// Latest Update: Fix findCompanyByUserId, getPendingCompanies and
// getAllCompanies querying company.cmp_permissions, a column that no
// longer exists — permissions are centralized on app_user.ap_usr_permissions.
// Joined app_user to read the permission from its real location.
// Date: September 6th 2026
// By: Claude (Sonnet 5), at Miguel's explicit request

import { execute } from '../config/db.js';


// Inserts a new company row linked to an existing app_user.
// Approval status defaults to 'pending'. Called by authService on company registration.
async function createCompany( userId, {
    name,
    size,
    industry,
    city        = null,
    state       = null,
    address     = null,
    contact_email = null,
} ) {

    const sql = `
        INSERT INTO company
            (cmp_id_user, cmp_name, cmp_size, cmp_industry,
             cmp_city, cmp_state, cmp_address, cmp_contact_email,
             cmp_approval_status, cmp_rejection_reason)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NULL)
    `;

    const [ result ] = await execute( sql, [
        userId,
        name,
        size,
        industry,
        city,
        state,
        address,
        contact_email,
    ] );

    return result.insertId;

}


// Fetches the company profile for a given user.
// Used to load the company dashboard and by adminController.
async function findCompanyByUserId( userId ) {

    const sql = `
        SELECT
            c.cmp_id_user           AS id,
            c.cmp_name              AS name,
            c.cmp_size              AS size,
            c.cmp_industry          AS industry,
            c.cmp_city              AS city,
            c.cmp_state             AS state,
            c.cmp_address           AS address,
            c.cmp_contact_email     AS contact_email,
            c.cmp_approval_status   AS approval_status,
            c.cmp_rejection_reason  AS rejection_reason,
            au.ap_usr_permissions   AS permissions
        FROM company c
        JOIN app_user au ON au.ap_usr_id = c.cmp_id_user
        WHERE c.cmp_id_user = ?
    `;

    const [ rows ] = await execute( sql, [ userId ] );

    return rows[0] ?? null;

}


// Updates editable company profile fields.
// Approval status cannot be changed through this function.
async function updateCompany( userId, {
    name,
    size,
    industry,
    city          = null,
    state         = null,
    address       = null,
    contact_email = null,
} ) {

    const sql = `
        UPDATE company SET
            cmp_name          = ?,
            cmp_size          = ?,
            cmp_industry      = ?,
            cmp_city          = ?,
            cmp_state         = ?,
            cmp_address       = ?,
            cmp_contact_email = ?
        WHERE cmp_id_user = ?
    `;

    const [ result ] = await execute( sql, [
        name,
        size,
        industry,
        city,
        state,
        address,
        contact_email,
        userId,
    ] );

    return result.affectedRows;

}


// Called by admin to approve or reject a company registration.
// Saves rejection reason only when status is 'rejected'; clears it otherwise.
async function updateCompanyApprovalStatus( userId, status, reason = null ) {

    if ( status !== 'rejected' ) {
        reason = null;
    } else if ( !reason ) {
        const err = new Error( 'Rejection reason required' );
        err.statusCode = 400;
        throw err;
    }

    const sql = `
        UPDATE company
        SET cmp_approval_status   = ?,
            cmp_rejection_reason  = ?
        WHERE cmp_id_user = ?
    `;

    const [ result ] = await execute( sql, [ status, reason, userId ] );

    return result.affectedRows;

}


// Returns all companies with approval_status = 'pending'.
// Used by adminController to populate the admin review panel.
async function getPendingCompanies() {

    const sql = `
        SELECT
            c.cmp_id_user           AS id,
            c.cmp_name              AS name,
            c.cmp_size              AS size,
            c.cmp_industry          AS industry,
            c.cmp_city              AS city,
            c.cmp_state             AS state,
            c.cmp_address           AS address,
            c.cmp_contact_email     AS contact_email,
            c.cmp_approval_status   AS approval_status,
            c.cmp_rejection_reason  AS rejection_reason,
            au.ap_usr_permissions   AS permissions
        FROM company c
        JOIN app_user au ON au.ap_usr_id = c.cmp_id_user
        WHERE c.cmp_approval_status = 'pending'
        ORDER BY c.cmp_id_user DESC
    `;

    const [ rows ] = await execute( sql );

    return rows;

}


// Returns every company, regardless of approval status.
// Used by adminController for a full company listing (vs. getPendingCompanies,
// which only returns approval_status = 'pending').
async function getAllCompanies() {

    const sql = `
        SELECT
            c.cmp_id_user           AS id,
            c.cmp_name              AS name,
            c.cmp_size              AS size,
            c.cmp_industry          AS industry,
            c.cmp_city              AS city,
            c.cmp_state             AS state,
            c.cmp_address           AS address,
            c.cmp_contact_email     AS contact_email,
            c.cmp_approval_status   AS approval_status,
            c.cmp_rejection_reason  AS rejection_reason,
            au.ap_usr_permissions   AS permissions
        FROM company c
        JOIN app_user au ON au.ap_usr_id = c.cmp_id_user
        ORDER BY c.cmp_id_user DESC
    `;

    const [ rows ] = await execute( sql );

    return rows;

}


export {
    createCompany,
    findCompanyByUserId,
    updateCompany,
    updateCompanyApprovalStatus,
    getPendingCompanies,
    getAllCompanies,
};