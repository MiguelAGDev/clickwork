// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      The ClickWork mark: a gold bolt next to the name. Used on navy
//      backgrounds (header and login panel).
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { cn } from "@/lib/utils.ts"

interface LogoProps {
    // Bolt size in px. 22 in the header, 26 in the login panel.
    size?: number
    className?: string
}

function Logo( { size = 22, className }: LogoProps ) {
    return (
        <span className={ cn( "flex items-center gap-2.5 font-bold tracking-[-0.01em] text-panel-foreground", className ) }>
            {/* aria-hidden: the bolt is decoration, the name next to it is the text. */}
            <svg aria-hidden width={ size } height={ size } viewBox="0 0 24 24" fill="none">
                <path d="M4 12 L11 4 L11 10 L20 10 L13 20 L13 12 Z" className="fill-primary" />
            </svg>
            ClickWork
        </span>
    )
}

export { Logo }
