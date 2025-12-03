"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient"; // Client Supabase kita
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Cegah useEffect jalan 2x di React Strict Mode
  const processedRef = useRef(false);

  const next = searchParams.get("next") || "/dashboard";

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const handleAuth = async () => {
      // 1. Cek apakah ada 'code' (Server Flow) di URL
      const code = searchParams.get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          finishLogin();
          return;
        }
      }

      // 2. Jika tidak ada code, cek apakah Supabase mendeteksi Session dari Hash (#)
      // (Library Supabase otomatis membaca URL Hash)
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (session) {
        finishLogin();
      } else {
        // Gagal total
        toast.error("Gagal verifikasi undangan.");
        router.replace("/login?error=VerificationFailed");
      }
    };

    const finishLogin = () => {
      // Refresh agar Middleware di server sadar kita sudah punya cookie
      router.refresh();
      // Redirect ke halaman tujuan (misal: update-password)
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
