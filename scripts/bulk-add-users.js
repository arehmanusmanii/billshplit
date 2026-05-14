import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const dummyUsers = [
  { email: 'leader@test.com', password: 'password123', full_name: 'You (Leader)' },
  { email: 'alice@test.com', password: 'password123', full_name: 'Alice (Friend)' },
  { email: 'bob@test.com', password: 'password123', full_name: 'Bob (Friend)' },
];

async function seedAuthUsers() {
  console.log("🌱 Bulk adding dummy Auth users...");
  let leaderId = "00000000-0000-0000-0000-000000000000";

  for (const user of dummyUsers) {
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true 
    });

    // If user already exists, let's just fetch their ID
    if (authError && authError.message.includes('already registered')) {
        const { data: existingUser } = await supabaseAdmin.from('profiles').select('id').eq('full_name', user.full_name).single();
        if (existingUser) {
           console.log(`⚠️ ${user.full_name} already exists. ID: ${existingUser.id}`);
           if (user.email === 'leader@test.com') leaderId = existingUser.id;
        }
        continue;
    } else if (authError) {
        console.error(`❌ Error creating ${user.email}:`, authError.message);
        continue;
    }

    if (authData.user) {
      if (user.email === 'leader@test.com') leaderId = authData.user.id;
      
      const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
        id: authData.user.id,
        full_name: user.full_name
      });

      if (profileError) {
        console.error(`❌ Error creating profile for ${user.full_name}:`, profileError.message);
      } else {
        console.log(`✅ Created Auth User + Profile for: ${user.full_name}`);
      }
    }
  }

  // Automatically update the frontend to use the correct real UUID
  console.log(`\n🔗 Linking Leader ID (${leaderId}) to your frontend...`);
  const exportPath = path.join(process.cwd(), 'lib', 'constants.ts');
  fs.writeFileSync(exportPath, `export const DUMMY_USER_ID = "${leaderId}";\n`);
  console.log("✅ Wrote lib/constants.ts!");
  console.log("🎉 Done! You can now use these friends in the app.");
}

seedAuthUsers();
