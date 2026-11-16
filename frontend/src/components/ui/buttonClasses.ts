// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      The look of a button as a list of classes. It lives outside
//      Button.tsx so a <Link> can look like a button too (a link that
//      navigates should stay a real <a>, not a <button> with onClick).
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { cva } from "class-variance-authority"
import type { VariantProps } from "class-variance-authority"

// cva builds the final class string from the chosen variant and size.
const buttonClasses = cva(
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-[10px] font-bold whitespace-nowrap transition-colors " +
    "disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:pointer-events-none aria-disabled:opacity-60",
    {
        variants: {
            variant: {
                // Gold with ink text: the main action of a screen.
                primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
                // White with a border: a secondary action next to a primary one.
                secondary: "border border-input bg-card text-foreground hover:bg-muted",
                // No background until hovered: low emphasis actions.
                ghost: "text-foreground hover:bg-muted",
                // Red: actions that reject, deactivate or cannot be undone.
                danger: "bg-danger text-white hover:bg-danger/90",
            },
            size: {
                lg: "h-12 px-5 text-[15px]",
                md: "h-10 px-4 text-sm",
                sm: "h-8 px-3 text-[13px]",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "md",
        },
    }
)

type ButtonVariants = VariantProps<typeof buttonClasses>

export { buttonClasses }
export type { ButtonVariants }
