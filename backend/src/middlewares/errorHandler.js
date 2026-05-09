// Authors: 
//      * Azucena Rodriguez Flores  
//      * Miguel Angel Avila Garcia
// Description: Centrilizaed error handler middleware for the API
// Date: April 28th 2026

// Lastest Update:
// Date:
// By: 


/**
 * Centralized error handler middleware.
 * Catches errors thrown anywhere in the app and returns a clean JSON response.
 * Must be mounted LAST in index.js (after all routes).
 */
export async function errorHandler(err, req, res, next) {

    const status =  err.statusCode || err.status || 500;
    const message = err.message || 'Internal Server Error';

    if(process.env.NODE_ENV == 'development'){
        console.error( `[ERROR] ${status} - ${message}` );
        console.error( err.stack );
    }

    res.status(status).json({

        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && {stack : err.stack}), 

    });


}