// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Title block at the top of a screen: the h1, a subtitle, an
//      optional "back" link above and optional actions on the right.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { ArrowLeft } from "lucide-react"
import type { ReactNode } from "react"
import { Link } from "react-router-dom"

interface PageHeaderProps {
    title: string
    subtitle?: ReactNode
    // Link back to the list this screen was opened from.
    back?: { to: string, label: string }
    // Buttons or links aligned to the right of the title.
    actions?: ReactNode
}

function PageHeader( { title, subtitle, back, actions }: PageHeaderProps ) {
    return (
        <div className="flex flex-col gap-3">
            { back && (
                <Link to={ back.to } className="flex w-fit items-center gap-1.5 text-[13px] font-semibold text-link underline-offset-4 hover:underline">
                    <ArrowLeft aria-hidden className="size-3.5" />
                    { back.label }
                </Link>
            ) }

            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
                <div className="min-w-0">
                    <h1 className="text-[26px] leading-tight font-bold tracking-[-0.01em] text-foreground">{ title }</h1>
                    { subtitle && <div className="mt-1.5 text-sm text-muted-foreground">{ subtitle }</div> }
                </div>
                { actions && <div className="flex flex-wrap items-center gap-2.5">{ actions }</div> }
            </div>
        </div>
    )
}

export { PageHeader }
