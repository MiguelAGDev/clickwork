// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Loading indicator. A spinning ring that takes the text color of
//      wherever it is placed, plus a full-page variant for when the
//      whole screen is waiting.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { cn } from "@/lib/utils.ts"

interface SpinnerProps {
    className?: string
    // Read by screen readers; the ring itself has no text.
    label?: string
}

function Spinner( { className, label = "Cargando" }: SpinnerProps ) {
    return (
        <span
            role="status"
            aria-label={ label }
            className={ cn(
                "inline-block size-5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent",
                className
            ) }
        />
    )
}

// Centered in the viewport. Used while the app does not know yet if there
// is a session, when there is nothing else to show.
function FullPageSpinner() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
            <Spinner className="size-8" />
        </div>
    )
}

export { Spinner, FullPageSpinner }
