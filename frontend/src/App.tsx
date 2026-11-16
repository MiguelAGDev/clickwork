// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Root component of the app: the route table. It says, for each
//      URL, which screen renders and who is allowed to see it.
//
// Date: September 24th 2026

// Latest Update: Replace the placeholders with the real route table:
//      public screens inside AuthLayout, private ones inside AppShell,
//      each group behind its guard.
// Date: November 16th 2026
// By: Miguel Angel Avila Garcia

import { Navigate, Route, Routes } from "react-router-dom"

import { AppShell } from "@/components/layout/AppShell.tsx"
import { AuthLayout } from "@/components/layout/AuthLayout.tsx"
import { ProtectedRoute, PublicOnlyRoute } from "@/components/routing/ProtectedRoute.tsx"
import { CANDIDATE_ROLES } from "@/lib/roles.ts"
import { ForgotPasswordPage, ResendVerificationPage } from "@/pages/auth/EmailRequestPage.tsx"
import { LoginPage } from "@/pages/auth/LoginPage.tsx"
import { RegisterPage } from "@/pages/auth/RegisterPage.tsx"
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage.tsx"
import { VerifyEmailPage } from "@/pages/auth/VerifyEmailPage.tsx"
import { DashboardPage } from "@/pages/DashboardPage.tsx"
import { InfoPage } from "@/pages/InfoPage.tsx"
// The screens of each role load on demand (see lazyPages.ts). The public
// screens above are imported normally: they are the first thing a visitor
// sees, so they travel in the first download.
import {
    AccountPage,
    AdminCompaniesPage,
    AdminJobsPage,
    AdminUsersPage,
    ApplicantsPage,
    ApplicationsPage,
    CompanyJobsPage,
    CompanyProfilePage,
    JobDetailPage,
    JobFormPage,
    JobsPage,
    ProfilePage,
} from "@/pages/lazyPages.ts"
import { NotFoundPage } from "@/pages/NotFoundPage.tsx"

// Component: a TS function that returns JSX (a description of what should
// show on screen). React calls it every time it needs to know what to paint.
function App() {

    // A <Route> with "element" and no "path" is a layout route: it wraps
    // the routes nested inside it (guards and frames work this way) and
    // renders them where it places <Outlet />.
    //
    // /login, /dashboard, /verify/:token and /reset-password/:token are the
    // URLs the backend writes in its emails: they must keep these exact paths.
    return (
        <Routes>

            {/* Public screens, only for visitors without a session. */}
            <Route element={ <PublicOnlyRoute /> }>
                <Route element={ <AuthLayout /> }>
                    <Route path="/login" element={ <LoginPage /> } />
                    <Route path="/register" element={ <RegisterPage /> } />
                    <Route path="/forgot-password" element={ <ForgotPasswordPage /> } />
                    <Route path="/resend-verification" element={ <ResendVerificationPage /> } />
                </Route>
            </Route>

            {/* Links from emails: they work with or without a session. */}
            <Route element={ <AuthLayout /> }>
                <Route path="/verify/:token" element={ <VerifyEmailPage /> } />
                <Route path="/reset-password/:token" element={ <ResetPasswordPage /> } />
            </Route>

            {/* Everything behind the login, inside the header + footer frame. */}
            <Route element={ <ProtectedRoute /> }>
                <Route element={ <AppShell /> }>
                    <Route path="/dashboard" element={ <DashboardPage /> } />
                    <Route path="/help" element={ <InfoPage topic="help" /> } />
                    <Route path="/privacy" element={ <InfoPage topic="privacy" /> } />
                    <Route path="/terms" element={ <InfoPage topic="terms" /> } />

                    {/* Candidates: student, intern and graduate. */}
                    <Route element={ <ProtectedRoute roles={ CANDIDATE_ROLES } /> }>
                        <Route path="/jobs" element={ <JobsPage /> } />
                        <Route path="/jobs/:id" element={ <JobDetailPage /> } />
                        <Route path="/applications" element={ <ApplicationsPage /> } />
                        <Route path="/profile" element={ <ProfilePage /> } />
                    </Route>

                    <Route element={ <ProtectedRoute roles={ [ "company" ] } /> }>
                        <Route path="/company/jobs" element={ <CompanyJobsPage /> } />
                        <Route path="/company/jobs/new" element={ <JobFormPage /> } />
                        <Route path="/company/jobs/:id/edit" element={ <JobFormPage /> } />
                        <Route path="/company/jobs/:id/applicants" element={ <ApplicantsPage /> } />
                        <Route path="/company/profile" element={ <CompanyProfilePage /> } />
                    </Route>

                    <Route element={ <ProtectedRoute roles={ [ "admin" ] } /> }>
                        <Route path="/admin/companies" element={ <AdminCompaniesPage /> } />
                        <Route path="/admin/jobs" element={ <AdminJobsPage /> } />
                        <Route path="/admin/users" element={ <AdminUsersPage /> } />
                        <Route path="/account" element={ <AccountPage /> } />
                    </Route>
                </Route>
            </Route>

            {/* "/" has no screen of its own. /dashboard is protected, so a
                visitor without a session ends up in /login. */}
            <Route path="/" element={ <Navigate to="/dashboard" replace /> } />

            <Route path="*" element={ <NotFoundPage /> } />
        </Routes>
    )
}

export { App }
