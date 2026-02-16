const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function listTables() {
    // Read .env.local
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) {
        console.error('❌ .env.local not found!');
        return;
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const getEnvValue = (key) => {
        const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'));
        return match ? match[1].trim() : null;
    };

    const supabaseUrl = getEnvValue('NEXT_PUBLIC_SUPABASE_URL');
    const supabaseKey = getEnvValue('NEXT_PUBLIC_SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing env variables');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const tablesToTry = ['properties', 'rooms', 'bookings', 'profiles', 'maintenance_requests', 'maintenance'];

    console.log('Checking tables...');
    for (const table of tablesToTry) {
        const { data, error } = await supabase.from(table).select('id').limit(1);
        if (error) {
            console.log(`❌ Table '${table}': ${error.message} (${error.code})`);
        } else {
            console.log(`✅ Table '${table}': Exists`);
        }
    }
}

listTables();
