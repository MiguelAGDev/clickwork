// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
// Description: Role-based authorization middleware.
//              Checks that req.user.role matches required role(s).
//              Returns 403 Forbidden if role does not match.
// Date: June 28th 2026

// Latest Update:
// Date:
// By:

/**
 * Factory function: creates a middleware that checks if user has the required role.
 * Usage: router.use(roleMiddleware('admin'))
 *        or: router.get('/', roleMiddleware('admin'), handler)
 */
export function roleMiddleware(requiredRole) {
    return (req, res, next) => {
        // Ensure req.user exists (should be set by authMiddleware)
        if (!req.user) {
            const err = new Error('User not authenticated');
            err.statusCode = 401;
            return next(err);
        }

        // Check if user role matches required role
        if (req.user.role !== requiredRole) {
            const err = new Error(
                `Access denied. Required role: ${requiredRole}, but you are: ${req.user.role}`
            );
            err.statusCode = 403;
            return next(err);
        }

        // Role matches, continue to next middleware/handler
        next();
    };
}

/**
 * Factory function: creates a middleware that checks if user role is one of multiple allowed roles.
 * Usage: router.use(roleMiddlewareMulti(['admin', 'moderator']))
 */
export function roleMiddlewareMulti(allowedRoles) {
    return (req, res, next) => {
        // Ensure req.user exists (should be set by authMiddleware)
        if (!req.user) {
            const err = new Error('User not authenticated');
            err.statusCode = 401;
            return next(err);
        }

        // Check if user role is in allowed roles
        if (!allowedRoles.includes(req.user.role)) {
            const err = new Error(
                `Access denied. Required one of: ${allowedRoles.join(', ')}, but you are: ${req.user.role}`
            );
            err.statusCode = 403;
            return next(err);
        }

        // Role is allowed, continue to next middleware/handler
        next();
    };
}