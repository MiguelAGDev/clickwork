// Authors: 
//      * Azucena Rodriguez Flores  
//      * Miguel Angel Avila Garcia
// Description: Database queries for handling table student, intern and graduate 
// Date: May 5th 2026

// Lastest Update:
// Date:
// By: 

const pool = require('../config/db'); // Import connection

// IMPORTANT:

// 'await':                 Pause the execution until the promise resolve 

// 'promise':               Object thtat represents the result of a 'async' operation

// 'async':                 Keyword before the function it tells "this function will always return a Promise"
//                          Inside that function ecerything runs normally until you hit an await then  the execution pause until the promise resolve.
//                          Meanwhile the rest of the program (other function, events timers) keeps running.

// 'pool':                  is the MySQL connection pool 

// 'execute':               runs the SQL query with safe parameter substitution

// ' [parameter, ...] ':    Relace the '?' placeholder in the query

//


//  ** STUDENTS **  //

// Create a new student record linked to a user (app_user table)
async function createStudent( userId, { semester, stdId } ) {

    const sql = ` 
        INSERT INTO student (std_id_user, std_semester, std_id)
        VALUES (?, ?, ?)
    `;

    
    await pool.execute( sql, [ userId, semester, stdId ] );
    
};


async function findStudentByUserId( userId ){

    const sql = `
    SELECT
        au.ap_usr_id            AS id,
        au.ap_usr_email         AS email,
        au.ap_usr_phone         AS phone,
        au.ap_usr_cv_url        AS resume_url,
        au.ap_usr_active        AS active,
        s.std_semester          AS semester,
        s.std_id                AS stdId,
        c.car_id                AS careerId,
        c.car_name              AS careerName
    FROM student s
    JOIN app_user au ON au.ap_usr_id = s.std_id_user
    LEFT JOIN careers c ON c.car_id = au.ap_usr_id_career
    WHERE s.std_id_user = ?
    `;

    const [rows] = await pool.execute(sql, [userId]);
    return rows[0] ?? null;

};


async function updateStudent( userId, {semester} ){

    const sql = `
        UPDATE student
        SET std_semester = ? 
        WHERE std_id_user = ? 
    `; 

    const [ result ] = await pool.execute( sql, [ semester, userId ] );
    return result.affectedRows;
    
}


// INTERN QUERIES

async function createIntern ( userId, {
                                hostCompany = null, project = null, 
                                startDate = null, endDate = null 
                            }){
  

    const sql = `
        INSERT INTO intern (itn_id_user, itn_host_company, itn_project, itn_start_date, itn_end_date)
        VALUES ( ?, ?, ?, ?, ? )
    `;

    await pool.execute( sql, [ userId, hostCompany, project, startDate, endDate ] );
            
};



async function findInternByUserId ( userId ){

    const sql = `
        SELECT
            au.ap_usr_id            AS id,
            au.ap_usr_email         AS email,
            au.ap_usr_phone         AS phone,
            au.ap_usr_cv_url        AS resume_url,
            au.ap_usr_active        AS active,
            i.itn_host_company      AS host_company,
            i.itn_project           AS project,
            i.itn_start_date        AS start_date,
            i.itn_end_date          AS end_date,
            c.car_id                AS career_id,
            c.car_name              AS career_name
        FROM intern i
        JOIN app_user au ON au.ap_usr_id = i.itn_id_user
        LEFT JOIN careers c ON c.car_id = au.ap_usr_id_career
        WHERE i.itn_id_user = ?

    `;

    const [ rows ] = await pool.execute( sql, [ userId ] );

    return rows[0] ?? null;

};


async function updateIntern( userId, { hostCompany, project, endDate } ) {

    const sql = `
        UPDATE intern
        SET
            itn_host_company    = ?,
            itn_project         = ?,
            itn_end_date        = ? 
        WHERE itn_id_user = ? 
    `; 

    const [ result ] = await pool.execute(
                        sql, 
                        [ hostCompany ?? null, project ?? null, 
                        endDate ?? null, userId ] 
                    );
    
    return result.affectedRows;

};

// GRADUATE

async function createGraduate( userId, { graduationYear, currentJob = null } ) {

    const sql = `
        INSERT INTO graduate 
                (grd_id_user, grd_graduation_year, grd_current_job)
        VALUES (?, ?, ?) 
    `;

    await pool.execute( sql, [userId, graduationYear, currentJob ] );
    
};

async function findGraduateByUserId( userId ) {

    const sql = `
        SELECT
            au.ap_usr_id                AS id,
            au.ap_usr_email             AS email,
            au.ap_usr_phone             AS phone,
            au.ap_usr_cv_url            AS resume_url,
            au.ap_usr_active            AS active,
            g.grd_graduation_year       AS graduation_year,
            g.grd_current_job           AS current_job,
            c.car_id                    AS career_id,
            c.car_name                  AS career_name
        FROM graduate g
        JOIN app_user au ON au.ap_usr_id = g.grd_id_user
        LEFT JOIN careers c ON c.car_id = au.ap_usr_id_career
        WHERE g.grd_id_user = ?
    `;

    const [ rows ] = await pool.execute( sql, [ userId ] );
    return rows[0] ?? null;
    
};

async function updateGraduate( userId, { currentJob } ) {
  
    const sql = `
        UPDATE graduate
        SET grd_current_job = ?
        WHERE grd_id_user = ?
    `;

    const [ result ] = await pool.execute( sql, [ currentJob ?? null, userId ] );
    return result.affectedRows;
};


module.exports = {

    // STUDENT 
    createStudent,
    findStudentByUserId,
    updateStudent,

    // INTERN 
    createIntern,
    findInternByUserId ,
    updateIntern,

    // GRADUATE
    createGraduate,
    findGraduateByUserId,
    updateGraduate,
}

