// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Where the session token (JWT) lives between page reloads. Kept
//      in its own file so the HTTP client and the auth context share
//      one source of truth, and so moving the token elsewhere later
//      means changing only this file.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

// localStorage survives a reload and a new tab, which is what a user
// expects from "stay logged in". The trade-off: any script running on the
// page can read it, so the app must never render untrusted HTML. The
// backend token lasts 3 hours and there is no refresh token, which limits
// how long a leaked one is useful.
const TOKEN_KEY = "clickwork:token"

function getToken(): string | null {
    return localStorage.getItem( TOKEN_KEY )
}

function setToken( token: string ): void {
    localStorage.setItem( TOKEN_KEY, token )
}

function clearToken(): void {
    localStorage.removeItem( TOKEN_KEY )
}

// Reads the "exp" claim (seconds since 1970) from the token payload.
// This does NOT verify the signature; only the backend can do that. It is
// just a cheap way to avoid a request we already know will answer 401.
function getTokenExpiration( token: string ): number | null {
    try {
        const payload = token.split( "." )[ 1 ]
        // JWT uses base64url; atob needs standard base64.
        const json = atob( payload.replace( /-/g, "+" ).replace( /_/g, "/" ) )
        const exp = ( JSON.parse( json ) as { exp?: unknown } ).exp
        return typeof exp === "number" ? exp * 1000 : null
    } catch {
        return null     // Not a JWT we can read: treat it as "unknown".
    }
}

function isTokenExpired( token: string ): boolean {
    const expiresAt = getTokenExpiration( token )
    return expiresAt !== null && expiresAt <= Date.now()
}

export { getToken, setToken, clearToken, getTokenExpiration, isTokenExpired }
