// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Rules about job postings and applications that several screens
//      share: what counts as new, expired, active or recommended.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { daysBetween, today } from "@/lib/dates.ts"
import { CONTRACT_TYPE_LABELS, EXPERIENCE_LEVEL_LABELS, formatSalary, MODALITY_LABELS } from "@/lib/labels.ts"
import type { Application, JobPosting, User } from "@/types/models.ts"

// A posting wears the "Nuevo" badge during its first week.
const NEW_FOR_DAYS = 7

function isNew( job: JobPosting ): boolean {
    if( !job.publicationDate ) return false

    const age = daysBetween( job.publicationDate, today() )
    return age >= 0 && age <= NEW_FOR_DAYS
}

// Closed: its expiration date is in the past. The last day still counts.
// The backend list does not filter these out, the screens do.
function isExpired( job: JobPosting ): boolean {
    return job.expirationDate !== null && daysBetween( job.expirationDate, today() ) > 0
}

// An application is active while the company has not given a final
// answer (accepted or rejected).
function isActiveApplication( application: Application ): boolean {
    return application.status !== "accepted" && application.status !== "rejected"
}

// Newest first; postings without a date go last.
function byNewest( a: JobPosting, b: JobPosting ): number {
    return ( b.publicationDate ?? "" ).localeCompare( a.publicationDate ?? "" )
}

// Postings to suggest on the home: open ones the user has not applied to,
// the ones for the user career first, then the most recent.
function getRecommendedJobs( jobs: JobPosting[], applications: Application[], user: User, limit = 5 ): JobPosting[] {
    const applied = new Set( applications.map( ( application ) => application.job.id ) )
    const matchesCareer = ( job: JobPosting ) => user.careerId !== null && job.careerId === user.careerId

    return jobs
        .filter( ( job ) => !isExpired( job ) && !applied.has( job.id ) )
        .sort( ( a, b ) => Number( matchesCareer( b ) ) - Number( matchesCareer( a ) ) || byNewest( a, b ) )
        .slice( 0, limit )
}

// "Híbrido · Tiempo completo · Junior · $15,000 al mes". The design shows
// company and city here; the backend list does not send them yet, so the
// line uses what a posting does carry.
function getJobSummary( job: JobPosting ): string {
    const salary = formatSalary( job.salary )

    return [
        MODALITY_LABELS[ job.modality ],
        CONTRACT_TYPE_LABELS[ job.contractType ],
        EXPERIENCE_LEVEL_LABELS[ job.experienceLevel ],
        salary && `${ salary } al mes`,
    ].filter( Boolean ).join( " · " )
}

interface ProfileCompletion {
    percent: number
    // What is still missing, in words ready for the UI.
    missing: string[]
}

// How complete a candidate profile is: every item weighs the same.
function getProfileCompletion( user: User ): ProfileCompletion {
    const items: [ label: string, done: boolean ][] = [
        [ "teléfono", user.phone !== null ],
        [ "carrera", user.careerId !== null ],
        [ "CV", user.cvUrl !== null ],
    ]

    if( user.role === "student" ) {
        items.push( [ "semestre", user.semester !== null ] )
    } else if( user.role === "intern" ) {
        items.push( [ "empresa de residencia", user.hostCompany !== null ] )
        items.push( [ "proyecto de residencia", user.project !== null ] )
    } else if( user.role === "graduate" ) {
        items.push( [ "año de egreso", user.graduationYear !== null ] )
        items.push( [ "puesto actual", user.currentJob !== null ] )
    }

    const done = items.filter( ( [ , isDone ] ) => isDone ).length

    return {
        percent: Math.round( ( done / items.length ) * 100 ),
        missing: items.filter( ( [ , isDone ] ) => !isDone ).map( ( [ label ] ) => label ),
    }
}

export { getJobSummary, isNew, isExpired, isActiveApplication, byNewest, getRecommendedJobs, getProfileCompletion }
export type { ProfileCompletion }
