
/*
 * COSMOS Articles — Supabase connection
 * Use only your Project URL and Publishable Key here.
 * Never place a service_role or secret key in frontend code.
 */

const SUPABASE_URL = "https://tletozetpgdiixyjtomj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_iieeI0Am3WoC1ci4MecF4g_031PyD0O";

// Load the Supabase client library before this file.
if (!window.supabase) {
  throw new Error(
    "Supabase library not loaded. Check the script order in your HTML."
  );
}

if (
  SUPABASE_URL.includes("https://tletozetpgdiixyjtomj.supabase.com") ||
  SUPABASE_PUBLISHABLE_KEY.includes("sb_publishable_iieeI0Am3WoC1ci4MecF4g_031PyD0O")
) {
  throw new Error(
    "Add your Supabase Project URL and Publishable Key to js/supabase.js."
  );
}

const cosmosSupabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
