// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Routes module for company management.
//      Defines endpoints related to:
//          - Company registration
//          - Retrieving authenticated company data
//          - Updating company information
//          - Viewing pending companies
//          - Updating company approval status
//
// Date: May 17th 2026

// Import Router from Express
import { Router } from 'express';

// Import validation methods from express-validator
import { body } from 'express-validator';

// Import custom validation middleware
import { validate } from '../middlewares/validateRequest.js';

// Import controller functions
import {
    createCompany,
    getMyCompany,
    updateMyCompany,
    getPendingCompanies,
    updateCompanyApproval,
} from '../controllers/companyController.js';

// Create router instance
const router = Router();

/*
|--------------------------------------------------------------------------
| Company Body Validation Rules
|--------------------------------------------------------------------------
| Validates company registration and update requests.
|
| Fields validated:
|   - cmp_name
|   - cmp_size
|   - cmp_industry
|   - cmp_city
|   - cmp_state
|   - cmp_address
|   - cmp_contact_email
*/
const companyBodyValidation = [

    /*
    |--------------------------------------------------------------------------
    | Company Name Validation
    |--------------------------------------------------------------------------
    */
    body('cmp_name')

        // Field cannot be empty
        .notEmpty()
        .withMessage('Company name is required')

        // Maximum allowed length
        .isLength({ max: 100 })
        .withMessage('Company name must not exceed 100 characters.')

        // Remove extra spaces
        .trim(),

    /*
    |--------------------------------------------------------------------------
    | Company Size Validation
    |--------------------------------------------------------------------------
    */
    body('cmp_size')

        // Field cannot be empty
        .notEmpty()
        .withMessage('Company size is required')

        // Allowed values
        .isIn(['micro', 'pequeña', 'mediana', 'grande'])
        .withMessage('Invalid company size'),

    /*
    |--------------------------------------------------------------------------
    | Industry Validation
    |--------------------------------------------------------------------------
    */
    body('cmp_idustry')

        // Field cannot be empty
        .notEmpty()
        .withMessage('Industry is required')

        // Remove extra spaces
        .trim(),

    /*
    |--------------------------------------------------------------------------
    | City Validation
    |--------------------------------------------------------------------------
    */
    body('cmp_city')

        // Field cannot be empty
        .notEmpty()
        .withMessage('City is required')

        // Remove extra spaces
        .trim(),

    /*
    |--------------------------------------------------------------------------
    | State Validation
    |--------------------------------------------------------------------------
    */
    body('cmp_state')

        // Field cannot be empty
        .notEmpty()
        .withMessage('State is required')

        // Remove extra spaces
        .trim(),

    /*
    |--------------------------------------------------------------------------
    | Address Validation
    |--------------------------------------------------------------------------
    */
    body('cmp_address')

        // Field cannot be empty
        .notEmpty()
        .withMessage('Address is required')

        // Remove extra spaces
        .trim(),

    /*
    |--------------------------------------------------------------------------
    | Contact Email Validation
    |--------------------------------------------------------------------------
    */
    body('cmp_contact_email')

        // Validate email format
        .isEmail()
        .withMessage('A valid contact email is required.')

        // Normalize email format
        .normalizeEmail(),
];

/*
|--------------------------------------------------------------------------
| Approval Body Validation Rules
|--------------------------------------------------------------------------
| Validates approval status updates for companies.
|
| Fields validated:
|   - status
|   - reason
*/
const approvalBodyVlidation = [

    /*
    |--------------------------------------------------------------------------
    | Status Validation
    |--------------------------------------------------------------------------
    */
    body('status')

        // Allowed approval statuses
        .isIn(['approved', 'rejected', 'pending'])
        .withMessage('Status must be approved, rejected or pending'),

    /*
    |--------------------------------------------------------------------------
    | Rejection Reason Validation
    |--------------------------------------------------------------------------
    | Required only when status = rejected
    */
    body('reason')

        // Conditional validation
        .if(body('status').equals('rejected'))

        // Reason is mandatory for rejection
        .notEmpty()
        .withMessage('A rejection reason is required when status is rejected')

        // Remove extra spaces
        .trim(),
];

/*
|--------------------------------------------------------------------------
| POST /
|--------------------------------------------------------------------------
| Creates a new company profile.
|
| Endpoint:
|   POST /api/company
*/
router.post(
     '/',
    // Validation rules
    companyBodyValidation,

    // Validation middleware
    validate,

    // Controller function
    createCompany
);

/*
|--------------------------------------------------------------------------
| GET /me
|--------------------------------------------------------------------------
| Returns company information associated with the authenticated user.
|
| Endpoint:
|   GET /api/company/me
*/
router.get(

    '/me',

    // Controller function
    getMyCompany
);

/*
|--------------------------------------------------------------------------
| PUT /me
|--------------------------------------------------------------------------
| Updates authenticated user's company information.
|
| Endpoint:
|   PUT /api/company/me
*/
router.put(

    '/me',

    // Validation rules
    companyBodyValidation,

    // Validation middleware
    validate,

    // Controller function
    updateMyCompany
);

/*
|--------------------------------------------------------------------------
| GET /pending
|--------------------------------------------------------------------------
| Returns all companies with pending approval status.
|
| Endpoint:
|   GET /api/company/pending
*/
router.get(

    '/pending',

    // Controller function
    getPendingCompanies
);

/*
|--------------------------------------------------------------------------
| PATCH /userId/approval
|--------------------------------------------------------------------------
| Updates approval status for a company.
|
| Endpoint:
|   PATCH /api/company/:userId/approval
|
| Body Example:
|   {
|      "status": "approved"
|   }
|
|   {
|      "status": "rejected",
|      "reason": "Incomplete documentation"
|   }
*/
router.patch(

    '/:userId/approval',

    // Validation rules
    approvalBodyVlidation,

    // Validation middleware
    validate,

    // Controller function
    updateCompanyApproval
);

// Export router module
export default router;