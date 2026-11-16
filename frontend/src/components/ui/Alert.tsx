// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      A message box inside the page: information, success, warning or
//      error. Same shape as the notice in the login design (icon on the
//      left, tinted background, 10px radius).
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils.ts"

type AlertTone = "info" | "success" | "warning" | "error"

const TONES: Record<AlertTone, { classes: string, icon: typeof Info }> = {
    info: { classes: "bg-info text-info-foreground", icon: Info },
    success: { classes: "bg-success-soft text-success", icon: CircleCheck },
    warning: { classes: "bg-warning-soft text-foreground", icon: TriangleAlert },
    error: { classes: "bg-danger-soft text-danger", icon: CircleAlert },
}

interface AlertProps {
    tone?: AlertTone
    title?: string
    children?: ReactNode
    className?: string
}

function Alert( { tone = "info", title, children, className }: AlertProps ) {
    const { classes, icon: Icon } = TONES[ tone ]

    return (
        <div
            // An error must interrupt ("alert"); the rest can wait their
            // turn in the screen reader queue ("status").
            role={ tone === "error" ? "alert" : "status" }
            className={ cn( "flex items-start gap-2.5 rounded-[10px] px-3.5 py-3 text-[13px] leading-snug", classes, className ) }
        >
            <Icon aria-hidden className="mt-px size-4 shrink-0" />
            <div className="flex min-w-0 flex-col gap-0.5">
                { title && <p className="font-bold">{ title }</p> }
                { children && <div>{ children }</div> }
            </div>
        </div>
    )
}

export { Alert }
export type { AlertTone }
