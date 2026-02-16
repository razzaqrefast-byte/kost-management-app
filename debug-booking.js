const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function debugBooking() {
    const envPath = path.resolve(process.cwd(), '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const getEnvValue = (key) => {
        const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'));
        return match ? match[1].trim() : null;
    };

    const supabaseUrl = getEnvValue('NEXT_PUBLIC_SUPABASE_URL');
    const supabaseKey = getEnvValue('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('--- Current Bookings ---');
    const { data: bookings, error } = await supabase
        .from('bookings')
        .select('id, status, room_id, rooms(name, is_occupied)');

    if (error) {
        console.error('Error fetching bookings:', error);
    } else {
        console.table(bookings.map(b => ({
            id: b.id.substring(0, 8) + '...',
            status: b.status,
            room: b.rooms?.name,
            room_occupied: b.rooms?.is_occupied
        })));
    }
}

debugBooking();
