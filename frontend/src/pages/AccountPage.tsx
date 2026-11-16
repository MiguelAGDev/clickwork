// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      "My account" for the admin, which has no profile of its own: the
//      data of the account and the form to change the password.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { ChangePasswordForm } from "@/components/account/ChangePasswordForm.tsx"
import { PageHeader } from "@/components/layout/PageHeader.tsx"
import { SectionCard } from "@/components/ui/Card.tsx"
import { TextField } from "@/components/ui/Field.tsx"
import { useAuth } from "@/hooks/useAuth.ts"
import { ROLE_LABELS } from "@/lib/roles.ts"

function AccountPage() {
    const { user } = useAuth()

    if( !user ) return null     // Never happens inside ProtectedRoute.

    return (
        <>
            <PageHeader title="Mi cuenta" />

            <SectionCard title="Datos de la cuenta">
                <div className="grid gap-4 sm:grid-cols-2">
                    <TextField label="Correo electrónico" value={ user.email } disabled readOnly />
                    <TextField label="Tipo de cuenta" value={ ROLE_LABELS[ user.role ] } disabled readOnly />
                </div>
            </SectionCard>

            <ChangePasswordForm />
        </>
    )
}

export { AccountPage }
