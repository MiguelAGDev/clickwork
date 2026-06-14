// Authors: 
//      * Azucena Rodriguez Flores  
//      * Miguel Angel Avila Garcia
// Description: Controller for job posting endpoints.
//              Handles creation, retrieval, update and approval
//              of job postings.
// Date: May 17th 2026

// Lastest Update:
// Date: 9th June 2026
// By: Miguel Angel Avila Garcia


import {

    createJobPosting as createJobPostingModel,
    getAllJobPostings as getAllJobPostingsModel,
    findJobPostingById,
    findJobPostingsByCompany,
    updateJobPosting as updateJobPostingModel,
    attachJobPostingCareers,
    detachJobPostingCareers,
    getPendingJobPostings as getPendingJobPostingsModel,
    updateJobPostingApprovalStatus

    } from '../models/jobPostingModel.js';

import {
    findCompanyByUserId
    } from '../models/companyModel.js';




// ==========================================
// POST /api/announcements
// Creates a new job posting for the
// authenticated company
// ==========================================
async function createJobPosting(req, res, next) {

    try {

        // Get authenticated user ID
        const userId = req.user.id;

        // Find company associated with user
        const company =
            await findCompanyByUserId(userId);

        // Validate that user has a registered company
        if (!company) {

            const err = new Error(
                'You must have a registered company to create job posting'
            );

            err.statusCode = 403;

            return next(err);
        }

        // Validate company approval status
        if (company.cmp_approval_status !== 'approved') {

            const err = new Error(
                'Your company must be approved before posting jobs'
            );

            err.statusCode = 403;

            return next(err);
        }

        // Create job posting in database
        const insertId =
            await createJobPostingModel(
                company.cmp_id_user,
                req.body
            );

        // Get related careers from request body
        const { careerIds } = req.body;

        // Attach careers if provided
        if (Array.isArray(careerIds) && careerIds.length > 0) {

            await attachJobPostingCareers(
                insertId,
                careerIds
            );

        }

        // Send successful response
        res.status(201).json({

            success: true,

            message:
                'Job posting created. Pending approval.',

            data: {
                id: insertId
            }

        });

    } catch (err) {

        // Forward error to centralized error handler
        next(err);

    }

}



// ==========================================
// GET /api/announcements
// Returns all job postings using filters
// from query parameters
// ==========================================
async function getAllJobPostings(req, res, next) {

    try {

        // Build filters object from query params
        const filters = {

            modality: req.query.modality,

            contractType: req.query.contractType,

            experienceLevel: req.query.experienceLevel,

            careerId: req.query.careerId,

            search: req.query.search

        };

        // Remove undefined filters
        Object.keys(filters).forEach(

            key =>
                filters[key] === undefined &&
                delete filters[key]

        );

        // Fetch job postings from database
        const postings =
            await getAllJobPostingsModel(filters);

        // Send successful response
        res.status(200).json({

            success: true,

            data: postings

        });

    } catch (err) {

        // Forward error to centralized error handler
        next(err);

    }

}




// ==========================================
// GET /api/announcements/:id
// Returns a specific job posting by ID
// ==========================================
async function getJobPostingById(req, res, next) {

    try {

        // Fetch job posting by ID
        const posting =
            await findJobPostingById(req.params.id);

        // Validate existence of posting
        if (!posting) {

            const err = new Error(
                'Job posting not found'
            );

            err.statusCode = 404;

            return next(err);
        }

        // Send successful response
        res.status(200).json({

            success: true,

            data: posting

        });

    } catch (err) {

        // Forward error to centralized error handler
        next(err);

    }

}




// ==========================================
// GET /api/announcements/my-company
// Returns all job postings belonging
// to the authenticated company
// ==========================================
async function getMyCompanyJobPostings(
    req,
    res,
    next
) {

    try {

        // Get authenticated user ID
        const userId = req.user.id;

        // Find associated company
        const company =
            await findCompanyByUserId(userId);

        // Validate company existence
        if (!company) {

            const err = new Error(
                'No company found for this user'
            );

            err.statusCode = 404;

            return next(err);
        }

        // Fetch company job postings
        const postings =
            await findJobPostingsByCompany(
                company.cmp_id_user
            );

        // Send successful response
        res.status(200).json({

            success: true,

            data: postings

        });

    } catch (err) {

        // Forward error to centralized error handler
        next(err);

    }

}




