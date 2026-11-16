// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Loads data for a screen and tracks its three states: loading,
//      error and ready. Every page that reads from the API uses it, so
//      they all handle loading and errors the same way.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { useCallback, useEffect, useEffectEvent, useState } from "react"

import { toApiError } from "@/services/api.ts"
import type { ApiError } from "@/types/api.ts"

interface AsyncData<T> {
    data: T | null
    error: ApiError | null
    isLoading: boolean
    reload: () => void
    // Replaces the data in memory, for when an action already knows the new
    // value (for example after changing one row) and a reload is not needed.
    setData: ( next: T ) => void
}

interface Settled<T> {
    key: string | null      // which request this result belongs to
    request: string | null
    data: T | null
    error: ApiError | null
}

// key: a string that identifies WHAT is being loaded (for example
// "job:12"). When it changes the data is loaded again; null means "do not
// load yet". fetcher: the service call that returns the data.
function useAsyncData<T>( key: string | null, fetcher: () => Promise<T> ): AsyncData<T> {
    const [ reloads, setReloads ] = useState( 0 )
    const [ settled, setSettled ] = useState<Settled<T>>( { key: null, request: null, data: null, error: null } )

    // One request is identified by the key plus how many times it was
    // reloaded. "Loading" is simply: the last finished request is not the
    // current one. Deriving it (instead of a setLoading(true) inside the
    // effect) avoids an extra render and can never get out of sync.
    const request = key === null ? null : `${ key }#${ reloads }`

    // The fetcher is usually a new arrow function on every render. An
    // effect event always sees the latest one without making the effect
    // run again because of it.
    const runFetcher = useEffectEvent( () => fetcher() )

    useEffect( () => {
        if( request === null ) return

        // If the key changes or the component unmounts before the answer
        // arrives, that answer is ignored: it belongs to an old request.
        let cancelled = false

        runFetcher().then(
            ( data ) => {
                if( !cancelled ) setSettled( { key, request, data, error: null } )
            },
            ( error: unknown ) => {
                if( !cancelled ) setSettled( { key, request, data: null, error: toApiError( error ) } )
            }
        )

        return () => { cancelled = true }
    }, [ key, request ] )

    const reload = useCallback( () => setReloads( ( count ) => count + 1 ), [] )

    const setData = useCallback( ( next: T ) => {
        setSettled( ( current ) => ( { ...current, data: next, error: null } ) )
    }, [] )

    // Data from another key is never shown (it is a different thing). Data
    // from the same key stays visible during a reload, so the screen does
    // not flash empty.
    const sameKey = settled.key === key
    const isLoading = request !== null && settled.request !== request

    return {
        data: sameKey ? settled.data : null,
        error: sameKey && !isLoading ? settled.error : null,
        isLoading,
        reload,
        setData,
    }
}

export { useAsyncData }
export type { AsyncData }
