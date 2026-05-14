"use server"

import { supabaseAdmin as supabase } from "@/lib/supabase"

/**
 * Fetches all available profiles to use as friends in the MVP.
 */
export async function getFriends() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name');

  if (error) {
    console.error("Error fetching friends:", error);
    return [];
  }

  return data;
}
