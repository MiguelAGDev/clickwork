// Authors: 
//      * Azucena Rodriguez Flores  
//      * Miguel Angel Avila Garcia
// Description: Auth controller — thin HTTP layer for register, login, and email verification.
//              Reads req, calls authService, writes res, forwards errors with next(err).
//              No business logic lives here.
// Date: May 8th 2026
 
// Latest Update: Add forgotPasswordHandler, resetPasswordHandler and resendVerificationEmailHandler
// Date: September 2nd 2026
// By: Miguel Angel Avila Garcia

import { 
    register, 
    login, 
    verifyEmail,
    resendVerificationEmail,
    forgotPassword,
    resetPassword 
} from '../services/authService.js';

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

        res.status(200).json({
            success: true,
            ...result,

        });

    }catch( err ){ next(err); }
    
}

// GET /api/auth/verify/:token
async function verifyEmailHandler( req, res, next ) {

    try{

        await verifyEmail( req.params.token );

        res.status(200).json({
            success: true,
            message: 'Email verified successfully. You can now log in.',
        });

    }catch( err ){ next( err ); }
    
}

// POST /api/auth/resend-verification
async function resendVerificationEmailHandler( req, res, next ){

    try{

        await resendVerificationEmail( req.body.email );

        // Same generic response to avoid leaking which emails are registered
        res.status(200).json({
            success: true,
            message: 'A verification email has been sent. Please check your inbox.',
        });

    }catch( err ){ next( err ); }

}


// POST api/auth/forgot-password
async function forgotPasswordHandler( req, res, next ){

    try {

        await forgotPassword( req.body.email );

        // Always return the same response ( exist or not)
        // avoids leaking wich email are registered 
        res.status( 200 ).json({
            success: true,
            message: 'A password reset link has been sent.'
        });


    } catch ( err ) { next( err ); }

}

// POST api/auth/reset-password/:token
async function resetPasswordHandler( req, res, next ){

    try {

        await resetPassword( req.params.token, req.body.password );

        res.status( 200 ).json({
            success: true,
            message: 'Password has been reset succesfully. You can now log in'
        });
        
    } catch ( err ) { next( err ); }

}

export { 
    registerHandler, 
    loginHandler, 
    verifyEmailHandler,
    forgotPasswordHandler,
    resendVerificationEmailHandler,
    resetPasswordHandler
};

