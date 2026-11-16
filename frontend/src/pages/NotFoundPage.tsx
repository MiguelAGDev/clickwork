// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      404 screen: the URL matches no route of the app.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { Link } from "react-router-dom"

import { buttonClasses } from "@/components/ui/buttonClasses.ts"

function NotFoundPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center">
            <p className="text-sm font-semibold text-link">Error 404</p>
            <h1 className="text-[26px] font-bold tracking-[-0.01em] text-foreground">No encontramos esta página</h1>
            <p className="max-w-sm text-sm text-muted-foreground">
                El enlace puede estar mal escrito o la página ya no existe.
            </p>
            {/* "/" decides where to go: dashboard with a session, login without one. */}
            <Link to="/" className={ buttonClasses( { className: "mt-3" } ) }>Ir al inicio</Link>
        </div>
    )
}

export { NotFoundPage }
