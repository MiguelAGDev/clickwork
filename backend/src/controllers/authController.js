// Authors: 
//      * Azucena Rodriguez Flores  
//      * Miguel Angel Avila Garcia
// Description: Auth controller — thin HTTP layer for register, login, and email verification.
//              Reads req, calls authService, writes res, forwards errors with next(err).
//              No business logic lives here.
// Date: May 8th 2026
 
// Latest Update:
// Date:
// By:

import { register, login, verifyEmail } from '../services/authService.js';

// POST /api/auth/register
async function registerHandler( req, res, next ) {

    try{
        
        await register(req.body);
        
        res.status(201).json({
            success: true,
            message: 'Account created. Please check your inbox to verify your email.',
        });

    }catch( err ){ next(err); }
    
}

// POST /api/auth/login
async function loginHandler( req, res, next ) {

    try{

        const { email, password } = req.body;
        const result = await login( email, password );

        res.status(201).json({
            success: true,
            ...result,

        });

    }catch( err ){ next(err); }
    
}

// GET /api/auth/verify/:token
async function verifyEmailHandler( req, res, next ) {

    try{

        await verifyEmail( req.params.token );

        res.status(201).json({
            success: true,
            message: 'Email verified successfully. You can now log in.',
        });

    }catch( err ){ next( err ); }
    
}


export { registerHandler, loginHandler, verifyEmailHandler };