const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey
);

async function checkPaymentStatus() {
    console.log("Checking payments...");
    const { data: payments, error } = await supabase
        .from('payments')
        .select('id, status, amount, period_month, period_year')
        .limit(5);
        
    if (error) {
        console.error("Error fetching payments:", error);
    } else {
        console.log("Found payments:");
        console.table(payments);
    }
}

checkPaymentStatus();
