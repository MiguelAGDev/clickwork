// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      "Saved jobs" of the logged-in candidate. The backend has no
//      endpoint for this yet, so the list of saved job ids is kept in
//      the browser (localStorage), one list per user. It does not follow
//      the user to another device; moving it to the backend later only
//      means rewriting this file.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { useCallback, useMemo, useSyncExternalStore } from "react"

import { useAuth } from "@/hooks/useAuth.ts"

const EMPTY = "[]"

function storageKey( userId: number ): string {
    return `clickwork:saved-jobs:${ userId }`
}

// Components that must re-render when the list changes.
const listeners = new Set<() => void>()

function subscribe( listener: () => void ): () => void {
    listeners.add( listener )
    // "storage" fires when another tab changes localStorage, so two tabs
    // of the app stay in sync.
    window.addEventListener( "storage", listener )

    return () => {
        listeners.delete( listener )
        window.removeEventListener( "storage", listener )
    }
}

// The stored text itself is the snapshot: React compares snapshots with
// ===, and equal lists give equal strings, so nothing re-renders in vain.
function read( userId: number | null ): string {
    if( userId === null ) return EMPTY
    return localStorage.getItem( storageKey( userId ) ) ?? EMPTY
}

function parse( raw: string ): number[] {
    try {
        const value: unknown = JSON.parse( raw )
        return Array.isArray( value ) ? value.filter( ( id ): id is number => typeof id === "number" ) : []
    } catch {
        return []   // Someone edited the storage by hand: start clean.
    }
}

interface SavedJobs {
    savedIds: ReadonlySet<number>
    isSaved: ( jobId: number ) => boolean
    toggle: ( jobId: number ) => void
}

function useSavedJobs(): SavedJobs {
    const { user } = useAuth()
    const userId = user?.id ?? null

    // useSyncExternalStore: the React way to read a value that lives
    // outside React and can change at any time. Every component using
    // this hook reads the same list and updates together.
    const raw = useSyncExternalStore( subscribe, () => read( userId ) )
    const savedIds = useMemo( () => new Set( parse( raw ) ), [ raw ] )

    const toggle = useCallback( ( jobId: number ) => {
        if( userId === null ) return

        const next = new Set( parse( read( userId ) ) )
        if( next.has( jobId ) ) next.delete( jobId )
        else next.add( jobId )

        localStorage.setItem( storageKey( userId ), JSON.stringify( [ ...next ] ) )
        listeners.forEach( ( listener ) => listener() )
    }, [ userId ] )

    const isSaved = useCallback( ( jobId: number ) => savedIds.has( jobId ), [ savedIds ] )

    return { savedIds, isSaved, toggle }
}

export { useSavedJobs }
