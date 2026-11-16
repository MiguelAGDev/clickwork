// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      The frame of every screen behind the login (design "Opción A ·
//      Header superior"): navy header with the navigation of the role
//      and the user menu, the page content in the middle and the footer.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { ChevronDown, LogOut, Menu, UserRound, X } from "lucide-react"
import { DropdownMenu } from "radix-ui"
import { useState } from "react"
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom"

import { Logo } from "@/components/layout/Logo.tsx"
import { useAuth } from "@/hooks/useAuth.ts"
import { getDisplayName, getInitials } from "@/lib/displayName.ts"
import { getAccountPath, getNavItems } from "@/lib/navigation.ts"
import type { NavItem } from "@/lib/navigation.ts"
import { ROLE_LABELS } from "@/lib/roles.ts"
import { cn } from "@/lib/utils.ts"
import type { User } from "@/types/models.ts"

// Links in the header bar (desktop). Each link is as tall as the header
// so its gold underline sits on the bottom edge, as in the design.
function DesktopNav( { items }: { items: NavItem[] } ) {
    return (
        <nav aria-label="Principal" className="hidden h-full items-stretch gap-7 md:flex">
            { items.map( ( item ) => (
                <NavLink
                    key={ item.to }
                    to={ item.to }
                    end={ item.end }
                    // NavLink adds aria-current="page" to the active link;
                    // the styles hang from that attribute.
                    className="flex items-center border-b-2 border-transparent pt-0.5 text-sm font-medium text-panel-muted transition-colors hover:text-panel-foreground aria-[current=page]:border-primary aria-[current=page]:font-semibold aria-[current=page]:text-panel-foreground"
                >
                    { item.label }
                </NavLink>
            ) ) }
        </nav>
    )
}

// The same links stacked under the header (phones and small tablets).
function MobileNav( { items, onNavigate }: { items: NavItem[], onNavigate: () => void } ) {
    return (
        <nav id="mobile-nav" aria-label="Principal" className="flex flex-col border-t border-white/10 bg-panel px-4 py-2 md:hidden">
            { items.map( ( item ) => (
                <NavLink
                    key={ item.to }
                    to={ item.to }
                    end={ item.end }
                    onClick={ onNavigate }
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-panel-muted aria-[current=page]:bg-white/10 aria-[current=page]:font-semibold aria-[current=page]:text-panel-foreground"
                >
                    { item.label }
                </NavLink>
            ) ) }
        </nav>
    )
}

// Gold avatar with the user initials; opens the account menu.
function UserMenu( { user }: { user: User } ) {
    const { logout } = useAuth()
    const navigate = useNavigate()
    const name = getDisplayName( user.email )

    function handleLogout() {
        logout()
        navigate( "/login", { replace: true } )
    }

    const itemClasses = "flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-foreground outline-none data-[highlighted]:bg-muted"

    return (
        // Radix handles what a menu needs to be usable with a keyboard and
        // a screen reader: focus, arrow keys, Escape, click outside.
        <DropdownMenu.Root>
            <DropdownMenu.Trigger
                aria-label="Menú de usuario"
                className="flex cursor-pointer items-center gap-2 rounded-full p-0.5 text-panel-muted"
            >
                <span aria-hidden className="flex size-8 items-center justify-center rounded-full bg-primary text-[13px] font-bold text-primary-foreground">
                    { getInitials( name ) }
                </span>
                <ChevronDown aria-hidden className="size-3.5" />
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    align="end"
                    sideOffset={ 10 }
                    className="z-50 min-w-56 rounded-xl border border-border bg-popover p-1.5 shadow-lg"
                >
                    <div className="px-2.5 py-2">
                        <p className="truncate text-sm font-bold text-foreground">{ user.email }</p>
                        <p className="text-[12.5px] text-muted-foreground">{ ROLE_LABELS[ user.role ] }</p>
                    </div>
                    <DropdownMenu.Separator className="my-1 h-px bg-border" />
                    <DropdownMenu.Item asChild>
                        <Link to={ getAccountPath( user.role ) } className={ itemClasses }>
                            <UserRound aria-hidden className="size-4 text-muted-foreground" />
                            Mi cuenta
                        </Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onSelect={ handleLogout } className={ itemClasses }>
                        <LogOut aria-hidden className="size-4 text-muted-foreground" />
                        Cerrar sesión
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    )
}

function Footer() {
    const linkClasses = "font-medium text-muted-foreground hover:text-foreground"

    return (
        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-border bg-card px-4 py-[18px] text-xs sm:px-8">
            <span className="text-muted-foreground">© { new Date().getFullYear() } ClickWork</span>
            <nav aria-label="Legal" className="flex gap-[22px]">
                <Link to="/help" className={ linkClasses }>Ayuda</Link>
                <Link to="/privacy" className={ linkClasses }>Privacidad</Link>
                <Link to="/terms" className={ linkClasses }>Términos</Link>
            </nav>
        </footer>
    )
}

function AppShell() {
    const { user } = useAuth()
    const [ menuOpen, setMenuOpen ] = useState( false )

    // The shell only renders inside ProtectedRoute, so there is always a
    // user here. This check is for TypeScript, which cannot know that.
    if( !user ) return null

    const items = getNavItems( user.role )

    return (
        <div className="flex min-h-screen flex-col bg-background">
            {/* First thing a keyboard user reaches: jump over the header. */}
            <a
                href="#main"
                className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-card focus:px-3 focus:py-2 focus:text-sm focus:font-semibold"
            >
                Saltar al contenido
            </a>

            <header className="shrink-0 bg-panel">
                <div className="flex h-[68px] items-center justify-between px-4 sm:px-8">
                    <div className="flex h-full items-center gap-10">
                        <Link to="/dashboard" aria-label="ClickWork, ir al inicio">
                            <Logo />
                        </Link>
                        <DesktopNav items={ items } />
                    </div>

                    <div className="flex items-center gap-3">
                        <UserMenu user={ user } />
                        <button
                            type="button"
                            aria-label={ menuOpen ? "Cerrar menú" : "Abrir menú" }
                            aria-expanded={ menuOpen }
                            aria-controls="mobile-nav"
                            onClick={ () => setMenuOpen( ( open ) => !open ) }
                            className={ cn( "flex size-9 items-center justify-center rounded-lg text-panel-foreground md:hidden" ) }
                        >
                            { menuOpen ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" /> }
                        </button>
                    </div>
                </div>

                { menuOpen && <MobileNav items={ items } onNavigate={ () => setMenuOpen( false ) } /> }
            </header>

            <main id="main" className="flex-1 px-4 pt-9 pb-14 sm:px-8">
                {/* Design: content column of 1100px with 28px between blocks. */}
                <div className="mx-auto flex max-w-[1100px] flex-col gap-7">
                    <Outlet />
                </div>
            </main>

            <Footer />
        </div>
    )
}

export { AppShell }