// ==========================================
// PUT /api/announcements/:id
// Updates a job posting owned
// by the authenticated company
// ==========================================
async function updateJobPosting(req, res, next) {

    try {

        // Get authenticated user ID
        const userId = req.user.id;

        // Get job posting ID from URL params
        const postingId = req.params.id;

        // Find associated company
        const company =
            await findCompanyByUserId(userId);

        // Fetch job posting information
        const posting =
            await findJobPostingById(postingId);

        // Validate posting existence
        if (!posting) {

            const err = new Error(
                'Job posting not found'
            );

            err.statusCode = 404;

            return next(err);
        }

        // Validate company ownership
        if (
            !company ||
            posting.jb_pst_id_company !== company.cmp_id_user
        ) {

            const err = new Error(
                'You are not authorized to edit this job posting'
            );

            err.statusCode = 403;

            return next(err);
        }

        // Update job posting
        const affectedRows =
            await updateJobPostingModel(
                postingId,
                req.body
            );

        // Get careers from request body
        const { careerIds } = req.body;

        // Update careers if provided
        if (Array.isArray(careerIds)) {

            // Remove old careers
            await detachJobPostingCareers(
                postingId
            );

            // Attach new careers
            if (careerIds.length > 0) {

                await attachJobPostingCareers(
                    postingId,
                    careerIds
                );

            }

        }

        // Send successful response
        res.status(200).json({

            success: true,

            message:
                'Job posting updated successfully',

            data: {
                affectedRows
            }

        });

    } catch (err) {

        // Forward error to centralized error handler
        next(err);

    }

}




// ==========================================
// GET /api/admin/announcements/pending
// Returns all pending job postings
// awaiting admin approval
// ==========================================
async function getPendingJobPostings(
    req,
    res,
    next
) {

    try {

        // Fetch pending postings
        const postings =
            await getPendingJobPostingsModel();

        // Send successful response
        res.status(200).json({

            success: true,

            data: postings

        });

    } catch (err) {

        // Forward error to centralized error handler
        next(err);

    }

}




// ==========================================
// PUT /api/admin/announcements/:id/approve
// Updates approval status for
// a specific job posting
// ==========================================
async function updateJobPostingApproval(
    req,
    res,
    next
) {

    try {

        // Get job posting ID from params
        const { id } = req.params;

        // Get approval data from request body
        const { status, reason } = req.body;

        // Define valid approval statuses
        const validStatuses = [

            'approved',
            'rejected',
            'pending'

        ];

        // Validate provided status
        if (!validStatuses.includes(status)) {

            const err = new Error(
                `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            );

            err.statusCode = 400;

            return next(err);
        }

        // Validate rejection reason
        if (status === 'rejected' && !reason) {

            const err = new Error(
                'A rejection reason is required'
            );

            err.statusCode = 400;

            return next(err);
        }

        // Update approval status in database
        const affectedRows =
            await updateJobPostingApprovalStatus(
                id,
                status,
                reason
            );

        // Validate posting existence
        if (affectedRows === 0) {

            const err = new Error(
                'Job posting not found'
            );

            err.statusCode = 404;

            return next(err);
        }

        // Send successful response
        res.status(200).json({

            success: true,

            message:
                `Job posting status updated to '${status}'`

        });

    } catch (err) {

        // Forward error to centralized error handler
        next(err);

    }

}




// ==========================================
// Export controller methods
// ==========================================
export {

    createJobPosting,
    getAllJobPostings,
    getJobPostingById,
    getMyCompanyJobPostings,
    updateJobPosting,
    getPendingJobPostings,
    updateJobPostingApproval

};