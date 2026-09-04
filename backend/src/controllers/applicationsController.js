// Authors: 
//      * Azucena Rodriguez Flores  
//      * Miguel Angel Avila Garcia
// Description: Controller for application endpoints.
//              Handles job applications and application retrieval.
//              Reads req, calls model functions, writes res,
//              and forwards errors with next(err).
//              No database logic lives here.
// Date: May 17th 2026
 
// Latest Update: Update company.cmp_id_user refs to company.id (companyModel field rename)
// Date: September 2nd 2026
// By: Claude (Sonnet 5), at Miguel's explicit request

import { 

    createApplication, 
    findApplicationsByUser, 
    findApplicationsByJobPosting,
    findApplicationByUserAndJobPosting,
    findApplicationById,
    updateApplicationStatus as updateApplicationStatusModel
    
    } from '../models/applicationModel.js';
import { findJobPostingById } from '../models/jobPostingModel.js';
import { findCompanyByUserId } from '../models/companyModel.js';

// POST /api/applications
// Registers the authenticated user's application to a job posting
async function applyToJob(req,res,next) {

    try{

        const userId = req.user.id;
        const {job_posting_id} = req.body;

        // Validate required job posting id
        if(!job_posting_id){

            const err = new Error ('job_posting_id is required' );
            err.statusCode = 400;
            return next (err)

        }

        // Verify that the job posting exists
        const posting = await findJobPostingById(job_posting_id);

        if(!posting){

            const err = new Error ('Job posting not found')
            err.statusCode = 404;
            return next(err);

        }

        // Verify that the posting is approved
        if(posting.jb_pst_approval_status !== 'approved'){

            const err = new Error ('Cannot apply to a job posting that is not approved');
            err.statusCode = 400;
            return next(err);

        }

        // Prevent duplicate applications to the same posting
        const existing = await findApplicationByUserAndJobPosting(userId, job_posting_id);

        if(existing){

            const err = new Error('You have already applied to this job posting.');
            err.statusCode = 409;
            return next(err);

        }

        // Create application record
        const insertId = await createApplication(userId,job_posting_id);

        // Return successful response
        res.status(201).json({
            success: true,
            message :'Application submitted successfully',
            data : {id: insertId} //ask to Miguel 
        });

    }catch(err){

        next(err);

    }
    
}

// GET /api/applications/me
// Returns all applications made by the authenticated user
async function getMyApplications(req,res,next) {

    try{

        const userId = req.user.id;
        const applications = await findApplicationsByUser(userId);

        res.status(200).json({
            success: true,
            data: applications
        });

    }catch(err){

        next(err);

    }
    
}

// GET /api/applications/job-posting/:jobPostingId
// GET /api/applications/company/applicants/:jobPostingId
// Returns all applications associated with a specific job posting.
// Restricted to the company that owns the posting — see backend audit C3.
async function getApplicationsByJobPosting(req,res,next) {

    try{

        const userId = req.user.id;
        const {jobPostingId} = req.params;

        // Verify the posting exists
        const posting = await findJobPostingById(jobPostingId);

        if(!posting){

            const err = new Error('Job posting not found');
            err.statusCode = 404;
            return next(err);

        }

        // Verify the authenticated user's company owns this posting.
        // Without this check, any authenticated user (of any role) could
        // view any other company's applicant list.
        const company = await findCompanyByUserId(userId);

        if(!company || posting.jb_pst_id_company !== company.id){

            const err = new Error('You are not authorized to view applicants for this job posting.');
            err.statusCode = 403;
            return next(err);

        }

        const applications = await findApplicationsByJobPosting(jobPostingId);

        res.status(200).json({
            success: true,
            data: applications
        });

    }catch(err){

        next(err);

    }
    
}

// PATCH /api/applications/:id/status
// Updates the status of a single application (pending, under_review,
// interview, accepted, rejected). Restricted to the company that owns
// the job posting the application belongs to.
//
// This is separate from job posting / company approval status, which
// remains admin-only. Any of the five application statuses may be set
// at any time — moving an already-accepted or already-rejected
// application to another status (e.g. reconsidering a decision) is
// intentionally allowed. There is no dedicated "reopened" status in
// the schema; a company reconsidering a prior decision should send
// 'under_review' rather than 'pending', since 'pending' implies the
// application has not yet been looked at.
const VALID_APPLICATION_STATUSES = ['pending', 'under_review', 'interview', 'accepted', 'rejected'];

async function updateApplicationStatus(req, res, next) {

    try {

        const userId = req.user.id;
        const { id } = req.params;
        const { status } = req.body;

        // Validate status against the app_status ENUM — no other value is allowed
        if (!VALID_APPLICATION_STATUSES.includes(status)) {

            const err = new Error(`Invalid status. Must be one of: ${VALID_APPLICATION_STATUSES.join(', ')}`);
            err.statusCode = 400;
            return next(err);

        }

        // Verify the application exists
        const application = await findApplicationById(id);

        if (!application) {

            const err = new Error('Application not found');
            err.statusCode = 404;
            return next(err);

        }

        // Verify the job posting this application belongs to exists
        const posting = await findJobPostingById(application.app_id_job_posting);

        if (!posting) {

            const err = new Error('Job posting not found');
            err.statusCode = 404;
            return next(err);

        }

        // Verify the authenticated user's company owns this posting.
        // Same ownership pattern used in getApplicationsByJobPosting above —
        // without this check, any company could change the status of an
        // application submitted to a competitor's job posting.
        const company = await findCompanyByUserId(userId);

        if (!company || posting.jb_pst_id_company !== company.id) {

            const err = new Error('You are not authorized to update this application.');
            err.statusCode = 403;
            return next(err);

        }

        const affectedRows = await updateApplicationStatusModel(id, status);

        if (!affectedRows) {

            const err = new Error('Application not found');
            err.statusCode = 404;
            return next(err);

        }

        res.status(200).json({
            success: true,
            message: `Application status updated to '${status}'.`
        });

    } catch (err) {

        next(err);

    }

}

export{

    getApplicationsByJobPosting,
    getMyApplications,
    applyToJob,
    updateApplicationStatus
    
};