// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
// Description: User controller — thin HTTP layer for user profile management.
//              Handles profile retrieval, profile update, CV upload, and Roll Me.
//              Reads req, calls models/services, writes res,
//              forwards errors with next(err).
//              No business logic lives here.
// Date: June 25th 2026

// Lastest Update:
// Date:
// By: Miguel Angel Avila Garcia


import { 
    findById,
    update as updateUser,
    updateCvUrl
    } from '../models/userModel.js';

import {
    updateStudent,
    updateIntern,
    updateGraduate,
} from '../models/studentModel.js';

import { 
    createApplication,
    findApplicationByUserAndJobPosting
    , deleteApplication
    } from '../models/applicationModel.js';

import { findJobPostingById }   from '../models/jobPostingModel.js';
import { findCompanyByUserId }  from '../models/companyModel.js';
import { sendRollMeEmail }      from '../services/emailService.js';
import { execute } from '../config/db.js';
import fs from 'fs';

// Verifies the uploaded file actually starts with the PDF magic number
// (%PDF-). multer's fileFilter only checks the client-supplied MIME type,
// which is trivially spoofed, so this catches a renamed/disguised file
// before it is trusted and, later, emailed to a real external company
// inbox via sendRollMeEmail. See backend audit C5.
function _isRealPdf( filePath ) {

    const fd = fs.openSync( filePath, 'r' );
    const buffer = Buffer.alloc( 5 );

    try {
        fs.readSync( fd, buffer, 0, 5, 0 );
    } finally {
        fs.closeSync( fd );
    }

    return buffer.toString( 'ascii' ) === '%PDF-';

}


// GET  /api/users/me
// Returns the authenticated user's profile
// req.user is already populated by authMiddleware
async function getMyProfile( req, res, next ) {

    try{

        res.status( 200 ).json({
            success: true,
            data:   req.user,
        });

    }catch( err ){ next( err ); }
    
}

// PUT  /api/users/me
// Updates the authenticated user's editable fields.
async function updateMyProfile( req, res, next ){

    try{
        
        const userId = req.user.id;
        
        const currentUser = await findById( userId );

        const profileData = {
            phone:      req.body.phone     ?? currentUser.phone    ?? null,
            careerId:   req.body.career_id ?? currentUser.career_id ?? null,
        };

        const affectedRows = await updateUser( userId, profileData );

        if( !affectedRows ){
            return res.status( 200 ).json({
                success: true,
                message: 'User profile unchanged.',
                data:    currentUser,
            });
        }

        // Role-specific updates: student, intern, graduate
        try {
            const role = req.user?.role;

            if( role === 'student' ){
                if( req.body.semester !== undefined ){
                    await updateStudent( userId, { semester: req.body.semester } );
                }
            } else if( role === 'intern' ){
                // Pass through whatever fields are present; model will handle nulls
                await updateIntern( userId, {
                    hostCompany: req.body.hostCompany,
                    project:     req.body.project,
                    endDate:     req.body.endDate,
                } );
            } else if( role === 'graduate' ){
                if( req.body.currentJob !== undefined ){
                    await updateGraduate( userId, { currentJob: req.body.currentJob } );
                }
            }
        } catch( roleErr ){
            // Forward role-specific update errors to the centralized error handler
            return next( roleErr );
        }

        const updatedUser = await findById( userId );

        res.status( 200 ).json({
            success: true,
            message: 'User profile update succesfully.',
            data:    updatedUser,
        });

    }catch( err ){ next( err ); }

}


// POST /api/users/cv
// Saves the uploaded CV file path to the user's profile.
async function updateMyCv( req, res, next ){

    try{

        const userId = req.user.id;
        
        // req.file.path is set by the multe .distkStorage in upploadMiddlewares.js
        const cvUrl = req.file?.path ?? null;

        if( !cvUrl ){
            const err      = new Error( 'CV file is required' );
            err.statusCode = 400;
            return next( err ); 
        }

        // Verify actual file content, not just the client-supplied MIME
        // type accepted by the multer fileFilter. See backend audit C5.
        if( !_isRealPdf( cvUrl ) ){

            fs.unlinkSync( cvUrl );

            const err      = new Error( 'The uploaded file is not a valid PDF.' );
            err.statusCode = 400;
            return next( err );

        }

        await updateCvUrl( userId, cvUrl );
        
        const updateUser = await findById( userId );

        res.status( 200 ).json({
            success: true,
            message: 'CV uploaded succesfully.',
            data: updateUser,

        });

    }catch( err ){ next( err ); }

}

// POST /api/users/roll-me
// Sends the authenticades user's CV to a company via email and logs the application
async function rollMeToCompany( req, res, next ) {

    try{

        const userId = req.user.id;
        const { jobPostingId } = req.body;

        // Load fresh user data to get cv_url
        const user = await findById( userId );

        if( !user.cv_url ){
            const err      = new Error( 'You must upload a CV before applying.' );
            err.statusCode = 400;
            return next( err );
        }

        // Validate jobPosting exist and is approved
        const posting = await findJobPostingById( jobPostingId );

        if( !posting ){
            const err      = new Error( 'Job posting not found.' );
            err.statusCode = 404;
            return next( err );
        }

        if( posting.jb_pst_approval_status !== 'approved' ){
            const err      = new Error( 'Cannot apply to a job posting that is not approved.' );
            err.statusCode = 400;
            return next( err );
        }

        const company = await findCompanyByUserId( posting.jb_pst_id_company );

        if( !company ){
            const err      = new Error( 'Company not found.' );
            err.statusCode = 404;
            return next( err );
        }

        if( !company.cmp_contact_email ){
            const err      = new Error( 'Company contact email is not available.' );
            err.statusCode = 400;
            return next( err );
        }

        // Prevent duplicate applications
        const existing = await findApplicationByUserAndJobPosting( userId, jobPostingId );

        if( existing ){
            const err      = new Error( 'You have already applied to this job posting.' );
            err.statusCode = 409;
            return next( err );
        }

        // Log the application first, then send the email
        const applicationId = await createApplication( userId, jobPostingId );

        try {
            await sendRollMeEmail({
                to:                company.cmp_contact_email,
                companyName:       company.cmp_name,
                studentName:       user.email,
                announcementTitle: posting.jb_pst_job_title ?? 'Job posting #${ jobPostingId }', 
                cvPath:            user.cv_url, 
            });
        } catch( sendErr ){

            // Rollback the application record since the email failed to send
            await deleteApplication( applicationId );

            const err = new Error('Your CV could not be sent to the company. Please try again.');
            err.statusCode = 502;
            return next( err );

        }

        res.status( 201 ).json({
            success: true,
            message: 'Application submitted and CV sent to company successfully.',
            data: {
                applicationId,
                jobPostingId,
            },
        });

    }catch( err ){ next( err ); }
    
}

export { 
    getMyProfile,
    updateMyProfile,
    updateMyCv,
    rollMeToCompany,
 };