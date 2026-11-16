// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      A modal that asks "are you sure?" before an action that is hard
//      to undo (deactivate an account, reject a company...). It can hold
//      extra content, for example the box to write a rejection reason.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { AlertDialog } from "radix-ui"
import type { ReactNode } from "react"

import { Alert } from "@/components/ui/Alert.tsx"
import { Button } from "@/components/ui/Button.tsx"

interface ConfirmDialogProps {
    open: boolean
    // Called when the dialog wants to close (Cancel, Escape).
    onClose: () => void
    title: string
    description: ReactNode
    confirmLabel: string
    // "danger" paints the confirm button red.
    tone?: "primary" | "danger"
    // True while the action runs: both buttons wait.
    loading?: boolean
    // Error of the last attempt, shown inside the dialog.
    error?: string | null
    onConfirm: () => void
    children?: ReactNode
}

function ConfirmDialog( {
    open, onClose, title, description, confirmLabel, tone = "primary", loading = false, error, onConfirm, children,
}: ConfirmDialogProps ) {
    return (
        // Radix AlertDialog: traps the focus inside, closes with Escape,
        // returns the focus to the button that opened it and tells screen
        // readers this is a question that needs an answer.
        <AlertDialog.Root open={ open } onOpenChange={ ( next ) => { if( !next && !loading ) onClose() } }>
            <AlertDialog.Portal>
                <AlertDialog.Overlay className="fixed inset-0 z-50 bg-foreground/40" />
                <AlertDialog.Content className="fixed top-1/2 left-1/2 z-50 flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col gap-4 overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-xl">
                    <div className="flex flex-col gap-1.5">
                        <AlertDialog.Title className="text-base font-bold text-foreground">{ title }</AlertDialog.Title>
                        <AlertDialog.Description asChild>
                            <div className="text-sm leading-relaxed text-muted-foreground">{ description }</div>
                        </AlertDialog.Description>
                    </div>

                    { children }

                    { error && <Alert tone="error">{ error }</Alert> }

                    <div className="flex flex-wrap justify-end gap-2.5">
                        <Button variant="secondary" disabled={ loading } onClick={ onClose }>Cancelar</Button>
                        <Button variant={ tone } loading={ loading } onClick={ onConfirm }>{ confirmLabel }</Button>
                    </div>
                </AlertDialog.Content>
            </AlertDialog.Portal>
        </AlertDialog.Root>
    )
}

export { ConfirmDialog }
