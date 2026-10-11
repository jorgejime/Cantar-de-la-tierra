// Script para crear el usuario administrador en Supabase
// Ejecutar: node scripts/createSupabaseAdmin.mjs

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yeieiesfigbufsfzpitg.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'REEMPLAZA_CON_SERVICE_ROLE_KEY';

// IMPORTANTE: Usa la SERVICE ROLE KEY (no la anon key) para crear usuarios
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@cantardelatierra.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'CantarAdmin2026!';

async function createAdmin() {
    console.log('🌿 Creando usuario administrador en Supabase...');
    console.log(`📧 Email: ${ADMIN_EMAIL}`);

    const { data, error } = await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: { name: 'Administrador', role: 'admin' }
    });

    if (error) {
        console.error('❌ Error:', error.message);
        return;
    }

    console.log('✅ Usuario creado:', data.user.id);

    // Register in admin_users table
    const { error: dbError } = await supabase.from('admin_users').insert({
        user_id: data.user.id,
        email: ADMIN_EMAIL,
        name: 'Administrador',
        role: 'super_admin'
    });

    if (dbError) {
        console.error('⚠️  Error registrando en tabla admin_users:', dbError.message);
    } else {
        console.log('✅ Registrado en tabla admin_users');
    }

    console.log('\n🎉 ¡Listo! Credenciales del backoffice:');
    console.log(`   URL: http://localhost:5173/#/backoffice/login`);
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
}

createAdmin();
