import { createClient } from "@supabase/supabase-js";
import { Database } from "../../database.types.ts";

const supabase = createClient<Database>(
  import.meta.env.VITE_SUPERBASE_PROJECT_URL,
  import.meta.env.VITE_SUPERBASE_API_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      storage: window.localStorage,
    },
  },
);

export default supabase;
