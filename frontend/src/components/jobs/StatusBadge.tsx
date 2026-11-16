// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Badges that show a status with its Spanish name and color: the
//      status of an application and the review status of a company or
//      a job posting.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { Badge } from "@/components/ui/Badge.tsx"
import {
    APPLICATION_STATUS_LABELS,
    APPLICATION_STATUS_TONES,
    APPROVAL_STATUS_LABELS,
    APPROVAL_STATUS_TONES,
} from "@/lib/labels.ts"
import type { ApplicationStatus, ApprovalStatus } from "@/types/models.ts"

function ApplicationStatusBadge( { status }: { status: ApplicationStatus } ) {
    return <Badge tone={ APPLICATION_STATUS_TONES[ status ] }>{ APPLICATION_STATUS_LABELS[ status ] }</Badge>
}

function ApprovalStatusBadge( { status }: { status: ApprovalStatus } ) {
    return <Badge tone={ APPROVAL_STATUS_TONES[ status ] }>{ APPROVAL_STATUS_LABELS[ status ] }</Badge>
}

export { ApplicationStatusBadge, ApprovalStatusBadge }
