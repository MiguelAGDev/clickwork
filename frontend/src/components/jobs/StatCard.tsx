// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      One number of a home screen with its icon and label (design: gold
//      icon, 26px number, small label). It can be a link to the screen
//      where that number comes from.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { Link } from "react-router-dom"

import { cn } from "@/lib/utils.ts"

interface StatCardProps {
    icon: LucideIcon
    value: string | number
    label: string
    // Small extra line under the label (for example what is missing).
    detail?: string
    // When given, the whole card is a link.
    to?: string
}

function StatCard( { icon: Icon, value, label, detail, to }: StatCardProps ) {
    const classes = "flex flex-col gap-2.5 rounded-xl border border-border bg-card p-5"

    const content = (
        <>
            <Icon aria-hidden className="size-5 text-primary" strokeWidth={ 1.8 } />
            <span className="text-[26px] leading-none font-extrabold text-foreground">{ value }</span>
            <span className="text-[12.5px] font-medium text-muted-foreground">{ label }</span>
            { detail && <span className="-mt-1 text-[12px] text-muted-foreground">{ detail }</span> }
        </>
    )

    if( to ) {
        return <Link to={ to } className={ cn( classes, "transition-colors hover:border-primary" ) }>{ content }</Link>
    }

    return <div className={ classes }>{ content }</div>
}

// Stat cards go in a row of three on desktop and stack on a phone.
function StatGrid( { children }: { children: ReactNode } ) {
    return <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-3">{ children }</div>
}

export { StatCard, StatGrid }
