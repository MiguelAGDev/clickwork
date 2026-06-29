// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
// Description: AuthServices - Handles user registration, login, and email verification.
//              Uses centralized role and permission data stored in app_user.
//              Registration: creates app_user -> stores role/permissions -> creates role record -> sends verification email.
//              Login: reads role/permissions from app_user -> signs JWT.
// Date: May 6th 2026

// Latest Update:
// Date: June 8th 2026
// By: Azucena Rodriguez Flores 
// Changes: Refactored permissions to match database changes.
//          Removed role-specific permission updates from student, intern, graduate and company tables.
//          app_user.ap_usr_role and app_user.ap_usr_permissions are now the source of truth for authMiddleware.

import bcryptjs from 'bcryptjs';     // Library 'bcryptjs' for hashing passwords securely
import jwt      from 'jsonwebtoken'; // Library 'jsonwebtoken' for creating and verifying JWT tokens
import crypto   from 'crypto';       // Node.js built-in module for random values (tokens)

import { getConnection } from '../config/db.js';            // DB manual connection
import { sendVerificationEmail } from './emailService.js';  // Service to send confirmation email

// Import functions from user queries
import {
    create,
    findByEmail,
    findByToken,
    updateToken,
    verifyEmail as markEmailVerified,
} from '../models/userModel.js';

// Import role-specific creation functions
import {
    createStudent,
    createIntern,
    createGraduate,
} from '../models/studentModel.js';

import {
    createCompany,
} from '../models/companyModel.js';

// Import permission bitmasks
import { ROLE_MASK } from '../config/permissions.js';

// How many bcrypt rounds to use when hashing passwords
const SALT_ROUND = 12;

// Roles supported by app_user.ap_usr_role
const VALID_ROLES = ['student', 'intern', 'graduate', 'company', 'admin'];


// PRIVATE FUNCTIONS

// Wrapper function: acts like template for safe DB usage.
async function _borrowConnection() {
    const conn = await getConnection();

    return {
        execute: (sql, params) => conn.execute(sql, params),
        release: () => conn.release(),
    };
}

// Function: validates the requested role before creating user data.
function _assertValidRole(role) {
    if (!VALID_ROLES.includes(role)) {
        const err = new Error(`Unknown role: "${role}".`);
        err.statusCode = 400;
        throw err;
    }
}

function _throwValidationError(message) {
    const err = new Error(message);
    err.statusCode = 422;
    throw err;
}

// Function: validates role-specific registration payload before inserting app_user.
function _assertRolePayload(role, body) {
    switch (role) {
        case 'student': {
            const semester = Number(body.semester);
            if (!Number.isInteger(semester) || semester < 1 || semester > 12) {
                _throwValidationError('Semester is required for students and must be a valid integer between 1 and 12.');
            }
            break;
        }

        case 'intern': {
            if (body.startDate && Number.isNaN(Date.parse(body.startDate))) {
                _throwValidationError('Start Date must be a valid date (YYYY-MM-DD).');
            }
            if (body.endDate && Number.isNaN(Date.parse(body.endDate))) {
                _throwValidationError('End Date must be a valid date (YYYY-MM-DD).');
            }
            break;
        }

        case 'graduate': {
            const year = Number(body.graduationYear);
            const currentYear = new Date().getFullYear();
            if (!Number.isInteger(year) || year < 1965 || year > currentYear) {
                _throwValidationError('Graduation Year is required for graduates and must be a valid year.');
            }
            break;
        }

        case 'company': {
            if (!body.name || !body.name.toString().trim()) {
                _throwValidationError('Company name is required.');
            }
            const sizes = ['micro', 'small', 'medium', 'large'];
            if (!body.size || !sizes.includes(body.size)) {
                _throwValidationError('Company size is required and must be micro, small, medium, or large.');
            }
            if (!body.industry || !body.industry.toString().trim()) {
                _throwValidationError('Industry is required.');
            }
            if (body.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.contact_email)) {
                _throwValidationError('Company contact email must be valid.');
            }
            break;
        }

        default:
            break;
    }
}

// Function: returns the permission bitmask assigned to a role.
function _getRolePermissions(role) {
    return ROLE_MASK[role] ?? 0;
}

// Function: stores centralized role and permissions in app_user.
async function _updateUserRoleAndPermissions(userId, role) {
    const { execute, release } = await _borrowConnection();

    try {
        await execute(
            `UPDATE app_user
             SET ap_usr_role = ?,
                 ap_usr_permissions = ?
             WHERE ap_usr_id = ?`,
            [role, _getRolePermissions(role), userId]
        );
    } finally {
        release();
    }
}

