// Authors: 
//      * Azucena Rodriguez Flores  
//      * Miguel Angel Avila Garcia
// Description: Auth routes — wires POST /api/auth/register, POST /api/auth/login,
//              and GET /api/auth/verify/:token. Validates input with express-validator
//              before the request reaches the controller.
// Date: April 28th 2026
 
// Latest Update: Implemented all three routes with validation.
// Date: May 8th 2026
// By: Miguel Angel Avila Garcia


import { Router }           from 'express';
import { body }             from 'express-validator';
import { validate }         from '../middlewares/validateRequest.js';

import {

    registerHandler,
    loginHandler,
    verifyEmailHandler,

} from '../controllers/authController.js';

const router = Router();

// POST /api/auth/register
router.post(

    // /register/[informacion]


    '/register', 
    [
        body('email')
            .isEmail()
            .withMessage('A valid email addres is required')
            .normalizeEmail(),

        body('password')
            .isLength({min: 8})
            .withMessage('Pasword must be at least 8 characteres.')
            .matches(/[A-Z]/)
            .withMessage('Password must contain at least one uppercase letter.')
            .matches(/[0-9]/)
            .withMessage('Pasword must contain at least one number.'),

        body('phone')
            .optional( {nullable: true, checkFalsy: true} )
            .isMobilePhone()
            .withMessage('Invalid phone number.'),

        body('careerId')
            .optional({nullable: true, checkFalsy: true})
            .isInt({min: 1})
            .withMessage('Select a valid career.')
            .toInt(),

        body('role')
            .isIn( [ 'student', 'intern', 'graduate', 'company' ] )
            .withMessage('Invalid role. Insert a valid role.'),

        // STUDENT-only fields
        body('semester').if(body('role').equals('student'))
            .notEmpty().withMessage('Semester is required.')
            .isInt({min : 1, max: 12}).withMessage('Insert a valid semester (1-12).')
            .toInt(),

        body('stdId').if(body('role').equals('student'))
            .notEmpty().withMessage('stdId is required for students.')
            .isString().trim(),

        // INTERN-only fields
        body('startDate').if(body('role').equals('intern'))
            .optional({nullable: true, checkFalsy: true})
            .isISO8601().withMessage('Start Date must be a valid date (YYYY-MM-DD).'),

        body('endDate').if(body('role').equals('intern'))
            .optional({nullable: true, checkFalsy: true})
            .isISO8601().withMessage('End Date must be a valid date (YYYY-MM-DD).'),

        // GRADAUTE-only fields
        body('graduationYear').if(body('role').equals('graduate'))
            .notEmpty().withMessage('Graduation Year is required for graduates.')
            .isInt({ min: 1965, max: new Date().getFullYear() })
            .withMessage('Graduation must be a valid year.')
            .toInt(),
            

    ],
    validate,
    registerHandler,

);

// POST /api/auth/login
router.post(

    '/login',
    [
        body('email')
            .isEmail()
            .withMessage('A valid email addres is required.')
            .normalizeEmail(),

        body('password')
            .notEmpty()
            .withMessage('Password is required.'),

    ],

    validate,
    loginHandler,
);

// GET  /api/auth/verify/:token
router.get( '/verify/:token', verifyEmailHandler );

export default router;