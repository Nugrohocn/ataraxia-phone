import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Gunakan createBrowserClient agar token otomatis tersimpan di Cookies
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
