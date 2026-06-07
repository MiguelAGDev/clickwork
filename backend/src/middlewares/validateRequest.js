// Authors: 
//      * Azucena Rodriguez Flores  
//      * Miguel Angel Avila Garcia
// Description: Generic validation middleware for express-validator
// Date: May 18th 2026

import { validationResult } from 'express-validator';

/**
 * Generic validation middleware.
 * Checks for validation errors and returns a clean JSON response.
 * Must be placed after validation chain middleware in routes. 
 */
export function validate(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array(),
        });
    }

    next();
}
