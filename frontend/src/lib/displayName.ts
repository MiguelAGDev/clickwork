// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      A name to greet the user with. The backend stores no first or
//      last name (only the email), so the name is taken from the part of
//      the email before the @.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

// "miguel.avila23@correo.com" -> "Miguel". Only the first word of the
// local part is used: what follows a dot, dash or digit is usually a last
// name or a number, and guessing how to format it tends to look wrong.
function getDisplayName( email: string ): string {
    const local = email.split( "@" )[ 0 ] ?? ""
    const first = local.split( /[._\-+0-9]/ ).find( ( part ) => part.length > 0 ) ?? local

    if( !first ) return "Usuario"

    return first.charAt( 0 ).toUpperCase() + first.slice( 1 ).toLowerCase()
}

// Two letters for the avatar circle: "Miguel" -> "MI".
function getInitials( name: string ): string {
    return name.slice( 0, 2 ).toUpperCase()
}

export { getDisplayName, getInitials }
