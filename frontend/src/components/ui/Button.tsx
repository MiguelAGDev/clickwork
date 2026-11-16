// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      The button of the app. Knows nothing about what it triggers: it
//      only draws a variant, a size and a "working" state.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import type { ComponentProps } from "react"

import { buttonClasses } from "@/components/ui/buttonClasses.ts"
import type { ButtonVariants } from "@/components/ui/buttonClasses.ts"
import { Spinner } from "@/components/ui/Spinner.tsx"
import { cn } from "@/lib/utils.ts"

// Every prop of a normal <button>, plus the visual ones.
type ButtonProps = ComponentProps<"button"> & ButtonVariants & {
    // Shows a spinner and blocks clicks while a request is in flight, so a
    // double click cannot send the same form twice.
    loading?: boolean
}

function Button( { variant, size, loading = false, disabled, className, children, type = "button", ...props }: ButtonProps ) {
    return (
        <button
            // type="button" by default: inside a <form> a button with no type
            // submits it, which is a classic source of accidental submits.
            type={ type }
            disabled={ disabled || loading }
            className={ cn( buttonClasses( { variant, size } ), className ) }
            { ...props }
        >
            { loading && <Spinner className="size-4" /> }
            { children }
        </button>
    )
}

export { Button }
