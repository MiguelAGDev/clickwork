// Authors: 
//      * Azucena Rodriguez Flores  
//      * Miguel Angel Avila Garcia
// Description: Controller for company-related endpoints.
//              Handles creation, retrieval, update, and approval of companies.
// Date: May 17th 2026

// Lastest Update: toggleMyCompanyActive now pauses the company
//      (cmp_active) instead of deactivating the whole account.
// Date: November 16th 2026
// By: Miguel Angel Avila Garcia

import {
    createCompany as createCompanyModel,
    findCompanyByUserId,
    toggleCompanyActive,
    updateCompany
} from '../models/companyModel.js';

// POST /api/companies
// Creates a new company linked to the authenticated user
async function createCompany(req, res, next) {
    try {

        const userId = req.user.id;

        // Map validated request body (cmp_* field names, per the route
        // validators) to the unprefixed shape companyModel.createCompany
        // actually expects. See backend audit C1.
        const companyData = {
            name:          req.body.cmp_name,
            size:          req.body.cmp_size,
            industry:      req.body.cmp_industry,
            city:          req.body.cmp_city,
            state:         req.body.cmp_state,
            address:       req.body.cmp_address,
            contact_email: req.body.cmp_contact_email,
        };

        const insertId = await createCompanyModel(userId, companyData);

        res.status(201).json({
            success: true,
            message: 'Company created successfully. Pending approval.',
            data: { id: insertId }
        });
    } catch (err) {
        next(err);
    }
}

// GET /api/companies/me
// Returns the company belonging to the authenticated user
async function getMyCompany(req, res, next) {
    try {
        const userId = req.user.id;
        const company = await findCompanyByUserId(userId);

        if (!company) {
            const err = new Error('Company not found for this user');
            err.statusCode = 404;
            return next(err);
        }

        res.status(200).json({
            success: true,
            data: company
        });
    } catch (err) {
        next(err);
    }
}

// PUT /api/companies/me
// Updates the company belonging to the authenticated user
async function updateMyCompany(req, res, next) {
    try {
        const userId = req.user.id;

        // See backend audit C1 — same field-name mapping as createCompany.
        const companyData = {
            name:          req.body.cmp_name,
            size:          req.body.cmp_size,
            industry:      req.body.cmp_industry,
            city:          req.body.cmp_city,
            state:         req.body.cmp_state,
            address:       req.body.cmp_address,
            contact_email: req.body.cmp_contact_email,
        };

        const affectedRows = await updateCompany(userId, companyData);

        if (affectedRows === 0) {
            const err = new Error('Company not found or nothing changed');
            err.statusCode = 404;
            return next(err);
        }

        res.status(200).json({
            success: true,
            message: 'Company updated successfully'
        });
    } catch (err) {
        next(err);
    }
}

// PATCH /api/company/toggle-active
// Self-service: pauses or resumes the authenticated company. It flips
// company.cmp_active, not the account flag: a paused company still logs
// in and can call this again to resume. While paused, its postings are
// left out of the public listing. Answers the new value as data.active.
async function toggleMyCompanyActive(req, res, next) {
    try {
        if (req.user.role !== 'company') {
            const err = new Error('Only company accounts can use this endpoint.');
            err.statusCode = 403;
            return next(err);
        }

        const active = await toggleCompanyActive(req.user.id);

        if (active === null) {
            const err = new Error('Company not found.');
            err.statusCode = 404;
            return next(err);
        }

        res.status(200).json({
            success: true,
            message: active ? 'Company resumed successfully.' : 'Company paused successfully.',
            data: { active },
        });
    } catch (err) {
        next(err);
    }
}

// NOTE: pending-listing and approval-status-update for companies live
// exclusively in adminController.js, routed under /api/admin/companies
// and gated by roleMiddleware('admin'). See backend audit C2.

export { updateMyCompany, getMyCompany, createCompany, toggleMyCompanyActive };