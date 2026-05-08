// Authors: 
//      * Azucena Rodriguez Flores  
//      * Miguel Angel Avila Garcia
// Description: AuthServices - 
// Date: May 6th 2026

// Latest Update:
// Date:
// By:


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


import { execute } from '../config/db.js';


// How many bcrypt rounds to use when hashing passwords
const SALT_ROUND = 12;


// functions

async function _borrowConnection(  ) {

    const conn = await getConnection();

    return {
        execute: ( sql, params ) => conn.execute( sql, params ),
        release: ()              => conn.release()

    };
    
};


async function _detectRole( userId ) {


    
}
