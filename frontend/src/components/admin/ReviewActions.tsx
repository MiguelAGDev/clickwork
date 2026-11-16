// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      The approve / reject buttons an admin uses to review a company or
//      a job posting. Rejecting opens a dialog that asks for the reason,
//      which the backend requires and the owner later reads.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { Ban, Check } from "lucide-react"
import { useId, useState } from "react"

import { Alert } from "@/components/ui/Alert.tsx"
import { Button } from "@/components/ui/Button.tsx"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog.tsx"
import { REJECTION_REASON_MAX } from "@/services/adminService.ts"
import { toApiError } from "@/services/api.ts"
import type { ApprovalStatus } from "@/types/models.ts"

interface ReviewActionsProps {
    // Name of what is being reviewed, for the dialog and the button labels.
    subject: string
    status: ApprovalStatus
    // Saves the decision. It must reject (throw) when the backend refuses.
    onDecide: ( status: ApprovalStatus, reason?: string ) => Promise<void>
}

function ReviewActions( { subject, status, onDecide }: ReviewActionsProps ) {
    const reasonId = useId()
    const [ approving, setApproving ] = useState( false )
    const [ approveError, setApproveError ] = useState<string | null>( null )

    const [ rejectOpen, setRejectOpen ] = useState( false )
    const [ reason, setReason ] = useState( "" )
    const [ rejecting, setRejecting ] = useState( false )
    const [ rejectError, setRejectError ] = useState<string | null>( null )

    async function approve() {
        setApproving( true )
        setApproveError( null )

        try {
            await onDecide( "approved" )
        } catch( caught ) {
            setApproveError( toApiError( caught ).message )
        } finally {
            setApproving( false )
        }
    }

    async function reject() {
        const trimmed = reason.trim()

        // The backend answers 400 without a reason; say it before asking.
        if( !trimmed ) {
            setRejectError( "Escribe el motivo del rechazo." )
            return
        }

        setRejecting( true )
        setRejectError( null )

        try {
            await onDecide( "rejected", trimmed )
            setRejectOpen( false )
            setReason( "" )
        } catch( caught ) {
            setRejectError( toApiError( caught ).message )
        } finally {
            setRejecting( false )
        }
    }

    function closeReject() {
        setRejectOpen( false )
        setRejectError( null )
    }

    return (
        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
            <div className="flex flex-wrap gap-2">
                {/* What is already approved can only be rejected, and the other way around. */}
                { status !== "approved" && (
                    <Button size="sm" loading={ approving } onClick={ approve } aria-label={ `Aprobar ${ subject }` }>
                        { !approving && <Check aria-hidden className="size-3.5" /> }
                        Aprobar
                    </Button>
                ) }
                { status !== "rejected" && (
                    <Button size="sm" variant="secondary" disabled={ approving } onClick={ () => setRejectOpen( true ) } aria-label={ `Rechazar ${ subject }` }>
                        <Ban aria-hidden className="size-3.5" />
                        Rechazar
                    </Button>
                ) }
            </div>

            { approveError && <Alert tone="error">{ approveError }</Alert> }

            <ConfirmDialog
                open={ rejectOpen }
                onClose={ closeReject }
                title={ `Rechazar ${ subject }` }
                description="Explica el motivo. Quien la registró lo verá para poder corregirla."
                confirmLabel="Rechazar"
                tone="danger"
                loading={ rejecting }
                error={ rejectError }
                onConfirm={ reject }
            >
                <div className="flex flex-col gap-1.5">
                    <label htmlFor={ reasonId } className="text-[13px] font-semibold text-foreground">Motivo del rechazo</label>
                    <textarea
                        id={ reasonId }
                        rows={ 4 }
                        maxLength={ REJECTION_REASON_MAX }
                        value={ reason }
                        onChange={ ( event ) => setReason( event.target.value ) }
                        className="w-full rounded-[10px] border-2 border-input bg-card px-3.5 py-3 text-sm leading-relaxed text-foreground"
                    />
                    <p className="text-right text-[12px] text-muted-foreground">{ reason.length } / { REJECTION_REASON_MAX }</p>
                </div>
            </ConfirmDialog>
        </div>
    )
}

export { ReviewActions }
