// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
// Description: Admin controller — HTTP layer for admin-only operations.
//              Covers company approval, job posting approval, and user management.
//              All routes in this controller are protected by authMiddleware + roleMiddleware('admin').
// Date: June 29th 2026
 
// Latest Update:
// Date:
// By:


// Imports necesary for admin controller tasks
import {

    getPendingCompanies         as getPendingCompaniesModel,
    updateCompanyApprovalStatus as updateCompanyApprovalStatusModel

} from '../models/companyModel.js'

import {
    
    getAllJobPostings,
    getPendingJobPostings           as getPendingJobPostingsModel,
    updateJobPostingApprovalStatus  as updateJobPostingApprovalStatusModel

} from '../models/jobPostingModel.js';

import {

    getAllUsers      as getAllUsersModel,
    toggleUserActive as toggleActiveUserModel 

} from '../models/userModel.js';

// - COMPANIES FUNCTIONS - COMPANIES FUNCTIONS - COMPANIES FUNCTIONS -  

// GET /api/admin/campanies/pending/
// Returns all companies waiting for approval
async function getPendingCompanies ( req, res, next ) {

    try{

        const companies = await getPendingCompaniesModel();

        res.status( 200 ).json({
            success: true,
            data:    companies,
        });

    }catch ( err ){ next( err ); }
    
}

// PATCH /api/admin/companies/:id/approval
// Approves or rejects a company by its userId
// Body: { status: 'approved' | 'rejected' | 'pending', reason?: string }
async function updateCompanyApprovalStatus( req, res, next ) {

    try{

        const { id }             = req.params;
        const { status, reason } = req.body;

        const affectedRows = await updateCompanyApprovalStatusModel( id, status, reason ?? null );

        if ( !affectedRows ){

            const err      = new Error( 'Company not found' );
            err.statusCode = 404;
            return next( err );

        }

        res.status( 200 ).json({
            success: true,
            message: `Company approval status updated to '${ status }'.`,

        });

    }catch( err ){ next( err ); } 
    
}

// - JOB POSTING - JOB POSTING - JOB POSTING - JOB POSTING 

// GET /api/admin/job-posting/pending/
// Returns all job posting waiting for approval
async function getPendingJobPostings( req, res, next ) {

    try {

        const posting = await getPendingJobPostingsModel();

        res.status( 200 ).json({

            success: true,
            data:   posting,

        });
        
    } catch ( err ) { next( err ); }
    
}


// PATCH /api/admin/job-posting/:id/approval
// Approves or reject a job posting its id 
// Body: { status: 'approved' | 'rejected' | 'pending', reason?: string }
async function updateJobPostingApprovalStatus( req, res, next ) {

    try {

        const { id }             = req.params;
        const { status, reason } = req.body;

        const affectedRows = updateJobPostingApprovalStatusModel( id, status, reason ?? null );

        if ( !affectedRows ){

            const err      = new Error( 'Job posting not found' );
            err.statusCode = 404;
            return next( err );

        }

        res.status( 200 ).json({
            success: true,
            message: `Job posting approval status updated to '${ status }'.`,
        });


        
    } catch ( err ) { next(err); }
    
}


// - USER FUNCTIONS - USER FUNCTIONS - USER FUNCTIONS - USER FUNCTIONS - USER FUNCTIONS - 

// GET /api/admin/users
// Returns all registered users with role-specific data joined in
async function getAllUsers( req, res, next ) {

    try{

        const users = await getAllUsersModel();

        res.status( 200 ).json({
            success: true,
            data:    users,
        });

    }catch( err ){ next( err ); }
}


// PATCH /api/admin/users/:id/toggle-active
// Flip user_active between 1 and 0 for the given user
// Return erro if user dont exist
async function toggleActiveUser( req, res, next ) {

    try{
        const { id } = req.params;

        const affectedRows = await toggleActiveUserModel( id );

        if( !affectedRows ){
            const err      = new Error( 'User not found.' );
            err.statusCode = 404;
            return next( err );
        }

        res.status( 200 ).json({
            success:    true,
            message:    'User active status toggle succesfully',
        });

    }catch( err ){ next( err ); }       

}

export { 

    // Companies
    getPendingCompanies,
    updateCompanyApprovalStatus,

    // Job Posting
    getPendingJobPostings,
    updateJobPostingApprovalStatus,

    // Users
    getAllUsers,
    toggleActiveUser


 };