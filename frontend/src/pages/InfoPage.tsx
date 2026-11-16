// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Destination of the three footer links (Ayuda, Privacidad,
//      Términos). The real texts are not written yet, so each page says
//      so instead of leaving a dead link.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { PageHeader } from "@/components/layout/PageHeader.tsx"
import { Card } from "@/components/ui/Card.tsx"

type InfoTopic = "help" | "privacy" | "terms"

const TOPICS: Record<InfoTopic, { title: string, body: string }> = {
    help: {
        title: "Ayuda",
        body: "La sección de ayuda de ClickWork está en preparación y se publicará aquí.",
    },
    privacy: {
        title: "Privacidad",
        body: "El aviso de privacidad de ClickWork está en preparación y se publicará aquí.",
    },
    terms: {
        title: "Términos",
        body: "Los términos y condiciones de uso de ClickWork están en preparación y se publicarán aquí.",
    },
}

function InfoPage( { topic }: { topic: InfoTopic } ) {
    const { title, body } = TOPICS[ topic ]

    return (
        <>
            <PageHeader title={ title } />
            <Card className="p-6 text-sm leading-relaxed text-foreground">{ body }</Card>
        </>
    )
}

export { InfoPage }
