import { Router } from 'express';
import { body } from 'express-validator';

import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validateRequest.js';

import {
    createJobPosting,
    getAllJobPostings,
    getJobPostingById,
    getMyCompanyJobPostings,
    updateJobPosting,
    getPendingJobPostings,
    updateJobPostingApproval,
} from '../controllers/jobPostingController.js';

const router = Router();

const jobPostingBodyValidation = [
    body('jb_pst_job_title')
        .notEmpty()
        .withMessage('Job title is required.')
        .isLength({ max: 100 })
        .withMessage('Job title must not exceed 100 characters.')
        .trim(),

    body('jb_pst_requirements')
        .notEmpty()
        .withMessage('Requirements are required.')
        .trim(),

    body('jb_pst_benefits')
        .optional({ nullable: true, checkFalsy: true })
        .trim(),

    body('jb_pst_modality')
        .notEmpty()
        .withMessage('Modality is required.')
        .isIn(['remote', 'on-site', 'hybrid'])
        .withMessage('Modality must be remote, on-site or hybrid.'),

    body('jb_pst_schedule')
        .notEmpty()
        .withMessage('Schedule is required.')
        .trim(),

    body('jb_pst_contract_type')
        .notEmpty()
        .withMessage('Contract type is required.')
        .isIn(['full-time', 'part-time', 'internship', 'freelance'])
        .withMessage('Invalid contract type.'),

    body('jb_pst_experience_level')
        .notEmpty()
        .withMessage('Experience level is required.')
        .isIn(['junior', 'mid', 'senior'])
        .withMessage('Invalid experience level.'),

    body('jb_pst_publication_date')
        .optional({ nullable: true, checkFalsy: true })
        .isISO8601()
        .withMessage('Publication date must be a valid date (YYYY-MM-DD).'),

    body('jb_pst_expiration_date')
        .notEmpty()
        .withMessage('Expiration date is required.')
        .isISO8601()
        .withMessage('Expiration date must be a valid date (YYYY-MM-DD).'),

    body('jb_pst_salary')
        .optional({ nullable: true, checkFalsy: true })
        .isFloat({ min: 0 })
        .withMessage('Salary must be a positive number.')
        .toFloat(),

    body('jb_pst_image_url')
        .optional({ nullable: true, checkFalsy: true })
        .isURL()
        .withMessage('Image URL must be a valid URL.'),

    body('careerIds.*')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Each careerId must be a valid integer.')
        .toInt(),
];

const approvalBodyValidation = [
    body('status')
        .isIn(['approved', 'rejected', 'pending'])
        .withMessage('Status must be approved, rejected or pending'),

    body('reason')
        .if(body('status').equals('rejected'))
        .notEmpty()
        .withMessage('A rejection reason is required when status is rejected.')
        .trim(),
];

// Public route: list all job postings
router.get(
    '/',
    getAllJobPostings
);

// Authenticated routes
router.post(
    '/',
    authMiddleware,
    jobPostingBodyValidation,
    validate,
    createJobPosting
);

router.get(
    '/company/me',
    authMiddleware,
    getMyCompanyJobPostings
);

router.get(
    '/pending',
    authMiddleware,
    getPendingJobPostings
);

router.patch(
    '/:id/approval',
    authMiddleware,
    approvalBodyValidation,
    validate,
    updateJobPostingApproval
);

router.put(
    '/:id',
    authMiddleware,
    jobPostingBodyValidation,
    validate,
    updateJobPosting
);

// Public route: must be declared after /pending so "pending" is not treated as an id.
router.get(
    '/:id',
    getJobPostingById
);

export default router;
