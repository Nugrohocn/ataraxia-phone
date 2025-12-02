import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 1. Buat Klien Supabase khusus untuk Middleware
  // Ini berfungsi untuk membaca Cookies session pengguna
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 2. Cek apakah User sedang login?
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 3. ATURAN KEAMANAN (Route Guard)

  // A. Jika User BELUM Login tapi mencoba masuk halaman Dashboard (Protected)
  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    // Tendang ke halaman Login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // B. Jika User SUDAH Login tapi mencoba masuk halaman Login (Auth)
  if (user && request.nextUrl.pathname === "/login") {
    // Tendang masuk ke Dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // C. Jika aman, izinkan lewat
  return response;
}

// Konfigurasi: Middleware ini hanya akan aktif di rute-rute ini
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images public (folder public/image)
     */
    "/((?!_next/static|_next/image|favicon.ico|image/.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
