"use server"

import { supabase } from "@/lib/supabase"

export async function ensureDummyUsers() {
  const dummyUsers = [
    { id: "00000000-0000-0000-0000-000000000000", full_name: "You (Leader)", avatar_url: null },
    { id: "11111111-1111-1111-1111-111111111111", full_name: "Alice (Friend)", avatar_url: null },
    { id: "22222222-2222-2222-2222-222222222222", full_name: "Bob (Friend)", avatar_url: null },
  ];

  for (const user of dummyUsers) {
    const { error } = await supabase.from('profiles').upsert(user);
    if (error) console.error("Error ensuring dummy user:", error);
  }

  return dummyUsers;
}
