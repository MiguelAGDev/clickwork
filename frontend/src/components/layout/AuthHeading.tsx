// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Title and subtitle of a public screen (login, register...), plus
//      the link style those screens share.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import type { ReactNode } from "react"

function AuthHeading( { title, subtitle }: { title: string, subtitle?: ReactNode } ) {
    return (
        <div>
            <h1 className="text-[26px] leading-tight font-bold tracking-[-0.01em] text-foreground">{ title }</h1>
            { subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{ subtitle }</p> }
        </div>
    )
}

// Bottom block of a public form: the links to the other public screens,
// separated from the form by a line as in the design.
function AuthFooter( { children }: { children: ReactNode } ) {
    return (
        <div className="flex flex-col items-center gap-1.5 border-t-2 border-border pt-3.5 text-center text-[13.5px] text-muted-foreground">
            { children }
        </div>
    )
}

export { AuthHeading, AuthFooter }
