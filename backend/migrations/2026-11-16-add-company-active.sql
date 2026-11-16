-- Migration: a company can pause itself without losing its account.
-- Date: November 16th 2026
-- By: Miguel Angel Avila Garcia
--
-- Before this, PATCH /api/company/toggle-active flipped ap_usr_active, the
-- flag of the whole account: once off, the company could not log in again
-- and only an admin could bring it back. cmp_active is a flag of the
-- company itself: while it is 0 the postings of the company leave the
-- public listing, but the account keeps working and can turn it back on.
--
-- Same style as ap_usr_active: tinyint(1) NOT NULL DEFAULT 1.
--
-- Run it once on each database (clickwork and clickwork_test):
--   mysql -u root clickwork < backend/migrations/2026-11-16-add-company-active.sql

ALTER TABLE company
    ADD COLUMN cmp_active TINYINT(1) NOT NULL DEFAULT 1 AFTER cmp_rejection_reason;
