import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const {
    create,
    getById,
    getByCompany,
    getAll,
    attachCareers,
    detachCareers,
    update,
    updateApprovalStatus,
    getPending
} = require('../models/jobPostingModel.cjs');

const runTests = async () => {
    console.log('🧪 Iniciando pruebas de jobPostingModel...\n');

    const companyId = 1; // 👈 un userId que tenga empresa registrada en tu DB
    let jobId = null;    // se llenará con el insertId del TEST 1

    // ─── TEST 1: create ───────────────────────────────────────────
    try {
        console.log('📌 TEST 1: create()');
        jobId = await create(companyId, {
            jb_pst_job_title:        'Desarrollador Backend',
            jb_pst_requirements:     'Node.js, MySQL',
            jb_pst_benefits:         'Seguro médico, home office',
            jb_pst_modality:         'remote',
            jb_pst_schedule:         'Lunes a Viernes 9-18',
            jb_pst_contract_type:    'full-time',
            jb_pst_experience_level: 'junior',
            jb_pst_publication_date: '2026-05-06',
            jb_pst_expiration_date:  '2026-06-06',
            jb_pst_salary:           15000.00,
            jb_pst_image_url:        null
        });
        console.log('✅ create() OK — insertId:', jobId, '\n');
    } catch (err) {
        console.error('❌ create() FALLÓ:', err.message, '\n');
    }

    // ─── TEST 2: getById ──────────────────────────────────────────
    try {
        console.log('📌 TEST 2: getById()');
        const job = await getById(jobId);
        console.log('✅ getById() OK:', job, '\n');
    } catch (err) {
        console.error('❌ getById() FALLÓ:', err.message, '\n');
    }

    // ─── TEST 3: getById con ID inexistente ───────────────────────
    try {
        console.log('📌 TEST 3: getById() con ID inexistente');
        const job = await getById(99999);
        console.log('✅ getById(inexistente) OK — retorna:', job, '\n'); // debe ser null
    } catch (err) {
        console.error('❌ getById(inexistente) FALLÓ:', err.message, '\n');
    }

    // ─── TEST 4: getByCompany ─────────────────────────────────────
    try {
        console.log('📌 TEST 4: getByCompany()');
        const jobs = await getByCompany(companyId);
        console.log('✅ getByCompany() OK — total:', jobs.length, '\n');
    } catch (err) {
        console.error('❌ getByCompany() FALLÓ:', err.message, '\n');
    }

    // ─── TEST 5: attachCareers ────────────────────────────────────
    try {
        console.log('📌 TEST 5: attachCareers()');
        await attachCareers(jobId, [1, 2]); // 👈 usa careerIds que existan en tu tabla careers
        console.log('✅ attachCareers() OK\n');
    } catch (err) {
        console.error('❌ attachCareers() FALLÓ:', err.message, '\n');
    }

    // ─── TEST 6: getAll sin filtros ───────────────────────────────
    try {
        console.log('📌 TEST 6: getAll() sin filtros');
        // Primero aprobamos el job para que aparezca en getAll
        await updateApprovalStatus(jobId, 'approved', null);
        const jobs = await getAll();
        console.log('✅ getAll() OK — total aprobados:', jobs.length, '\n');
    } catch (err) {
        console.error('❌ getAll() FALLÓ:', err.message, '\n');
    }

    // ─── TEST 7: getAll con filtros ───────────────────────────────
    try {
        console.log('📌 TEST 7: getAll() con filtros');
        const jobs = await getAll({
            modality:        'remote',
            contractType:    'full-time',
            experienceLevel: 'junior',
            search:          'Backend'
        });
        console.log('✅ getAll(filtros) OK — total:', jobs.length, '\n');
    } catch (err) {
        console.error('❌ getAll(filtros) FALLÓ:', err.message, '\n');
    }

    // ─── TEST 8: update ───────────────────────────────────────────
    try {
        console.log('📌 TEST 8: update()');
        const affected = await update(jobId, {
            jb_pst_job_title:        'Desarrollador Backend Senior',
            jb_pst_requirements:     'Node.js, MySQL, Docker',
            jb_pst_benefits:         'Seguro médico, bonos',
            jb_pst_modality:         'hybrid',
            jb_pst_schedule:         'Lunes a Viernes 8-17',
            jb_pst_contract_type:    'full-time',
            jb_pst_experience_level: 'senior',
            jb_pst_expiration_date:  '2026-07-01',
            jb_pst_salary:           25000.00,
            jb_pst_image_url:        null
        });
        console.log('✅ update() OK — affectedRows:', affected, '\n');
    } catch (err) {
        console.error('❌ update() FALLÓ:', err.message, '\n');
    }

    // ─── TEST 9: updateApprovalStatus → rejected ──────────────────
    try {
        console.log('📌 TEST 9: updateApprovalStatus() → rejected');
        const affected = await updateApprovalStatus(jobId, 'rejected', 'No cumple requisitos');
        console.log('✅ updateApprovalStatus(rejected) OK — affectedRows:', affected, '\n');
    } catch (err) {
        console.error('❌ updateApprovalStatus(rejected) FALLÓ:', err.message, '\n');
    }

    // ─── TEST 10: getPending ──────────────────────────────────────
    try {
        console.log('📌 TEST 10: getPending()');
        // Regresamos a pending para verlo en la lista
        await updateApprovalStatus(jobId, 'pending', null);
        const pending = await getPending();
        console.log('✅ getPending() OK — total pending:', pending.length, '\n');
    } catch (err) {
        console.error('❌ getPending() FALLÓ:', err.message, '\n');
    }

    // ─── TEST 11: detachCareers ───────────────────────────────────
    try {
        console.log('📌 TEST 11: detachCareers()');
        const affected = await detachCareers(jobId);
        console.log('✅ detachCareers() OK — affectedRows:', affected, '\n');
    } catch (err) {
        console.error('❌ detachCareers() FALLÓ:', err.message, '\n');
    }

    // ─── LIMPIEZA ─────────────────────────────────────────────────
    console.log('🧹 Recuerda eliminar el registro de prueba con:');
    console.log(`   DELETE FROM job_posting WHERE jb_pst_id = ${jobId};\n`);

    process.exit(0);
};

runTests();