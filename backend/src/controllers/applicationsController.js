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

import { create,getByJobPosting,getByUser } from '../models/applicationModel.js';
import { getById } from '../jobPostingModel.js';

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
            next (err)

        }

        // Verify that the job posting exists
        const posting = await getById(job_posting_id);

        if(!posting){

            const err = new Error ('Job posting not found')
            err.statusCode = 404;
             next(err);

        }

        // Verify that the posting is approved
        if(posting.jb_pst_approval_status !== 'approved'){

            const err = new Error ('Cannot apply to a job posting that is not approved');
            err.statusCode = 400;
            next(err);

        }

        // Create application record
        const insertId = await create(userId,job_posting_id);

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
        const applications = await getByUser(userId);

        res.status(200).json({
            success: true,
            data: applications
        });

    }catch(err){

        next(err);

    }
    
}

// GET /api/applications/job-posting/:jobPostingId
// Returns all applications associated with a specific job posting
async function getApplicationsByJobPosting(req,res,next) {

    try{

        const {jobPostingId} = req.params;
        const applications = await getByJobPosting(jobPostingId);

        res.status(200).json({
            success: true,
            data: applications
        });

    }catch(err){

        next(err);

    }
    
}

export{getApplicationsByJobPosting,getMyApplications,applyToJob};
