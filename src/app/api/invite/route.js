import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request) {
  try {
    const { email } = await request.json();
    // Ambil origin (contoh: http://localhost:3000) dari request saat ini
    const origin = new URL(request.url).origin;

    if (!email) {
      return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 });
    }

    // Panggil fungsi Invite Supabase dengan redirectTo
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      {
        // INI KUNCINYA: Arahkan ke route callback, bukan langsung ke login/dashboard
        // Kita juga titipkan pesan 'next=/update-password' agar nanti diarahkan ke sana
        redirectTo: `${origin}/auth/callback?next=/update-password`,
      }
    );

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: "Undangan berhasil dikirim", data });
  } catch (error) {
    console.error("Invite Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
