// Authors: 
//      * Azucena Rodriguez Flores  
//      * Miguel Angel Avila Garcia
// Description: AuthServices - Handles user registration, login, and email verification.
//              Uses role-based permission system with bitmasks stored in role-specific tables.
//              Registration: creates app_user → role record → sets role permissions → sends verification email.
//              Login: detects role → retrieves permissions from role table → signs JWT.
// Date: May 6th 2026

// Latest Update:
// Date: June 7th 2026
// By: Miguel Angel Avila Garcia
// Changes: Implemented permission initialization during registration. Added _updatePermissions() method
//          to set permission bitmasks in role-specific columns (std_permissions, itn_permissions,
//          grd_permissions, cmp_permissions). Modified _getPermissions() to read from role-specific
//          tables instead of central permissions table. Ensures all users get correct permissions
//          immediately upon registration.


import bcryptjs    from 'bcryptjs';     // Library 'bcrypts' for hashing passwors securely 
import jwt         from 'jsonwebtoken'; // Library 'jsonwebtoken' for creating and verifying JWT tokens
import crypto      from 'crypto';       // Node.js built-in module for random values (tokens)

import { getConnection } from '../config/db.js';            // DB manual connection
import { sendVerificationEmail } from './emailService.js';  // Services to send confirmation email

// Import functions from user queries
import {
            create,
            findByEmail,
            findByToken,
            updateToken,
            verifyEmail as markEmailVerified 

        } from '../models/userModel.js';
        
// Import function from user queries
import { 
            createStudent,
            createIntern,
            createGraduate

        } from '../models/studentModel.js';

//  TO_DO: IMPORT companyModel.js

import {
            createCompany
        } from '../models/companyModel.js';

// Import permission bitmasks
import { ROLE_MASK } from '../config/permissions.js';


// How many bcrypt rounds to use when hashing passwords
const SALT_ROUND = 12;


// PRIVATE FUNCTIONS

// Wrapper function: acts like template for safe DB usage.
async function _borrowConnection(  ) { // The '_' in the begining mean -> function must no be export  

    // Get connection from db.js
    const conn = await getConnection();

    // Return object with two methods
    return {
        execute: ( sql, params ) => conn.execute( sql, params ),
        release: ()              => conn.release(),
    };
    
};


// Function: Update permission bitmask in role-specific table after role creation
async function _updatePermissions( userId, role ) {

    const { execute, release } = await _borrowConnection();

    try {
        switch (role) {
            case 'student':
                await execute(
                    'UPDATE student SET std_permissions = ? WHERE std_id_user = ?',
                    [ROLE_MASK.student, userId]
                );
                break;
            case 'intern':
                await execute(
                    'UPDATE intern SET itn_permissions = ? WHERE itn_id_user = ?',
                    [ROLE_MASK.intern, userId]
                );
                break;
            case 'graduate':
                await execute(
                    'UPDATE graduate SET grd_permissions = ? WHERE grd_id_user = ?',
                    [ROLE_MASK.graduate, userId]
                );
                break;
            case 'company':
                await execute(
                    'UPDATE company SET cmp_permissions = ? WHERE cmp_id_user = ?',
                    [ROLE_MASK.company, userId]
                );
                break;
        }
    } finally {
        release();
    }

}

// Function: Determines which role sub-tale user belons to.
async function _detectRole( userId ) {

    const { execute, release } = await _borrowConnection();

    try{

        const checks = [
            // First Check: does this user exist in company table?
            { role: 'company', sql: 'SELECT 1 FROM company WHERE cmp_id_user    = ? LIMIT 1' },
            
            // Second Check: does this user exist in student table?
            { role: 'student', sql: 'SELECT 1 FROM student WHERE std_id_user    = ? LIMIT 1' }, 

            // Third check: does this user exist in the intern table?
            { role: 'intern', sql: 'SELECT 1 FROM intern WHERE itn_id_user      = ? LIMIT 1' },

            // Fourth Check: does this user exist in the graduate table?
            { role: 'graduate', sql: 'SELECT 1 FROM graduate WHERE grd_id_user  = ? LIMIT 1' }
        
        ];

        for( const { role, sql } of checks ){
            const [ rows ] = await execute( sql, [userId] );
            if( rows.length > 0 ) return role;
        }

        return null;

    }finally{ release(); };
    
};

