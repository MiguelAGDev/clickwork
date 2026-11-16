// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Tests for the data loading hook: loading, ready, error and
//      reload.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { renderHook, waitFor, act } from "@testing-library/react"
import { describe, expect, test, vi } from "vitest"

import { useAsyncData } from "@/hooks/useAsyncData.ts"
import { ApiError } from "@/types/api.ts"

describe( "useAsyncData", () => {
    test( "goes from loading to ready", async () => {
        const { result } = renderHook( () => useAsyncData( "numbers", () => Promise.resolve( [ 1, 2, 3 ] ) ) )

        expect( result.current.isLoading ).toBe( true )
        expect( result.current.data ).toBeNull()

        await waitFor( () => expect( result.current.isLoading ).toBe( false ) )
        expect( result.current.data ).toEqual( [ 1, 2, 3 ] )
        expect( result.current.error ).toBeNull()
    } )

    test( "exposes the error when the fetcher fails", async () => {
        const failure = new ApiError( "No encontramos esta vacante.", 404 )
        const { result } = renderHook( () => useAsyncData( "job:99", () => Promise.reject( failure ) ) )

        await waitFor( () => expect( result.current.isLoading ).toBe( false ) )
        expect( result.current.error ).toBe( failure )
        expect( result.current.data ).toBeNull()
    } )

    test( "does not load while the key is null", () => {
        const fetcher = vi.fn( () => Promise.resolve( "x" ) )
        const { result } = renderHook( () => useAsyncData( null, fetcher ) )

        expect( fetcher ).not.toHaveBeenCalled()
        expect( result.current.isLoading ).toBe( false )
    } )

    test( "reload calls the fetcher again and keeps the old data meanwhile", async () => {
        let calls = 0
        const { result } = renderHook( () => useAsyncData( "counter", () => Promise.resolve( ++calls ) ) )
        await waitFor( () => expect( result.current.data ).toBe( 1 ) )

        act( () => result.current.reload() )

        expect( result.current.isLoading ).toBe( true )
        expect( result.current.data ).toBe( 1 )     // still visible during the reload
        await waitFor( () => expect( result.current.data ).toBe( 2 ) )
    } )

    test( "loads again and hides the old data when the key changes", async () => {
        const { result, rerender } = renderHook(
            ( { id } ) => useAsyncData( `job:${ id }`, () => Promise.resolve( `job ${ id }` ) ),
            { initialProps: { id: 1 } }
        )
        await waitFor( () => expect( result.current.data ).toBe( "job 1" ) )

        rerender( { id: 2 } )

        expect( result.current.data ).toBeNull()
        await waitFor( () => expect( result.current.data ).toBe( "job 2" ) )
    } )
} )
