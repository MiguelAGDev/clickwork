// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Shown when a logged-in user opens a screen that belongs to
//      another role (for example a student typing an /admin URL).
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { Link } from "react-router-dom"

function ForbiddenPage() {
    return (
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-20 text-center">
            <p className="text-sm font-semibold text-link">Sin permiso</p>
            <h1 className="text-2xl font-bold text-foreground">Esta sección no está disponible para tu cuenta</h1>
            <p className="text-sm text-muted-foreground">
                Tu tipo de cuenta no tiene acceso a esta página.
            </p>
            <Link to="/dashboard" className="mt-2 text-sm font-semibold text-link underline-offset-4 hover:underline">
                Volver al inicio
            </Link>
        </div>
    )
}

export { ForbiddenPage }
