const SUPABASE_URL = "https://ctfgqsywwxkleksgyqbi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_UuX93nTq7mvZq3usW6D-ng_fKaZBXck";

function hasSupabaseConfig() {
  return (
    SUPABASE_URL.startsWith("https://") &&
    !SUPABASE_URL.includes("YOUR_PROJECT_REF") &&
    SUPABASE_PUBLISHABLE_KEY &&
    !SUPABASE_PUBLISHABLE_KEY.includes("YOUR_SUPABASE")
  );
}

function createSupabaseClient() {
  if (!hasSupabaseConfig() || !window.supabase) return null;

  return window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}
