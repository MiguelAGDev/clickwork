// Authors:
//      * Miguel Angel Avila Garcia
// Description: Rate limiters for auth-sensitive endpoints (express-rate-limit).
//              Windows are chosen to match each endpoint's actual token
//              lifetime where one exists (see authService.js) instead of
//              arbitrary values — see notclaude/bitacora/2026-09-06-rate-limiting.md.
// Date: September 6th 2026

// Lastest Update: Skip all limiters when NODE_ENV=test (Newman suite)
// Date: September 6th 2026
// By: Miguel Angel Avila Garcia

import rateLimit, { ipKeyGenerator } from 'express-rate-limit'; // Import to create limiters for endpoints

// Share response shape matching errorHandler's { succes: false, message: string }
// envelop so the frontend doesn't need a special case just for 429 responses.
function limitMessage( message ){ return { success: false, message }; }

// The Newman integration suite (backend/test/newman) logs in several
// times per run from the same IP, against clickwork_test -- disable
// rate limiting there. Production/dev behavior is unaffected: this only
// skips when NODE_ENV=test, which is never set outside a local .env.
const skipInTest = () => process.env.NODE_ENV === 'test';

// POST /api/auth/login 
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,                   // Limit each IP to 5 login requests per windowMs
    standardHeaders: true,    // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,     // Disable the `X-RateLimit-*` headers
    message: limitMessage('Too many login attempts from this IP, please try again after 15 minutes'),
    skip: skipInTest,
});

// POST /api/auth/register
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,                  // Limit each IP to 10 register requests per windowMs
    standardHeaders: true,    // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,     // Disable the `X-RateLimit-*` headers
    message: limitMessage('Too many accounts created from this IP, please try again after an hour'),
    skip: skipInTest,
});

// POST /api/auth/forgot-password
const forgotPasswordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 2,                   // Limit each IP to 2 forgot password requests per windowMs
    standardHeaders: true,    // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,     // Disable the `X-RateLimit-*` headers
    message: limitMessage('Too many forgot password attempts from this IP, please try again after an hour'),
    skip: skipInTest,
});

// POST /api/auth/resend-verification
const resendVerificationLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hour
    max: 2,                        // Limit each IP to 2 resend verification requests per windowMs
    standardHeaders: true,         // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,          // Disable the `X-RateLimit-*` headers
    message: limitMessage('Too many resend verification attempts from this IP, please try again after 24 hours'),
    skip: skipInTest,
});

// POST /api/auth/reset-password/:token
const resetPasswordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,                   // Limit each IP to 3 reset password requests per windowMs
    standardHeaders: true,    // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,     // Disable the `X-RateLimit-*` headers
    message: limitMessage('Too many reset password attempts from this IP, please try again after an hour'),
    skip: skipInTest,
});

// POST /api/users/password
const changePasswordLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000,                 // 24 hours
    max: 5,                                        // Limit each IP to 5 change password requests per windowMs
    standardHeaders: true,                         // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,                          // Disable the `X-RateLimit-*` headers
    keyGenerator: ( req ) => req.user?.id || 
                  ipKeyGenerator( req.ip ),        // Use user ID if available, otherwise fallback to IP
    message: limitMessage('Too many change password attempts from this IP, please try again after 24 hours'),
    skip: skipInTest,
});

export {
    loginLimiter,
    registerLimiter,
    forgotPasswordLimiter,
    resendVerificationLimiter,
    resetPasswordLimiter,
    changePasswordLimiter
};
