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

// Import authentication middleware
import { authMiddleware } from '../middlewares/authMiddleware.js';

// Import custom validation middleware
import { validate } from '../middlewares/validate.js';

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
    body('cmp_name')
        .notEmpty()
        .withMessage('Company name is required')
        .isLength({ max: 100 })
        .withMessage('Company name must not exceed 100 characters.')
        .trim(),

    body('cmp_size')
        .notEmpty()
        .withMessage('Company size is required')
        .isIn(['micro', 'small', 'medium', 'large'])
        .withMessage('Invalid company size'),

    body('cmp_industry')
        .notEmpty()
        .withMessage('Industry is required')
        .trim(),

    body('cmp_city')
        .notEmpty()
        .withMessage('City is required')
        .trim(),

    body('cmp_state')
        .notEmpty()
        .withMessage('State is required')
        .trim(),

    body('cmp_address')
        .notEmpty()
        .withMessage('Address is required')
        .trim(),

    body('cmp_contact_email')
        .isEmail()
        .withMessage('A valid contact email is required.')
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
const approvalBodyValidation = [
    body('status')
        .isIn(['approved', 'rejected', 'pending'])
        .withMessage('Status must be approved, rejected or pending'),

    body('reason')
        .if(body('status').equals('rejected'))
        .notEmpty()
        .withMessage('A rejection reason is required when status is rejected')
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
    authMiddleware,
    companyBodyValidation,
    validate,
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
    authMiddleware,
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
    authMiddleware,
    companyBodyValidation,
    validate,
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
    authMiddleware,
    getPendingCompanies
);

/*
|--------------------------------------------------------------------------
| PATCH /:userId/approval
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
    authMiddleware,
    approvalBodyValidation,
    validate,
    updateCompanyApproval
);

// Export router module
export default router;