// Function: reads centralized auth profile from app_user.
async function _getAuthProfile(userId) {
    const { execute, release } = await _borrowConnection();

    try {
        const [rows] = await execute(
            `SELECT
                 ap_usr_role AS role,
                 ap_usr_permissions AS permissions
             FROM app_user
             WHERE ap_usr_id = ?
             LIMIT 1`,
            [userId]
        );

        return {
            role: rows[0]?.role ?? null,
            permissions: rows[0]?.permissions ?? 0,
        };
    } finally {
        release();
    }
}


// PUBLIC FUNCTIONS

async function register(body) {
    // 1. Get data from body
    const {
        // User data
        email,
        password,
        phone,
        careerId,
        role,

        // Student data
        semester,

        // Intern data
        hostCompany,
        project,
        startDate,
        endDate,

        // Graduate data
        graduationYear,
        currentJob,

        // Company data
        name,
        size,
        industry,
        city,
        state,
        address,
        contact_email,
    } = body;

    // 2. Validate role before creating any row
    _assertValidRole(role);
    _assertRolePayload(role, body);

    // 2.1 Toggle colum active user
    const active = ( role === 'company' )? 0 : 1; 

    // 3. Verify if the user exists
    const existing = await findByEmail(email);

    if (existing) {
        const err = new Error('An account with this email already exists.');
        err.statusCode = 409;
        throw err;
    }

    // 4. Hash the password
    const hashedPassword = await bcryptjs.hash(password, SALT_ROUND);

    // 5. Create base app_user row
    const userId = await create({
        email,
        phone: phone ?? null,
        password: hashedPassword,
        careerId: careerId ?? null,
        active,
    });

    // 6. Store role and permissions in app_user
    await _updateUserRoleAndPermissions(userId, role);

    // 7. Create role-specific profile row
    switch (role) {
        case 'student':
            await createStudent(userId, { semester });
            break;

        case 'intern':
            await createIntern(userId, { hostCompany, project, startDate, endDate });
            break;

        case 'graduate':
            await createGraduate(userId, { graduationYear, currentJob });
            break;

        case 'company':
            await createCompany(userId, {
                name,
                size,
                industry,
                city,
                state,
                address,
                contact_email,
            });
            break;

        case 'admin':
            // Admin does not require a role-specific profile table.
            break;
    }

    // 6. Set permission bitmask for the role in role-specific table
    await _updateUserRoleAndPermissions( userId, role );

    // TO_DO: insert role_history row when roleHistoryModel.js is ready

    // 8. Generate verification token
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const expiration = new Date(Date.now() + 24 * 60 * 60 * 1000); // +24 h

    await updateToken(userId, verifyToken, expiration);

    // 9. Send verification email
    await sendVerificationEmail({ to: email, token: verifyToken });
}

async function login(email, password) {
    // 1. Find if user exists
    const user = await findByEmail(email);

    if (!user) {
        const err = new Error('Invalid email or password.');
        err.statusCode = 401;
        throw err;
    }

    // 2. Check if email is verified
    if (!user.email_verified) {
        const err = new Error('Please verify your email before logging in.');
        err.statusCode = 403;
        throw err;
    }

    // 3. Check if account is active
    if (!user.active) {
        const err = new Error('Your account has been deactivated. Contact support.');
        err.statusCode = 403;
        throw err;
    }

    // 4. Compare password
    const match = await bcryptjs.compare(password, user.password);

    if (!match) {
        const err = new Error('Invalid email or password.');
        err.statusCode = 401;
        throw err;
    }

    // 5. Read centralized role and permissions from app_user
    const { role, permissions } = await _getAuthProfile(user.id);

    // 6. Sign JWT
    // Payload: { id, email, role, permissions }
    // CAUTION: never put sensitive data such as password or verification token in the JWT payload.
    const token = jwt.sign(
        { id: user.id, email: user.email, role, permissions },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN ?? '3h' }
    );

    return {
        token,
        user: { id: user.id, email: user.email, role, permissions },
    };
}

async function verifyEmail(token) {
    // 1. Find user by token
    const user = await findByToken(token);

    if (!user) {
        const err = new Error('Verification link is invalid.');
        err.statusCode = 400;
        throw err;
    }

    // 2. Check token has not expired
    if (new Date() > new Date(user.tokenExpiration)) {
        const err = new Error('Verification link has expired. Please register again or request a new link.');
        err.statusCode = 410;
        throw err;
    }

    // 3. Mark email as verified
    await markEmailVerified(user.id);
}

export { register, login, verifyEmail };
