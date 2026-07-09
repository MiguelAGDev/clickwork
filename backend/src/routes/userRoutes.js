// Authors: 
//      * Azucena Rodriguez Flores  
//      * Miguel Angel Avila Garcia
// Description: 
// Date: June 25th 2026

// Lastest Update:
// Date:
// By: 

import { Router } from 'express';
import { body }   from 'express-validator';

import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validate }       from '../middlewares/validateRequest.js';
import { uploadCv }       from '../middlewares/uploadMiddlewares.js';

import { 
    getMyProfile,
    updateMyProfile,
    updateMyCv,
    rollMeToCompany
} from '../controllers/userController.js';

const router = Router();

// Validación para PUT /me
const userProfileBodyValidation = [
    body('phone')
        .optional({ nullable: true, checkFalsy: true })
        .isLength({ max: 20 })
        .withMessage('Phone must not exceed 20 characters.')
        .trim(),

    body('careerId')
        .optional({ nullable: true, checkFalsy: true })
        .isInt({ min: 1 })
        .withMessage('careerId must be a valid integer.')
        .toInt(),

    // Role-specific fields: student, intern, graduate
    body('semester')
        .if((value, { req }) => req.user?.role === 'student')
        .optional({ nullable: true, checkFalsy: true })
        .isInt({ min: 1, max: 12 }).withMessage('Semester must be a valid integer (1-12).')
        .toInt(),

    body('hostCompany')
        .if((value, { req }) => req.user?.role === 'intern')
        .optional({ nullable: true, checkFalsy: true })
        .isString().trim(),

    body('project')
        .if((value, { req }) => req.user?.role === 'intern')
        .optional({ nullable: true, checkFalsy: true })
        .isString().trim(),

    body('endDate')
        .if((value, { req }) => req.user?.role === 'intern')
        .optional({ nullable: true, checkFalsy: true })
        .isISO8601().withMessage('End Date must be a valid date (YYYY-MM-DD).'),

    body('currentJob')
        .if((value, { req }) => req.user?.role === 'graduate')
        .optional({ nullable: true, checkFalsy: true })
        .isString().trim(),
];

// Validación para POST /roll-me
const rollMeBodyValidation = [
    body('jobPostingId')
        .notEmpty()
        .withMessage('jobPostingId is required.')
        .isInt({ min: 1 })
        .withMessage('jobPostingId must be a valid positive integer.')
        .toInt(),
];

// GET /me
router.get('/me', authMiddleware, getMyProfile);

// PUT /me
router.put(
    '/me',
    authMiddleware,
    userProfileBodyValidation,
    validate,
    updateMyProfile
);

// POST /cv
router.post('/cv', authMiddleware, uploadCv, updateMyCv);

// POST /roll-me
router.post(
    '/roll-me',
    authMiddleware,
    rollMeBodyValidation,
    validate,
    rollMeToCompany
);

export default router;
