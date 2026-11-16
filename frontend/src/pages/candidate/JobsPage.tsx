// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      List of open job postings with search and filters. The filters
//      live in the URL (?search=...&modality=...), so a filtered list
//      can be reloaded, bookmarked or shared and stays the same.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { Search } from "lucide-react"
import { useState } from "react"
import type { FormEvent } from "react"
import { useSearchParams } from "react-router-dom"

import { JobCard } from "@/components/jobs/JobCard.tsx"
import { PageHeader } from "@/components/layout/PageHeader.tsx"
import { Button } from "@/components/ui/Button.tsx"
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States.tsx"
import { useAsyncData } from "@/hooks/useAsyncData.ts"
import { useSavedJobs } from "@/hooks/useSavedJobs.ts"
import { byNewest, isExpired } from "@/lib/jobs.ts"
import { CONTRACT_TYPE_LABELS, EXPERIENCE_LEVEL_LABELS, MODALITY_LABELS } from "@/lib/labels.ts"
import { getJobPostings } from "@/services/jobPostingService.ts"
import type { JobPostingFilters } from "@/services/jobPostingService.ts"

// Reads one URL parameter as one of the allowed values, or "" (no filter).
// A value typed by hand in the URL that is not in the list is ignored.
function pick<T extends string>( value: string | null, labels: Record<T, string> ): T | "" {
    return value !== null && value in labels ? ( value as T ) : ""
}

const selectClasses = "h-10 rounded-[10px] border-2 border-input bg-card px-3 text-sm text-foreground"

function JobsPage() {
    const [ params, setParams ] = useSearchParams()
    const { savedIds, isSaved, toggle } = useSavedJobs()

    const filters: JobPostingFilters = {
        search: params.get( "search" ) ?? "",
        modality: pick( params.get( "modality" ), MODALITY_LABELS ),
        contractType: pick( params.get( "contract" ), CONTRACT_TYPE_LABELS ),
        experienceLevel: pick( params.get( "level" ), EXPERIENCE_LEVEL_LABELS ),
    }
    const onlySaved = params.get( "saved" ) === "1"

    // The text box has its own state so typing does not search on every
    // key press: the search runs when the form is submitted.
    const [ searchText, setSearchText ] = useState( filters.search ?? "" )

    // The key carries the filters that change the request, so a new search
    // loads again. "Only saved" filters what is already loaded.
    const requestKey = `jobs:${ filters.search }|${ filters.modality }|${ filters.contractType }|${ filters.experienceLevel }`
    const { data, error, isLoading, reload } = useAsyncData( requestKey, () => getJobPostings( filters ) )

    // Writes one filter in the URL (or removes it when empty).
    function setParam( name: string, value: string ) {
        setParams( ( current ) => {
            const next = new URLSearchParams( current )
            if( value ) next.set( name, value )
            else next.delete( name )
            return next
        }, { replace: true } )
    }

    function handleSearch( event: FormEvent ) {
        event.preventDefault()
        setParam( "search", searchText.trim() )
    }

    function clearFilters() {
        setSearchText( "" )
        setParams( {}, { replace: true } )
    }

    const jobs = ( data ?? [] )
        .filter( ( job ) => !isExpired( job ) )
        .filter( ( job ) => !onlySaved || savedIds.has( job.id ) )
        .sort( byNewest )

    const hasFilters = [ ...params.keys() ].length > 0

    return (
        <>
            <PageHeader title="Vacantes" subtitle="Explora las vacantes abiertas y postúlate" />

            <section aria-label="Filtros" className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
                <form role="search" onSubmit={ handleSearch } className="flex gap-2.5">
                    <div className="relative flex-1">
                        <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="search"
                            aria-label="Buscar vacantes"
                            placeholder="Busca por puesto o requisito"
                            value={ searchText }
                            onChange={ ( event ) => setSearchText( event.target.value ) }
                            className="h-10 w-full rounded-[10px] border-2 border-input bg-card pr-3 pl-9 text-sm text-foreground placeholder:text-muted-foreground/70"
                        />
                    </div>
                    <Button type="submit">Buscar</Button>
                </form>

                <div className="flex flex-wrap items-center gap-2.5">
                    <select aria-label="Modalidad" className={ selectClasses } value={ filters.modality } onChange={ ( event ) => setParam( "modality", event.target.value ) }>
                        <option value="">Modalidad: todas</option>
                        { Object.entries( MODALITY_LABELS ).map( ( [ value, label ] ) => <option key={ value } value={ value }>{ label }</option> ) }
                    </select>
                    <select aria-label="Tipo de contrato" className={ selectClasses } value={ filters.contractType } onChange={ ( event ) => setParam( "contract", event.target.value ) }>
                        <option value="">Contrato: todos</option>
                        { Object.entries( CONTRACT_TYPE_LABELS ).map( ( [ value, label ] ) => <option key={ value } value={ value }>{ label }</option> ) }
                    </select>
                    <select aria-label="Nivel de experiencia" className={ selectClasses } value={ filters.experienceLevel } onChange={ ( event ) => setParam( "level", event.target.value ) }>
                        <option value="">Nivel: todos</option>
                        { Object.entries( EXPERIENCE_LEVEL_LABELS ).map( ( [ value, label ] ) => <option key={ value } value={ value }>{ label }</option> ) }
                    </select>

                    <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                        <input
                            type="checkbox"
                            className="size-4 accent-(--palette-accent-2)"
                            checked={ onlySaved }
                            onChange={ ( event ) => setParam( "saved", event.target.checked ? "1" : "" ) }
                        />
                        Solo guardadas
                    </label>

                    { hasFilters && (
                        <Button variant="ghost" size="sm" onClick={ clearFilters } className="ml-auto">Limpiar filtros</Button>
                    ) }
                </div>
            </section>

            { isLoading && !data && <LoadingState label="Cargando vacantes" /> }
            { error && <ErrorState message={ error.message } onRetry={ reload } /> }

            { data && (
                <section aria-label="Resultados" className="flex flex-col gap-3">
                    {/* aria-live: a screen reader announces the new count after each search. */}
                    <p aria-live="polite" className="text-[13px] text-muted-foreground">
                        { jobs.length === 1 ? "1 vacante" : `${ jobs.length } vacantes` }
                    </p>

                    { jobs.length === 0 ? (
                        <EmptyState
                            title={ onlySaved ? "No tienes vacantes guardadas" : "No encontramos vacantes" }
                            description={
                                onlySaved
                                    ? "Guarda una vacante con el ícono de marcador para encontrarla aquí después."
                                    : hasFilters
                                        ? "Prueba con otra búsqueda o quita algún filtro."
                                        : "Todavía no hay vacantes publicadas. Vuelve pronto."
                            }
                            action={ hasFilters ? <Button variant="secondary" size="sm" onClick={ clearFilters }>Limpiar filtros</Button> : undefined }
                        />
                    ) : (
                        <div className="flex flex-col gap-2.5">
                            { jobs.map( ( job ) => (
                                <JobCard
                                    key={ job.id }
                                    job={ job }
                                    to={ `/jobs/${ job.id }` }
                                    saved={ isSaved( job.id ) }
                                    onToggleSaved={ () => toggle( job.id ) }
                                />
                            ) ) }
                        </div>
                    ) }
                </section>
            ) }
        </>
    )
}

export { JobsPage }
