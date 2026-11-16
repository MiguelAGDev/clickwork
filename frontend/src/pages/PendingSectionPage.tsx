// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Temporary screen for the sections the header already links to
//      but that are built in a later step. Removed once every section
//      has its real page.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { PageHeader } from "@/components/layout/PageHeader.tsx"
import { EmptyState } from "@/components/ui/States.tsx"

function PendingSectionPage( { title }: { title: string } ) {
    return (
        <>
            <PageHeader title={ title } />
            <EmptyState title="Sección en construcción" description="Esta pantalla estará disponible muy pronto." />
        </>
    )
}

export { PendingSectionPage }
