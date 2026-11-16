// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      What a screen shows when it has no content yet: loading, failed
//      or empty. Every page uses these three, so the app always answers
//      "what is going on?" the same way.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { CircleAlert, Inbox } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/Button.tsx"
import { Spinner } from "@/components/ui/Spinner.tsx"
import { cn } from "@/lib/utils.ts"

function LoadingState( { label = "Cargando", className }: { label?: string, className?: string } ) {
    return (
        <div className={ cn( "flex items-center justify-center gap-3 py-16 text-sm text-muted-foreground", className ) }>
            <Spinner label={ label } />
            <span aria-hidden>{ label }…</span>
        </div>
    )
}

interface ErrorStateProps {
    message: string
    // When given, shows a "retry" button that calls it.
    onRetry?: () => void
    className?: string
}

function ErrorState( { message, onRetry, className }: ErrorStateProps ) {
    return (
        <div role="alert" className={ cn( "flex flex-col items-center gap-3 rounded-xl border border-border bg-card px-6 py-12 text-center", className ) }>
            <CircleAlert aria-hidden className="size-7 text-danger" />
            <p className="max-w-md text-sm text-foreground">{ message }</p>
            { onRetry && <Button variant="secondary" size="sm" onClick={ onRetry }>Reintentar</Button> }
        </div>
    )
}

interface EmptyStateProps {
    title: string
    description?: string
    // Usually a button or link with the next step ("Ver vacantes").
    action?: ReactNode
    className?: string
}

function EmptyState( { title, description, action, className }: EmptyStateProps ) {
    return (
        <div className={ cn( "flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center", className ) }>
            <Inbox aria-hidden className="size-7 text-muted-foreground" />
            <p className="text-sm font-bold text-foreground">{ title }</p>
            { description && <p className="max-w-md text-[13px] text-muted-foreground">{ description }</p> }
            { action && <div className="mt-2">{ action }</div> }
        </div>
    )
}

export { LoadingState, ErrorState, EmptyState }
