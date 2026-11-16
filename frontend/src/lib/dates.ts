// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Date helpers. The app only deals with calendar dates (no hours),
//      always as "YYYY-MM-DD" strings, which is also what <input
//      type="date"> reads and writes.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

// MySQL DATE columns reach the browser as a full timestamp, for example
// "2026-09-01T06:00:00.000Z": midnight in the backend timezone, written in
// UTC. The backend pool is fixed at -06:00 (config/db.js), so shifting by
// that offset recovers the calendar day no matter where the browser is.
const BACKEND_UTC_OFFSET_HOURS = -6

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

function pad( value: number ): string {
    return String( value ).padStart( 2, "0" )
}

// Normalizes anything the backend sends for a date into "YYYY-MM-DD".
function toDateOnly( value: unknown ): string | null {
    if( typeof value !== "string" || value === "" ) return null
    if( DATE_ONLY.test( value ) ) return value

    const time = Date.parse( value )
    if( Number.isNaN( time ) ) return null

    const shifted = new Date( time + BACKEND_UTC_OFFSET_HOURS * 60 * 60 * 1000 )
    return `${ shifted.getUTCFullYear() }-${ pad( shifted.getUTCMonth() + 1 ) }-${ pad( shifted.getUTCDate() ) }`
}

// Today in the browser, as a calendar date.
function today(): string {
    const now = new Date()
    return `${ now.getFullYear() }-${ pad( now.getMonth() + 1 ) }-${ pad( now.getDate() ) }`
}

// Whole days from "from" to "to" (negative if "to" is earlier).
function daysBetween( from: string, to: string ): number {
    const [ fy, fm, fd ] = from.split( "-" ).map( Number )
    const [ ty, tm, td ] = to.split( "-" ).map( Number )
    return Math.round( ( Date.UTC( ty, tm - 1, td ) - Date.UTC( fy, fm - 1, fd ) ) / 86_400_000 )
}

const formatter = new Intl.DateTimeFormat( "es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",    // The date is built in UTC below, so read it in UTC too.
} )

// "2026-09-01" -> "1 sept 2026". Empty text for a missing date.
function formatDate( date: string | null ): string {
    if( !date || !DATE_ONLY.test( date ) ) return ""
    const [ y, m, d ] = date.split( "-" ).map( Number )
    return formatter.format( new Date( Date.UTC( y, m - 1, d ) ) )
}

export { toDateOnly, today, daysBetween, formatDate }
