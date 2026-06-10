// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
// Description: Auth middleware — validates JWT token, checks user is active
//              and email is verified before allowing access to protected routes.
//              Populates req.user with fresh data from the database.
// Date: May 28th 2026
 
// Latest Update:
// Date:
// By:

import jwt          from  'jsonwebtoken';           // Library 'jsonwebtoken' for creating and verifying JWT tokens
import { findById } from '../models/userModel.js';  // Import function to know if user exist, it email is verified and active.


// Middleware function from express.
//      Executed before protected routes.
//      Parameters: 
//            *req: the request object.
//            *res: the response object.
//            *next: a function to move on to the next middleware or controller 

async function authMiddleware( req, res, next ) {

    try {
         
        //  1. Extract token from Authorization header
        const authHeader = req.headers.authorization;

        if ( !authHeader || !authHeader.startsWith('Bearer ') ){
            const err = new Error( 'No token provided' );
            err.statusCode = 401;
            throw err;
        }

        const token = authHeader.slice(7); // Remove 'Bearer ' prefix

        // 2. Verify JWT signature and expiration
        const decoded = jwt.verify( token, process.env.JWT_SECRET );
        // decoded = { id, email, role, permissions }
        // If token is valid or expired, jwt.verify throws - caught below

        // 3. Fetch fresh user data from DB
        const user = await findById( decoded.id );

        if (!user) {
            const err = new Error('User not found');
            err.statusCode = 401;
            throw err;
        }
        // 4. Check if account is active
        if ( !user.active ){ 
            const err = new Error( 'Your account has been deactived. Contact support.' );

            err.statusCode = 403;
            throw err;

        }

        // 5. Check if email is verified
        if ( !user.email_verified ){
            const err = new Error( 'Please verify your email before accessing this resource.' );
            err.statusCode = 403;
            throw err;
        }   

        // 6. Attach fresh user + role from token to req.user 
        req.user = {

            ...user,
            role:        decoded.role,
            permissions: decoded.permissions,

        };

        // 7. Continue to next middleware or controller
        next();

    } catch ( err ){

        // jwt.verify throws a JsonWebTokenError or TokenExpiredError
        if ( err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError' ){
            err.statusCode = 401;
            err.message    = 'Invalid or expired token' ;
        }

        next( err );

    }

}

export { authMiddleware };
    
