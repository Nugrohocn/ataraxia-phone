import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Jika ada parameter "next" di URL, kita akan redirect ke sana setelah login
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return request.cookies.get(name)?.value;
          },
          set(name, value, options) {
            request.cookies.set({ name, value, ...options });
          },
          remove(name, options) {
            request.cookies.set({ name, value: "", ...options });
          },
        },
      }
    );

    // Tukar "Kode Undangan" dengan "Session Login" (Cookies)
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Jika berhasil, kirim user ke halaman tujuan (Dashboard atau Update Password)
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Jika gagal, kembalikan ke halaman login dengan error
  return NextResponse.redirect(`${origin}/login?error=auth-code-error`);
}
