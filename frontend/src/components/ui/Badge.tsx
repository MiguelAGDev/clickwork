// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Small pill label: the gold "Nuevo" of the design and the status
//      tags (pending, approved, rejected...).
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import type { ReactNode } from "react"

import { cn } from "@/lib/utils.ts"

type BadgeTone = "gold" | "neutral" | "info" | "success" | "warning" | "danger"

const TONES: Record<BadgeTone, string> = {
    gold: "bg-primary text-primary-foreground",
    neutral: "bg-muted text-muted-foreground",
    info: "bg-info text-info-foreground",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-foreground",
    danger: "bg-danger-soft text-danger",
}

interface BadgeProps {
    tone?: BadgeTone
    children: ReactNode
    className?: string
}

function Badge( { tone = "neutral", children, className }: BadgeProps ) {
    return (
        <span className={ cn( "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-bold", TONES[ tone ], className ) }>
            { children }
        </span>
    )
}

export { Badge }
export type { BadgeTone }
