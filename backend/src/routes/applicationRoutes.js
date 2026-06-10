// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Routes module for job applications.
//      Defines endpoints related to:
//          - Applying to a job posting
//          - Viewing authenticated user's applications
//          - Viewing applications by job posting
//
// Date: May 17th 2026

// Import Router from Express
import { Router } from 'express';

// Import validation utilities from express-validator
import { body, param } from 'express-validator';

// Import authentication middleware
import { authMiddleware } from '../middlewares/authMiddleware.js';

// Import custom middleware for validation handling
import { validate } from '../middlewares/validate.js';

// Import controller methods
import {
    applyToJob,
    getMyApplications,
    getApplicationsByJobPosting,
} from '../controllers/applicationsController.js';

// Create Express router instance
const router = Router();

/*
|--------------------------------------------------------------------------
| Validation Rules
|--------------------------------------------------------------------------
*/
const applicationBodyValidation = [
    body('job_posting_id')
        .notEmpty()
        .withMessage('job_posting_id is required')
        .isInt({ min: 1 })
        .withMessage('job_posting_id must be a valid integer')
        .toInt(),
];

const jobPostingParamValidation = [
    param('jobPostingId')
        .isInt({ min: 1 })
        .withMessage('jobPostingId must be a valid integer')
        .toInt(),
];

/*
|--------------------------------------------------------------------------
| POST /
|--------------------------------------------------------------------------
| Registers a new application for the authenticated user.
|
| Endpoint:
|   POST /api/applications
|
| Body:
|   {
|      "job_posting_id": number
|   }
*/
router.post(
    '/',
    authMiddleware,
    applicationBodyValidation,
    validate,
    applyToJob
);

/*
|--------------------------------------------------------------------------
| GET /me
|--------------------------------------------------------------------------
| Returns all applications made by the authenticated user.
|
| Endpoint:
|   GET /api/applications/me
*/
router.get(
    '/me',
    authMiddleware,
    getMyApplications
);

/*
|--------------------------------------------------------------------------
| GET /job-posting/:jobPostingId
|--------------------------------------------------------------------------
| Returns applications related to a specific job posting.
|
| Route Parameter:
|   jobPostingId -> ID of the job posting
|
| Example:
|   /api/applications/job-posting/5
*/
router.get(
    '/job-posting/:jobPostingId',
    authMiddleware,
    jobPostingParamValidation,
    validate,
    getApplicationsByJobPosting
);

/*
|--------------------------------------------------------------------------
| GET /company/applicants/:jobPostingId
|--------------------------------------------------------------------------
| Returns applicants for a company job posting.
| Intended for company owners or recruiters.
|
| Route Parameter:
|   jobPostingId -> ID of the job posting
|
| Example:
|   /api/applications/company/applicants/5
*/
router.get(
    '/company/applicants/:jobPostingId',
    authMiddleware,
    jobPostingParamValidation,
    validate,
    getApplicationsByJobPosting
);

// Export router module
export default router;
