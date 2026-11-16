// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      The screens of each role, loaded on demand. A student never opens
//      the admin screens, so their code should not travel in the first
//      download: with lazy(), the browser fetches the file of a screen
//      the first time that screen is shown.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { lazy } from "react"

// lazy() expects a module with a default export; the pages use named
// exports, so each import picks its component and hands it over as default.

// --- candidate (student, intern, graduate) ---
const CandidateHomePage = lazy( () => import( "@/pages/candidate/CandidateHomePage.tsx" ).then( ( m ) => ( { default: m.CandidateHomePage } ) ) )
const JobsPage = lazy( () => import( "@/pages/candidate/JobsPage.tsx" ).then( ( m ) => ( { default: m.JobsPage } ) ) )
const JobDetailPage = lazy( () => import( "@/pages/candidate/JobDetailPage.tsx" ).then( ( m ) => ( { default: m.JobDetailPage } ) ) )
const ApplicationsPage = lazy( () => import( "@/pages/candidate/ApplicationsPage.tsx" ).then( ( m ) => ( { default: m.ApplicationsPage } ) ) )
const ProfilePage = lazy( () => import( "@/pages/candidate/ProfilePage.tsx" ).then( ( m ) => ( { default: m.ProfilePage } ) ) )

// --- company ---
const CompanyHomePage = lazy( () => import( "@/pages/company/CompanyHomePage.tsx" ).then( ( m ) => ( { default: m.CompanyHomePage } ) ) )
const CompanyJobsPage = lazy( () => import( "@/pages/company/CompanyJobsPage.tsx" ).then( ( m ) => ( { default: m.CompanyJobsPage } ) ) )
const JobFormPage = lazy( () => import( "@/pages/company/JobFormPage.tsx" ).then( ( m ) => ( { default: m.JobFormPage } ) ) )
const ApplicantsPage = lazy( () => import( "@/pages/company/ApplicantsPage.tsx" ).then( ( m ) => ( { default: m.ApplicantsPage } ) ) )
const CompanyProfilePage = lazy( () => import( "@/pages/company/CompanyProfilePage.tsx" ).then( ( m ) => ( { default: m.CompanyProfilePage } ) ) )

// --- admin ---
const AdminHomePage = lazy( () => import( "@/pages/admin/AdminHomePage.tsx" ).then( ( m ) => ( { default: m.AdminHomePage } ) ) )
const AdminCompaniesPage = lazy( () => import( "@/pages/admin/AdminCompaniesPage.tsx" ).then( ( m ) => ( { default: m.AdminCompaniesPage } ) ) )
const AdminJobsPage = lazy( () => import( "@/pages/admin/AdminJobsPage.tsx" ).then( ( m ) => ( { default: m.AdminJobsPage } ) ) )
const AdminUsersPage = lazy( () => import( "@/pages/admin/AdminUsersPage.tsx" ).then( ( m ) => ( { default: m.AdminUsersPage } ) ) )
const AccountPage = lazy( () => import( "@/pages/AccountPage.tsx" ).then( ( m ) => ( { default: m.AccountPage } ) ) )

export {
    CandidateHomePage,
    JobsPage,
    JobDetailPage,
    ApplicationsPage,
    ProfilePage,
    CompanyHomePage,
    CompanyJobsPage,
    JobFormPage,
    ApplicantsPage,
    CompanyProfilePage,
    AdminHomePage,
    AdminCompaniesPage,
    AdminJobsPage,
    AdminUsersPage,
    AccountPage,
}
