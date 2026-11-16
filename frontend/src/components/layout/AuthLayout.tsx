// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Frame of the public screens (design "D2 · azul + dorado"): a navy
//      panel with the brand and the slogan on the left, and the form of
//      the current route on the right.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { Outlet } from "react-router-dom"

import { Logo } from "@/components/layout/Logo.tsx"

function AuthLayout() {
    return (
        <div className="flex min-h-screen bg-background">

            {/* Brand panel. Only on wide screens: on a phone it would push
                the form below the fold. */}
            <aside className="relative hidden flex-[1.3] flex-col justify-between overflow-hidden bg-panel p-14 lg:flex">
                <svg
                    aria-hidden
                    className="absolute -right-30 -bottom-30 opacity-35"
                    width="480" height="480" viewBox="0 0 24 24" fill="none"
                    stroke="oklch(0.98 0.01 90 / 60%)" strokeWidth="0.4"
                >
                    <circle cx="12" cy="12" r="11" />
                    <circle cx="12" cy="12" r="8" />
                    <circle cx="12" cy="12" r="5" />
                </svg>

                <Logo size={ 26 } className="relative text-[17px] font-semibold" />

                {/* A <p>, not a heading: the title of the page is the one
                    of the form ("Inicia sesión"), this is decoration. */}
                <p className="relative text-[72px] leading-[0.95] font-extrabold tracking-[-0.04em] text-panel-foreground xl:text-[96px]">
                    Consigue<br />tu lugar.
                </p>

                <p className="relative max-w-[380px] text-[15px] leading-normal text-panel-muted">
                    La bolsa de trabajo y residencias profesionales del instituto — para estudiantes,
                    egresados y las empresas que los buscan.
                </p>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                {/* Small brand bar that replaces the panel on narrow screens. */}
                <div className="bg-panel px-5 py-4 lg:hidden">
                    <Logo />
                </div>

                <main className="flex flex-1 items-center justify-center px-5 py-10 sm:p-12">
                    <div className="flex w-full max-w-[380px] flex-col gap-[22px]">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}

export { AuthLayout }
