"use client";

import { useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// 1. PISAHKAN LOGIKA UTAMA KE KOMPONEN INI
function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const processedRef = useRef(false);

  const next = searchParams.get("next") || "/dashboard";

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const handleAuth = async () => {
      const code = searchParams.get("code");

      // A. Cek Code (Server Flow - Email Link biasanya pakai ini)
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          finishLogin();
          return;
        }
      }

      // B. Cek Hash (Client Flow - Kadang Supabase kirim via hash #)
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        finishLogin();
      } else {
        toast.error("Gagal verifikasi undangan.");
        router.replace("/login?error=VerificationFailed");
      }
    };

    const finishLogin = () => {
      // Refresh agar Middleware di server sadar kita sudah punya cookie
      router.refresh();
      // Redirect ke halaman tujuan
      router.replace(next);
    };

    handleAuth();
  }, [router, searchParams, next]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      <p className="text-slate-600 font-medium animate-pulse">
        Memverifikasi Undangan...
      </p>
    </div>
  );
}

// 2. KOMPONEN UTAMA (Hanya sebagai Wrapper / Bungkus)
export default function AuthCallbackPage() {
  return (
    // Suspense wajib ada jika kita pakai useSearchParams di Next.js App Router saat Build
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center">
          Loading Auth...
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
