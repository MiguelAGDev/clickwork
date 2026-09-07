// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
// Description: Admin routes — protects admin-only endpoints with auth and role checks.
// Date: June 29th 2026

import { Router } from 'express';
import { body } from 'express-validator';   
import { validate } from '../middlewares/validateRequest.js';

import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';

import {
    getPendingCompanies,
    updateCompanyApprovalStatus,
    getAllCompanies,
    getPendingJobPostings,
    updateJobPostingApprovalStatus,
    getAllUsers,
    toggleActiveUser,
} from '../controllers/adminController.js';

const router = Router();

// Validación para PATCH .../:id/approval (companies y job-postings)
const approvalBodyValidation = [
    body('status')
        .isIn(['pending', 'approved', 'rejected'])
        .withMessage("status must be one of 'pending', 'approved', 'rejected'."),

    body('reason')
        .optional({ nullable: true, checkFalsy: true })
        .isLength({ max: 255 })
        .withMessage('reason must not exceed 255 characters.'),
];

// Protect all admin routes
router.use(authMiddleware);
router.use(roleMiddleware('admin'));

// GET /api/admin/companies
router.get('/companies', getAllCompanies);

// GET /api/admin/companies/pending
router.get('/companies/pending', getPendingCompanies);

// PATCH /api/admin/companies/:id/approval
router.patch('/companies/:id/approval', approvalBodyValidation, validate, updateCompanyApprovalStatus);

// GET /api/admin/job-postings/pending
router.get('/job-postings/pending', getPendingJobPostings);

// PATCH /api/admin/job-postings/:id/approval
router.patch('/job-postings/:id/approval', approvalBodyValidation, validate, updateJobPostingApprovalStatus);

// GET /api/admin/users
router.get('/users', getAllUsers);

// PATCH /api/admin/users/:id/toggle-active
router.patch('/users/:id/toggle-active', toggleActiveUser);

export default router;
