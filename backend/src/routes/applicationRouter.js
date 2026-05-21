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
import { body } from 'express-validator';

// Import controller methods
import {
    applyToJob,
    getMyApplications,
    getMyApplicationByJobPosting
} from '../controllers/applicationsController.js';

// Import custom middleware for validation handling
import { validate } from '../middlewares/validate.js';

// Create Express router instance
const router = Router();

/*
|--------------------------------------------------------------------------
| Validation Rules
|--------------------------------------------------------------------------
| Validates the request body for job applications.
| Ensures:
|   - job_posting_id exists
|   - job_posting_id is a valid integer greater than 0
*/
const applicationBodyValidation = [

    // Validate job_posting_id field
    body('job_posting_id')

        // Check field is not empty
        .notEmpty()
        .withMessage('job_positng_id is required')

        // Check field is an integer >= 1
        .isInt({ min: 1 })
        .withMessage('job_positng_id must be a valid integer')

        // Convert value to integer
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

    // Apply validation rules
    applicationBodyValidation,

    // Execute validation middleware
    validate,

    // Controller function
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

    // Controller function
    getMyApplications
);

/*
|--------------------------------------------------------------------------
| GET /job-positng/:jobPostingId
|--------------------------------------------------------------------------
| Returns applications related to a specific job posting.
|
| Route Parameter:
|   jobPostingId -> ID of the job posting
|
| Example:
|   /api/applications/job-positng/5
*/
router.get(

    '/job-posting/:jobPostingId',

    // Controller function
    getMyApplicationByJobPosting
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

    // Controller function
    getMyApplicationByJobPosting
);

// Export router module
export default router;