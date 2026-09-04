// Authors: 
//      * Azucena Rodriguez Flores  
//      * Miguel Angel Avila Garcia
// Description: Controller for job posting endpoints.
//              Handles creation, retrieval, update and approval
//              of job postings.
// Date: May 17th 2026

// Lastest Update: Update company.cmp_* refs to unprefixed names (companyModel field rename)
// Date: September 2nd 2026
// By: Claude (Sonnet 5), at Miguel's explicit request


import {

    createJobPosting as createJobPostingModel,
    getAllJobPostings as getAllJobPostingsModel,
    findJobPostingById,
    findJobPostingsByCompany,
    updateJobPosting as updateJobPostingModel,
    attachJobPostingCareers,
    detachJobPostingCareers,
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
        if (company.approval_status !== 'approved') {

            const err = new Error(
                'Your company must be approved before posting jobs'
            );

            err.statusCode = 403;

            return next(err);
        }

        // Map validated request body (jb_pst_* field names, per the
        // route validators) to the unprefixed shape the model expects.
        // See backend audit C1: these two shapes previously did not match,
        // so job posting creation silently received undefined values.
        const jobPostingData = {
            job_title:        req.body.jb_pst_job_title,
            requirements:      req.body.jb_pst_requirements,
            benefits:          req.body.jb_pst_benefits,
            modality:          req.body.jb_pst_modality,
            schedule:          req.body.jb_pst_schedule,
            contract_type:     req.body.jb_pst_contract_type,
            experience_level:  req.body.jb_pst_experience_level,
            publication_date:  req.body.jb_pst_publication_date ?? new Date(),
            expiration_date:   req.body.jb_pst_expiration_date,
            salary:            req.body.jb_pst_salary,
            image_url:         req.body.jb_pst_image_url,
        };

        // Create job posting in database
        const insertId =
            await createJobPostingModel(
                company.id,
                jobPostingData
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

            careerId: req.query.career_id,

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
                company.id
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
            posting.jb_pst_id_company !== company.id
        ) {

            const err = new Error(
                'You are not authorized to edit this job posting'
            );

            err.statusCode = 403;

            return next(err);
        }

        // Map validated request body (jb_pst_* field names) to the
        // unprefixed shape jobPostingModel.updateJobPosting expects.
        // See backend audit C1.
        const jobPostingData = {
            job_title:        req.body.jb_pst_job_title,
            requirements:      req.body.jb_pst_requirements,
            benefits:          req.body.jb_pst_benefits,
            modality:          req.body.jb_pst_modality,
            schedule:          req.body.jb_pst_schedule,
            contract_type:     req.body.jb_pst_contract_type,
            experience_level:  req.body.jb_pst_experience_level,
            expiration_date:   req.body.jb_pst_expiration_date,
            salary:            req.body.jb_pst_salary,
            image_url:         req.body.jb_pst_image_url,
        };

        // Update job posting
        const affectedRows =
            await updateJobPostingModel(
                postingId,
                jobPostingData
            );

        // Any content edit sends the posting back to pending review,
        // so a company can't silently change details after approval
        // without an admin re-checking them.
        await updateJobPostingApprovalStatus(
            postingId,
            'pending'
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




// NOTE: pending-listing and approval-status-update for job postings live
// exclusively in adminController.js, routed under /api/admin/job-postings
// and gated by roleMiddleware('admin'). See backend audit C2 — this file
// used to duplicate that logic behind authMiddleware only.




// ==========================================
// Export controller methods
// ==========================================
export {

    createJobPosting,
    getAllJobPostings,
    getJobPostingById,
    getMyCompanyJobPostings,
    updateJobPosting

};