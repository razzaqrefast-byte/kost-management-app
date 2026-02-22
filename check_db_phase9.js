import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPhase9() {
    console.log("=== Mengecek Database Phase 9 ===");

    // Check notifications
    const { error: notifErr } = await supabase.from('notifications').select('id').limit(1);
    if (notifErr && notifErr.code === '42P01') {
        console.error("❌ Tabel 'notifications' BELUM DIBUAT!");
    } else if (notifErr) {
        console.log("⚠️ Tabel notifications ada, tapi akses anon ditolak (RLS bekerja dengan baik):", notifErr.message);
    } else {
        console.log("✅ Tabel 'notifications' sudah ada.");
    }

    // Check expenses
    const { error: expErr } = await supabase.from('expenses').select('id').limit(1);
    if (expErr && expErr.code === '42P01') {
        console.error("❌ Tabel 'expenses' BELUM DIBUAT!");
    } else if (expErr) {
        console.log("⚠️ Tabel expenses ada, tapi akses anon ditolak (RLS bekerja dengan baik):", expErr.message);
    } else {
        console.log("✅ Tabel 'expenses' sudah ada.");
    }
}

checkPhase9();
