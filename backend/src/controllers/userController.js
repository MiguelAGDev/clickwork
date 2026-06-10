// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Controller for user profile endpoints.
//      Handles authenticated user profile retrieval,
//      profile update and CV upload/update.
//
// Date: June 9th 2026

import { findById, update, updateCvUrl } from '../models/userModel.js';
import { findJobPostingById } from '../models/jobPostingModel.js';
import { findCompanyByUserId } from '../models/companyModel.js';
import {
    createApplication,
    findApplicationByUserAndJobPosting,
} from '../models/applicationModel.js';
import { sendRollMeEmail } from '../services/emailService.js';

function getAuthenticatedUserId(req){
    return req.user?.id || req.userId;
}

async function getMyProfile(req,res,next) {
    try{
        const userId = getAuthenticatedUserId(req);
        if(!userId){
            const err = new Error('Authenticated user not found');
            err.statusCode = 401;
            return next(err);
        }
        const user = await findById(userId);
        if(!user){
            const err = new Error('User not found');
            err.statusCode = 404;
            return next(err);
        }
        res.status(200).json({
            success:true,
            data: user,
        });

    }catch(err){
        next(err);
    }
}
async function getByUserId(req,res,next) {
    try{
        const {id}= req.params;
        const user = await findById(id);
        if(!user){
            const err = new Error ('User not found');
            err.statusCode = 404;
            return next (err);
        }
        res.status(200).json({
            success:true,
            data:user,
        });
    }catch(err){
        next(err);
    }  
}

async function updateMyProfile(req,res,next){
    try{
        const userId = getAuthenticatedUserId(req);
        if(!userId){
            const err = new Error('Authenticated user not found');
            err.statusCode = 401;
            return next (err);
        }
        const currentUser = await findById(userId);

        if (!currentUser) {
            const err = new Error('User not found');
            err.statusCode = 404;
            return next(err);
        }
        const profileData = {
            phone: req.body.phone ?? currentUser.phone ?? null,
            careerId: req.body.careerId ?? currentUser.career_id ?? null,
        };

        const affectedRows = await update(userId, profileData);

        if (affectedRows === 0) {
            const unchangedUser = await findById(userId);

            return res.status(200).json({
                success: true,
                message: 'User profile unchanged',
                data: unchangedUser,
            });
        }

        const updatedUser = await findById(userId);

        res.status(200).json({
            success: true,
            message: 'User profile updated successfully',
            data: updatedUser,
        });
    }catch(err){
        next(err);
    }
}   
async function updateMyCv(req, res, next) {
    try {
        const userId = getAuthenticatedUserId(req);

        if (!userId) {
            const err = new Error('Authenticated user not found');
            err.statusCode = 401;
            return next(err);
        }

        const cvUrl =
            req.file?.location ||
            req.file?.path ||
            req.body.cvUrl;

        if (!cvUrl) {
            const err = new Error('CV file or cvUrl is required');
            err.statusCode = 400;
            return next(err);
        }

       const affectedRows = await updateCvUrl(userId, cvUrl);

        if (affectedRows === 0) {
            const err = new Error('User not found');
            err.statusCode = 404;
            return next(err);
        }

        const updatedUser = await findById(userId);

        res.status(200).json({
            success: true,
            message: 'CV updated successfully',
            data: updatedUser,
        });
    } catch (err) {
        next(err);
    }
}

async function rollMeToCompany(req, res, next) {
    try {
        const userId = getAuthenticatedUserId(req);

        if (!userId) {
            const err = new Error('Authenticated user not found');
            err.statusCode = 401;
            return next(err);
        }

        const { jobPostingId, subject, message } = req.body;

        const user = await findById(userId);

        if (!user) {
            const err = new Error('User not found');
            err.statusCode = 404;
            return next(err);
        }

        if (!user.resume_url) {
            const err = new Error('User must upload a CV before applying');
            err.statusCode = 400;
            return next(err);
        }

        const posting = await findJobPostingById(jobPostingId);

        if (!posting) {
            const err = new Error('Job posting not found');
            err.statusCode = 404;
            return next(err);
        }

        if (
            posting.jb_pst_approval_status &&
            posting.jb_pst_approval_status !== 'approved'
        ) {
            const err = new Error('Cannot apply to a job posting that is not approved');
            err.statusCode = 400;
            return next(err);
        }

        const company = await findCompanyByUserId(posting.jb_pst_id_company);

        if (!company) {
            const err = new Error('Company not found');
            err.statusCode = 404;
            return next(err);
        }

        const companyEmail = company.cmp_contact_email;

        if (!companyEmail) {
            const err = new Error('Company contact email not available');
            err.statusCode = 400;
            return next(err);
        }

        const existingApplication = await findApplicationByUserAndJobPosting(
            userId,
            jobPostingId
        );

        if (existingApplication) {
            const err = new Error('User has already applied to this job posting');
            err.statusCode = 409;
            return next(err);
        }

        const applicationId = await createApplication(userId, jobPostingId);
        const jobTitle = posting.jb_pst_job_title || `Job posting #${jobPostingId}`;

        await sendRollMeEmail({
            to: companyEmail,
            companyName: company.cmp_name,
            studentName: user.email,
            studentEmail: user.email,
            studentPhone: user.phone,
            studentCareer: user.career_name,
            announcementTitle: jobTitle,
            cvPath: user.resume_url,
            subject,
            message,
        });

        res.status(201).json({
            success: true,
            message: 'Application submitted and email sent to company successfully',
            data: {
                applicationId,
                jobPostingId,
                companyEmail,
            },
        });
    } catch (err) {
        return next(err);
    }
}

/*
|--------------------------------------------------------------------------
| Export controller methods
|--------------------------------------------------------------------------
*/
export {
    getMyProfile,
    getByUserId,
    updateMyProfile,
    updateMyCv,
    rollMeToCompany,
};
