// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      How a user is named on screen: the full name, the first name for
//      greetings and the initials for the avatar circle. Accounts
//      created before names existed may have an empty last name, so
//      every helper copes with blanks.
//
// Date: November 16th 2026

// Latest Update: Use the first and last name the backend now stores
//      instead of guessing a name from the email.
// Date: November 16th 2026
// By: Miguel Angel Avila Garcia

interface Named {
    firstName: string
    lastName: string
    email: string
}

// "Laura Estudiante". Falls back to the email when both names are blank.
function getFullName( user: Named ): string {
    const full = `${ user.firstName } ${ user.lastName }`.trim()
    return full || user.email
}

// What the greeting uses: "Hola, Laura".
function getDisplayName( user: Named ): string {
    return user.firstName.trim() || getFullName( user )
}

// "Laura Estudiante" -> "LE"; a single name gives its first two letters.
function getInitials( user: Named ): string {
    const first = user.firstName.trim()
    const last = user.lastName.trim()

    if( first && last ) return ( first[ 0 ] + last[ 0 ] ).toUpperCase()

    return ( first || last || user.email ).slice( 0, 2 ).toUpperCase()
}

export { getFullName, getDisplayName, getInitials }
export type { Named }
