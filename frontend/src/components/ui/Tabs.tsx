// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      A row of links that switch between views of the same screen (for
//      example "Pendientes" and "Todas"). They are real links, so the
//      current view is in the URL and survives a reload.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { Link } from "react-router-dom"

import { cn } from "@/lib/utils.ts"

interface TabItem {
    label: string
    to: string
    active: boolean
    // Optional number shown next to the label (how many items wait there).
    count?: number
}

function Tabs( { label, items }: { label: string, items: TabItem[] } ) {
    return (
        <nav aria-label={ label } className="flex gap-1 border-b border-border">
            { items.map( ( item ) => (
                <Link
                    key={ item.to }
                    to={ item.to }
                    aria-current={ item.active ? "page" : undefined }
                    className={ cn(
                        "-mb-px flex items-center gap-2 border-b-2 border-transparent px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground",
                        item.active && "border-primary font-bold text-foreground"
                    ) }
                >
                    { item.label }
                    { item.count !== undefined && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-foreground">{ item.count }</span>
                    ) }
                </Link>
            ) ) }
        </nav>
    )
}

export { Tabs }
export type { TabItem }
