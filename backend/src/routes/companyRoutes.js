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
import { validate } from '../middlewares/validateRequest.js';

// Import controller functions
import {
    createCompany,
    getMyCompany,
    updateMyCompany,
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

// NOTE: company approval listing/updates moved exclusively to /api/admin/companies/*
// (adminRoutes.js), which correctly gates them behind roleMiddleware('admin').
// Do not re-add /pending or /:userId/approval here — see backend audit C2.

// Export router module
export default router;