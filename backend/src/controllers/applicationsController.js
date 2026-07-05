// Authors: 
//      * Azucena Rodriguez Flores  
//      * Miguel Angel Avila Garcia
// Description: Controller for application endpoints.
//              Handles job applications and application retrieval.
//              Reads req, calls model functions, writes res,
//              and forwards errors with next(err).
//              No database logic lives here.
// Date: May 17th 2026
 
// Latest Update:
// Date:
// By: Azucena Rodriguez Flores 

import { 

    createApplication, 
    findApplicationsByUser, 
    findApplicationsByJobPosting,
    findApplicationByUserAndJobPosting
    
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

        if(!company || posting.jb_pst_id_company !== company.cmp_id_user){

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

export{getApplicationsByJobPosting,getMyApplications,applyToJob};