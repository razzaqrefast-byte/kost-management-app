import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use service role key if available, else anon
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in environment.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTests() {
    console.log("=== Memulai Pengujian Phase 8 (Backend) ===");

    // 1. Cek User (Dapatkan user pertama untuk testing)
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();

    if (userError || !users?.users || users.users.length === 0) {
        console.error("Gagal mendapatkan user untuk test atau belum ada user terdaftar. Menjalankan pengujian tanpa data user spesifik...");
        // Fallback if no admin access
    }

    const tenantId = users?.users?.[0]?.id; // Just pick the first one for simulation
    const ownerId = users?.users?.[1]?.id || tenantId;

    // 2. Test Tabel Properties (Koordinat)
    console.log("\\n[1] Menguji Update Koordinat Properti...");
    const { data: props, error: fetchPropErr } = await supabase.from('properties').select('id, name').limit(1);
    if (fetchPropErr || !props || props.length === 0) {
        console.error("Tidak ada data properti untuk diuji.");
    } else {
        const propId = props[0].id;
        const { error: updatePropErr } = await supabase.from('properties').update({ latitude: -6.200000, longitude: 106.816666 }).eq('id', propId);
        if (updatePropErr) {
            console.error("❌ Gagal update koordinat properti:", updatePropErr.message);
        } else {
            console.log(`✅ Berhasil update latitude/longitude pada properti ${props[0].name}.`);
        }
    }

    // 3. Test Room Manual Status
    console.log("\\n[2] Menguji Update Status Kamar (Manual Availability)...");
    const { data: rooms, error: fetchRoomErr } = await supabase.from('rooms').select('id, name, property_id').limit(1);
    if (fetchRoomErr || !rooms || rooms.length === 0) {
        console.error("Tidak ada data kamar untuk diuji.");
    } else {
        const roomId = rooms[0].id;
        const { error: updateRoomErr } = await supabase.from('rooms').update({ manual_status: 'maintenance' }).eq('id', roomId);
        if (updateRoomErr) {
            console.error("❌ Gagal update status kamar:", updateRoomErr.message);
        } else {
            console.log(`✅ Berhasil update manual_status kamar ${rooms[0].name} menjadi 'maintenance'.`);
        }
    }

    // 4. Test Kolom Cost pada maintenance_requests
    console.log("\\n[3] Menguji Kolom 'cost' di Maintenance Requests...");
    const { error: checkCostErr } = await supabase.from('maintenance_requests')
        .select('cost')
        .limit(1);
    if (checkCostErr) {
        if (checkCostErr.message.includes('column "cost" does not exist') || checkCostErr.code === 'PGRST204') {
            console.error("❌ Kolom 'cost' TIDAK DITEMUKAN. Anda BELUM menjalankan setup_phase8.sql di database Supabase Anda!");
        } else {
            console.error("❌ Gagal cek kolom cost:", checkCostErr.message);
        }
    } else {
        console.log("✅ Kolom 'cost' ditemukan pada maintenance_requests. (Siap untuk hitung Laba Bersih)");
    }

    // 5. Test Tabel Wishlists
    console.log("\\n[4] Menguji Tabel Wishlists...");
    const { error: checkWishlistErr } = await supabase.from('wishlists').select('id').limit(1);
    if (checkWishlistErr) {
        if (checkWishlistErr.message.includes('relation "wishlists" does not exist') || checkWishlistErr.code === '42P01') {
            console.error("❌ Tabel 'wishlists' TIDAK DITEMUKAN. Anda BELUM menjalankan setup_phase8.sql di database Supabase Anda!");
        } else {
            console.error("❌ Gagal akses tabel wishlists:", checkWishlistErr.message);
        }
    } else {
        console.log("✅ Tabel 'wishlists' ditemukan dan dapat diakses.");
        // Simulasikan insert wishlist
        if (tenantId && props && props.length > 0) {
            console.log("   Mencoba menyimpan wishlist...");
            const { error: insertWishlistErr } = await supabase.from('wishlists').insert({
                tenant_id: tenantId,
                property_id: props[0].id
            });
            if (insertWishlistErr && !insertWishlistErr.message.includes('duplicate')) {
                console.error("   ❌ Gagal insert ke wishlists:", insertWishlistErr.message);
            } else {
                console.log("   ✅ Berhasil insert test data ke wishlists (atau data sudah ada).");
            }
        }
    }

    console.log("\\n=== Pengujian Selesai ===");
    if (checkCostErr || checkWishlistErr) {
        console.log("\\n⚠️ PERHATIAN: Beberapa error ditemukan. Harap pastikan tabel & kolom migrasi Phase 8 sudah dibuat.");
    } else {
        console.log("\\n🎉 Semua skema backend Phase 8 telah berfungsi dengan baik.");
    }
}

runTests();
