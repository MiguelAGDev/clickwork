// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Tells a company where its registration stands. A company can only
//      publish job postings once an admin approved it, so every company
//      screen shows this until that happens.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { Link } from "react-router-dom"

import { Alert } from "@/components/ui/Alert.tsx"
import type { Company } from "@/types/models.ts"

function CompanyStatusBanner( { company }: { company: Company } ) {
    if( company.approvalStatus === "approved" ) return null

    if( company.approvalStatus === "pending" ) {
        return (
            <Alert tone="info" title="Tu empresa está en revisión">
                Un administrador está revisando tu registro. Podrás publicar vacantes en cuanto la apruebe.
            </Alert>
        )
    }

    return (
        <Alert tone="error" title="Tu empresa fue rechazada">
            { company.rejectionReason
                ? <>Motivo: { company.rejectionReason } </>
                : "El administrador no indicó un motivo. " }
            Puedes corregir tus datos en el{ " " }
            <Link to="/company/profile" className="font-bold underline">perfil de la empresa</Link>;
            después un administrador debe revisarla de nuevo.
        </Alert>
    )
}

export { CompanyStatusBanner }
