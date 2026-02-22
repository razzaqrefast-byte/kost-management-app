const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase with Service Role Key for testing or Anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey
);

async function runTests() {
    console.log('--- Memulai Test Backend Phase 9 ---');

    // 1. Dapatkan Owner dan Tenant (Dummy)
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    if (userError || !users.users || users.users.length < 2) {
        console.error('Gagal mendapatkan users atau jumlah user < 2. Pastikan ada user di database.', userError);
        return;
    }
    const ownerId = users.users[0].id; // Asumsi user pertama adalah owner
    const tenantId = users.users[1].id; // Asumsi user kedua adalah tenant

    // --- TEST 1: MANUAL EXPENSES ---
    console.log('\n[TEST 1] Creating Manual Expense...');
    const { data: expense, error: err1 } = await supabase
        .from('expenses')
        .insert({
            owner_id: ownerId,
            category: 'Listrik',
            amount: 150000,
            expense_date: new Date().toISOString(),
            description: 'Test pengeluaran bulanan'
        })
        .select()
        .single();

    if (err1) {
        console.error('❌ Gagal membuat pengeluaran:', err1);
    } else {
        console.log(`✅ Berhasil membuat pengeluaran: Rp ${expense.amount} (${expense.category})`);
    }

    // --- TEST 2: CREATE NOTIFICATION ---
    console.log('\n[TEST 2] Creating Notification...');
    const { data: notif, error: err2 } = await supabase
        .from('notifications')
        .insert({
            user_id: tenantId,
            title: 'Test Notifikasi Khusus',
            message: 'Ini adalah notifikasi testing otomatis dari sistem.',
            link: '/tenant',
            is_read: false
        })
        .select()
        .single();

    if (err2) {
        console.error('❌ Gagal membuat notifikasi:', err2);
    } else {
        console.log(`✅ Berhasil membuat notifikasi: "${notif.title}" for user ${tenantId}`);
    }

    // --- TEST 3: MARK NOTIFICATION AS READ ---
    console.log('\n[TEST 3] Marking Notification as Read...');
    if (notif) {
        const { data: updatedNotif, error: err3 } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notif.id)
            .select()
            .single();

        if (err3) {
            console.error('❌ Gagal mengupdate status notifikasi:', err3);
        } else {
            console.log(`✅ Berhasil menandai notifikasi sebagai terbaca (is_read: ${updatedNotif.is_read})`);
        }
    }

    console.log('\n--- Selesai Backend Test Phase 9 ---');
}

runTests();
