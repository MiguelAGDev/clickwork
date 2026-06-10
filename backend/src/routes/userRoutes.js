// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Routes module for user profile management.
//      Defines endpoints related to:
//          - Viewing authenticated user's profile
//          - Updating authenticated user's profile
//          - Uploading/updating authenticated user's CV
//          - Viewing authenticated user's role information
//
// Date: June 9th 2026

// Import Router from Express
import { Router } from 'express';

// Import validation utilities from express-validator
import { body } from 'express-validator';

// Import authentication middleware
import { authMiddleware } from '../middlewares/authMiddleware.js';

// Import custom middleware for validation handling
import { validate } from '../middlewares/validateRequest.js';

// Import controller methods
import {
    getMyProfile,
    updateMyProfile,
    updateMyCv,
    rollMeToCompany,
} from '../controllers/userController.js';

// Create Express router instance
const router = Router();

/*
|--------------------------------------------------------------------------
| Validation Rules
|--------------------------------------------------------------------------
*/

// Validation for updating authenticated user's profile
const userProfileBodyValidation = [
    body('phone')
        .optional({ nullable: true, checkFalsy: true })
        .isLength({ max: 20 })
        .withMessage('Phone must not exceed 20 characters')
        .trim(),

    body('careerId')
        .optional({ nullable: true, checkFalsy: true })
        .isInt({ min: 1 })
        .withMessage('careerId must be a valid integer')
        .toInt(),
];

// Validation for updating authenticated user's CV
const userCvBodyValidation = [
    body('cvUrl')
        .optional({ nullable: true, checkFalsy: true })
        .isLength({ max: 500 })
        .withMessage('cvUrl must not exceed 500 characters')
        .trim(),
];

const rollMeBodyValidation = [
    body('jobPostingId')
        .notEmpty()
        .withMessage('jobPostingId is required')
        .isInt({ min: 1 })
        .withMessage('jobPostingId must be a valid positive integer')
        .toInt(),

    body('subject')
        .optional({ nullable: true, checkFalsy: true })
        .isLength({ max: 150 })
        .withMessage('subject must not exceed 150 characters')
        .trim(),

    body('message')
        .optional({ nullable: true, checkFalsy: true })
        .isLength({ max: 2000 })
        .withMessage('message must not exceed 2000 characters')
        .trim(),
];

/*
|--------------------------------------------------------------------------
| GET /me
|--------------------------------------------------------------------------
| Returns the authenticated user's profile.
|
| Endpoint:
|   GET /api/users/me
*/
router.get(
    '/me',
    authMiddleware,
    getMyProfile
);

/*
|--------------------------------------------------------------------------
| PUT /me
|--------------------------------------------------------------------------
| Updates the authenticated user's editable profile information.
|
| Endpoint:
|   PUT /api/users/me
|
| Body:
|   {
|      "phone": string,
|      "careerId": number
|   }
*/
router.put(
    '/me',
    authMiddleware,
    userProfileBodyValidation,
    validate,
    updateMyProfile
);

/*
|--------------------------------------------------------------------------
| POST /cv
|--------------------------------------------------------------------------
| Uploads or updates the authenticated user's CV.
|
| Endpoint:
|   POST /api/users/cv
|
| Body without file upload:
|   {
|      "cvUrl": string
|   }
|
| Note:
|   If Multer is used, the controller can receive the uploaded file
|   through req.file.
*/
router.post(
    '/cv',
    authMiddleware,
    userCvBodyValidation,
    validate,
    updateMyCv
);

/*
|--------------------------------------------------------------------------
| POST /roll-me
|--------------------------------------------------------------------------
| Sends the authenticated user's CV to the company for a job posting.
|
| Endpoint:
|   POST /api/users/roll-me
*/
router.post(
    '/roll-me',
    authMiddleware,
    rollMeBodyValidation,
    validate,
    rollMeToCompany
);

// Export router module
export default router;
