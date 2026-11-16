-- Migration: first and last name for every account.
-- Date: November 16th 2026
-- By: Miguel Angel Avila Garcia
--
-- Follows the app_user conventions: ap_usr_ prefix, varchar(150) NOT NULL
-- like the other name columns (cmp_name, car_name, jb_pst_job_title).
--
-- Existing rows: the first name is taken from the part of the email before
-- the "@" (what the UI used to greet with), the last name is left empty.
-- Both columns end up NOT NULL with no default, so the API must always send
-- them; the backend validators require non-empty values.
--
-- Run it once on each database (clickwork and clickwork_test):
--   mysql -u root clickwork < backend/migrations/2026-11-16-add-user-names.sql

ALTER TABLE app_user
    ADD COLUMN ap_usr_first_name VARCHAR(150) NOT NULL DEFAULT '' AFTER ap_usr_permissions,
    ADD COLUMN ap_usr_last_name  VARCHAR(150) NOT NULL DEFAULT '' AFTER ap_usr_first_name;

UPDATE app_user
SET ap_usr_first_name = CONCAT(
        UPPER(SUBSTRING(SUBSTRING_INDEX(SUBSTRING_INDEX(ap_usr_email, '@', 1), '.', 1), 1, 1)),
        SUBSTRING(SUBSTRING_INDEX(SUBSTRING_INDEX(ap_usr_email, '@', 1), '.', 1), 2)
    )
WHERE ap_usr_first_name = '';

ALTER TABLE app_user
    ALTER COLUMN ap_usr_first_name DROP DEFAULT,
    ALTER COLUMN ap_usr_last_name  DROP DEFAULT;

-- The audit triggers log the user columns; the names join them.
DROP TRIGGER IF EXISTS trg_user_insert;
DROP TRIGGER IF EXISTS trg_user_update;

DELIMITER $$
CREATE TRIGGER trg_user_insert AFTER INSERT ON app_user FOR EACH ROW BEGIN
    INSERT INTO audit_log (
        adt_lg_action,
        adt_lg_affected_table,
        adt_lg_id_user,
        adt_lg_logged_at,
        adt_lg_old_values,
        adt_lg_new_values
    ) VALUES (
        'INSERT',
        'app_user',
        @current_user_id,
        NOW(),
        NULL,
        JSON_OBJECT(
            'first_name',     NEW.ap_usr_first_name,
            'last_name',      NEW.ap_usr_last_name,
            'email',          NEW.ap_usr_email,
            'phone',          NEW.ap_usr_phone,
            'active',         NEW.ap_usr_active,
            'email_verified', NEW.ap_usr_email_verified,
            'cv_url',         NEW.ap_usr_cv_url,
            'id_career',      NEW.ap_usr_id_career
        )
    );
END
$$
CREATE TRIGGER trg_user_update AFTER UPDATE ON app_user FOR EACH ROW BEGIN
    INSERT INTO audit_log (
        adt_lg_action,
        adt_lg_affected_table,
        adt_lg_id_user,
        adt_lg_logged_at,
        adt_lg_old_values,
        adt_lg_new_values
    ) VALUES (
        'UPDATE',
        'app_user',
        @current_user_id,
        NOW(),
        JSON_OBJECT(
            'first_name',     OLD.ap_usr_first_name,
            'last_name',      OLD.ap_usr_last_name,
            'email',          OLD.ap_usr_email,
            'phone',          OLD.ap_usr_phone,
            'active',         OLD.ap_usr_active,
            'email_verified', OLD.ap_usr_email_verified,
            'cv_url',         OLD.ap_usr_cv_url
        ),
        JSON_OBJECT(
            'first_name',     NEW.ap_usr_first_name,
            'last_name',      NEW.ap_usr_last_name,
            'email',          NEW.ap_usr_email,
            'phone',          NEW.ap_usr_phone,
            'active',         NEW.ap_usr_active,
            'email_verified', NEW.ap_usr_email_verified,
            'cv_url',         NEW.ap_usr_cv_url
        )
    );
END
$$
DELIMITER ;
