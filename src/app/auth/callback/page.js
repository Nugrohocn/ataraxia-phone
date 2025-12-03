"use client";

// 1. Tambahkan config ini agar halaman tidak di-build statis
export const dynamic = "force-dynamic";

import { useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// 2. LOGIKA UTAMA (Tetap sama)
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

      // A. Cek Code (Server Flow)
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          finishLogin();
          return;
        }
      }

      // B. Cek Hash (Client Flow)
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
      router.refresh();
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

// 3. WRAPPER UTAMA
export default function AuthCallbackPage() {
  return (
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