async function _getPermissions ( userId ) {

    const { execute, release } = await _borrowConnection();

    try{

        // First, detect the user's role
        const role = await _detectRole( userId );

        if (!role) {
            return 0; // No role found, return no permissions
        }

        // Based on role, query the appropriate permissions column from role-specific table
        let sql;

        switch (role) {
            case 'student':
                sql = 'SELECT std_permissions AS mask FROM student WHERE std_id_user = ? LIMIT 1';
                break;
            case 'intern':
                sql = 'SELECT itn_permissions AS mask FROM intern WHERE itn_id_user = ? LIMIT 1';
                break;
            case 'graduate':
                sql = 'SELECT grd_permissions AS mask FROM graduate WHERE grd_id_user = ? LIMIT 1';
                break;
            case 'company':
                sql = 'SELECT cmp_permissions AS mask FROM company WHERE cmp_id_user = ? LIMIT 1';
                break;
            default:
                return 0;
        }

        const [ rows ] = await execute( sql, [ userId ] );
        return rows[0]?.mask ?? 0;

    }finally{ release(); };
    
};


// PUBLIC FUNCTIONS

async function register ( body ) {

    // 1. Get the data from body
    //  Destructuring assignment: separate the data to be use like:
    //  " console.log(data); " instead of " consolo.log(object.data) "
    const {

        // User data
        email, password, phone, careerId, role,

        // Student data
        semester, stdId,

        // Intern data
        hostCompany, project, startDate, endDate,

        // Graduate data
        graduationYear, currentJob,

        // TO_DO: Company

            name,
            size,
            industry,
            city,
            state,
            address,
            contact_email,

    } = body;

    // 2. Verify is the user exist
    const existing = await findByEmail( email );

    if( existing ){
        const err =  new Error(' An account with this email already exist ');
        err.statusCode = 409;
        throw err;
    } 
    
    // 3. Hash the passwordd
    const hashedPassword = await bcryptjs.hash( password, SALT_ROUND );

    // 4. Create base app_user row
    const userId = await create({
        email,
        phone:      phone ?? null,
        password:   hashedPassword,
        careerId:   careerId ?? null,

    });

    // 5. Create role in subtable row

    switch ( role ){

        case 'student':
            await createStudent( userId, { semester, stdId } );
        break;

        case 'intern':
            await createIntern( userId, { hostCompany, project, startDate, endDate } );
        break;

        case 'graduate':
            await createGraduate( userId, {graduationYear, currentJob} );
        break;

        case 'company':
            // TO_DO: Implement when companyModel.js (Azucena) is ready
            //        Call companyModel.create( params )
            await createCompany(userId,{name,size,industry,city,state,address,contact_email});

        break;

        default: {

            const err = new Error( `Unkown role: "${role}".` );
            err.statusCode = 400;
            throw err;

        }

    }

    // 6. Set permission bitmask for the role in role-specific table
    await _updatePermissions( userId, role );

    // TO_DO: insert role_history row when roleHistoryModel.js is ready

    // 7. Generate verification token
    const verifyToken = crypto.randomBytes( 32 ).toString( 'hex' );
    const expiration  = new Date( Date.now() + 24 * 60 * 60 * 1000 ); // +24 h

    await updateToken( userId, verifyToken, expiration );

    // 8. Send verification email
    await sendVerificationEmail({to: email, token: verifyToken});

};

async function login( email, password ) {

    // 1. Find if user exist
    const user = await findByEmail( email );

    if( !user ){
        const err       = new Error( 'Invalid email or password.' );
        err.statusCode  = 401;
        throw err; 
    }

    // 2. Check if email is verified
    if( !user.email_verified ){
        const err        = new Error( 'Please verify your email before logging in.' );
        err.statusCode = 403;
        throw err;
    }

    // 3. Check if account is verified and active
    if( !user.active ){
        const err        = new Error( 'Your account has been deactivated. Contact support.' );
        err.statusCode = 403;
        throw err;
    }

    // 4. Compare password
    const match = await bcryptjs.compare( password, user.password )

    if( !match ){
        const err      = new Error( 'Invalid email or password' ); 
        err.statusCode = 401;
        throw err;
    }

    // 5. Detected role and read permissions bitmask
    const role        = await _detectRole( user.id );
    const permissions = await _getPermissions( user.id );

    // 6. Sign JWT
    // Payload: { id, email, role, permissions }
    // * CAUTION * : NEVER put sensitive data (password, token) in the JWT payload
    
    const token = jwt.sign(
        { id: user.id, email: user.email, role, permissions },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN ?? '3h' } 
    );

    return {
        token,
        user: { id: user.id, email: user.email, role, permissions },
    };


};


async function verifyEmail( token ) {

    // 1. Find user by token
    const user = await findByToken( token );
   
    if( !user ) {
        const err = new Error( 'Verification link is invalid' );
        err.statusCode = 400;
        throw err;
    }

    // 2. Check token has not expired
    if( new Date() > new Date( user.tokenExpiration ) ){
        const err = new Error( 'Verification link has expired. Please register again or request new link' );
        err.statusCode = 410;
        throw err;
    }

    // 3. Mark email as verified
    await markEmailVerified( user.id );

};

export { register, login, verifyEmail };