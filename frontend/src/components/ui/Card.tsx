// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      White surface with a thin border and 12px radius: the container
//      of the stat cards, the job rows and every form section.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import type { ComponentProps } from "react"

import { cn } from "@/lib/utils.ts"

function Card( { className, ...props }: ComponentProps<"div"> ) {
    return <div className={ cn( "rounded-xl border border-border bg-card", className ) } { ...props } />
}

// A card with a title, for the sections of a form or a profile.
interface SectionCardProps extends ComponentProps<"section"> {
    title: string
    description?: string
}

function SectionCard( { title, description, className, children, ...props }: SectionCardProps ) {
    return (
        <section className={ cn( "flex flex-col gap-5 rounded-xl border border-border bg-card p-5 sm:p-6", className ) } { ...props }>
            <div className="flex flex-col gap-1">
                <h2 className="text-base font-bold text-foreground">{ title }</h2>
                { description && <p className="text-[13px] text-muted-foreground">{ description }</p> }
            </div>
            { children }
        </section>
    )
}

export { Card, SectionCard }
