// Authors: 
//      * Azucena Rodriguez Flores  
//      * Miguel Angel Avila Garcia
// Description: Controller for company-related endpoints.
//              Handles creation, retrieval, update, and approval of companies.
// Date: May 17th 2026
// Lastest Update:
// Date:
// By: Azucena Rodirguez Flores 
import * as companyModel from '../models/companyModel.js';

// POST /api/companies
// Creates a new company linked to the authenticated user
async function createCompany(req, res, next) {
    try {

        // const {  } = ; 

        const userId = req.userId; // Injected by auth middleware
        const insertId = await companyModel.create(userId, req.body);

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
        const company = await companyModel.findByUserId(userId);

        if (!company) {
            const err = new Error('Company not found for this user');
            err.statusCode = 404;
            next(err);
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
        const affectedRows = await companyModel.update(userId, req.body);

        if (affectedRows === 0) {
            const err = new Error('Company not found or nothing changed');
            err.statusCode = 404;
            next(err);
        }

        res.status(200).json({
            success: true,
            message: 'Company updated successfully'
        });
    } catch (err) {
        next(err);
    }
}

// GET /api/companies/pending    (admin only)
// Returns all companies with approval status 'pending'
async function getPendingCompanies(req, res, next) {
    try {
        const companies = await companyModel.getPending();

        res.status(200).json({
            success: true,
            data: companies
        });
    } catch (err) {
        next(err);
    }
}

// PATCH /api/companies/:userId/approval    (admin only)
// Approves or rejects a company by user ID
// Body: { status: 'approved' | 'rejected', reason?: string }
async function updateCompanyApproval(req, res, next) {
    try {
        const { userId } = req.params;
        const { status, reason } = req.body;

        const validStatuses = ['approved', 'rejected', 'pending'];
        if (!validStatuses.includes(status)) {
            const err = new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
            err.statusCode = 400;
            next(err);
        }

        const affectedRows = await companyModel.updateApprovalStatus(userId, status, reason);

        if (affectedRows === 0) {
            const err = new Error('Company not found');
            err.statusCode = 404;
            next(err);
        }

        res.status(200).json({
            success: true,
            message: `Company status updated to '${status}'`
        });
    } catch (err) {
        next(err);
    }
}
export{updateCompanyApproval,getPendingCompanies,updateMyCompany,getMyCompany,createCompany}