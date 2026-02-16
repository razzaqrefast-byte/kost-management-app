const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function testConnection() {
    try {
        // Read .env.local
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (!fs.existsSync(envPath)) {
            console.error('❌ .env.local not found!');
            process.exit(1);
        }

        const envContent = fs.readFileSync(envPath, 'utf8');
        const getEnvValue = (key) => {
            const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'));
            return match ? match[1].trim() : null;
        };

        const supabaseUrl = getEnvValue('NEXT_PUBLIC_SUPABASE_URL');
        const supabaseKey = getEnvValue('NEXT_PUBLIC_SUPABASE_ANON_KEY');

        if (!supabaseUrl || !supabaseKey) {
            console.error('❌ Missing Supabase credentials in .env.local');
            console.log('URL:', supabaseUrl ? 'Found' : 'Missing');
            console.log('Key:', supabaseKey ? 'Found' : 'Missing');
            process.exit(1);
        }

        console.log('Build Supabase client with URL:', supabaseUrl);
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Try to select from profiles (public table)
        // Even if empty, it should succeed. If auth fails, it will throw/return error.
        const { data, error } = await supabase.from('profiles').select('count').limit(1);

        if (error) {
            console.error('❌ Connection Failed:', error.message);
            if (error.code === 'PGRST301') {
                console.error('Hint: Row Level Security might be blocking access, or table does not exist.');
            }
        } else {
            console.log('✅ Connection Successful!');
            console.log('Supabase is reachable and keys are valid.');
        }

    } catch (err) {
        console.error('❌ Unexpected Error:', err);
    }
}

testConnection();
