import { create, findByUserId, update, updateApprovalStatus, getPending } from '../models/companyModel.js';

async function runTests() {
    console.log('🧪 Iniciando pruebas de companyModel...\n');

    const fakeUserId = 1;

    try {
        console.log('📌 TEST 1: create()');
        const insertId = await create(fakeUserId, {   // 👈 sin companyModel.
            cmp_name:          'Empresa Test SA',
            cmp_size:          '50-100',
            cmp_industry:      'Tecnología',
            cmp_city:          'Ciudad de México',
            cmp_state:         'CDMX',
            cmp_address:       'Av. Reforma 123',
            cmp_contact_email: 'test@empresa.com'
        });
        console.log('✅ create() OK — insertId:', insertId, '\n');
    } catch (err) {
        console.error('❌ create() FALLÓ:', err.message, '\n');
    }

    try {
        console.log('📌 TEST 2: findByUserId()');
        const company = await findByUserId(fakeUserId);  // 👈 sin companyModel.
        console.log('✅ findByUserId() OK:', company, '\n');
    } catch (err) {
        console.error('❌ findByUserId() FALLÓ:', err.message, '\n');
    }

    try {
        console.log('📌 TEST 3: update()');
        const affected = await update(fakeUserId, {   // 👈 sin companyModel.
            cmp_name:          'Empresa Actualizada SA',
            cmp_size:          '100-500',
            cmp_industry:      'Fintech',
            cmp_city:          'Monterrey',
            cmp_state:         'NL',
            cmp_address:       'Av. Constitución 456',
            cmp_contact_email: 'nuevo@empresa.com'
        });
        console.log('✅ update() OK — affectedRows:', affected, '\n');
    } catch (err) {
        console.error('❌ update() FALLÓ:', err.message, '\n');
    }

    try {
        console.log('📌 TEST 4: updateApprovalStatus() → approved');
        const affected = await updateApprovalStatus(fakeUserId, 'approved', null);  // 👈
        console.log('✅ updateApprovalStatus(approved) OK — affectedRows:', affected, '\n');
    } catch (err) {
        console.error('❌ updateApprovalStatus(approved) FALLÓ:', err.message, '\n');
    }

    try {
        console.log('📌 TEST 5: updateApprovalStatus() → rejected');
        const affected = await updateApprovalStatus(fakeUserId, 'rejected', 'Documentación incompleta');  // 👈
        console.log('✅ updateApprovalStatus(rejected) OK — affectedRows:', affected, '\n');
    } catch (err) {
        console.error('❌ updateApprovalStatus(rejected) FALLÓ:', err.message, '\n');
    }

    try {
        console.log('📌 TEST 6: updateApprovalStatus() → status inválido (debe lanzar error)');
        await updateApprovalStatus(fakeUserId, 'banana', null);  // 👈
        console.error('❌ Debió haber lanzado error pero no lo hizo\n');
    } catch (err) {
        console.log('✅ Error esperado capturado:', err.message, '\n');
    }

    try {
        console.log('📌 TEST 7: updateApprovalStatus() → rejected sin reason (debe lanzar error)');
        await updateApprovalStatus(fakeUserId, 'rejected', null);  // 👈
        console.error('❌ Debió haber lanzado error pero no lo hizo\n');
    } catch (err) {
        console.log('✅ Error esperado capturado:', err.message, '\n');
    }

    try {
        console.log('📌 TEST 8: getPending()');
        await updateApprovalStatus(fakeUserId, 'pending', null);  // 👈
        const pending = await getPending();  // 👈
        console.log('✅ getPending() OK — total pending:', pending.length, '\n');
    } catch (err) {
        console.error('❌ getPending() FALLÓ:', err.message, '\n');
    }

    console.log('🧹 Recuerda eliminar el registro de prueba con:');
    console.log(`   DELETE FROM company WHERE cmp_id_user = ${fakeUserId};\n`);

    process.exit(0);
};

runTests();