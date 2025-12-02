"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Chrome, Lock, Mail, Loader2 } from "lucide-react"; // Tambahkan Loader2 icon

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Login ke Supabase
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // 2. Refresh router agar Middleware mendeteksi cookie baru
      router.refresh();

      // 3. Pindah ke dashboard
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Login gagal, periksa email dan password Anda.");
      setLoading(false); // Stop loading hanya jika error
    }
    // Catatan: Kita tidak taruh setLoading(false) di finally agar saat sukses
    // tombol tetap loading sampai halaman benar-benar pindah (UX lebih mulus)
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 font-sans text-slate-900">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Ataraxia<span className="text-blue-600">Phone</span>
          </h1>
          <p className="mt-2 text-sm text-gray-500 font-medium">
            Masuk untuk mengelola bisnis Anda
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-600 border border-red-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email Input */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
              Email
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Mail size={18} className="text-gray-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-2xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3.5 text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none font-medium placeholder:text-gray-400"
                placeholder="user@gmail.com"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
              Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-2xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3.5 text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none font-medium placeholder:text-gray-400"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Tombol Login */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 border border-transparent rounded-2xl shadow-lg shadow-blue-200 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Memproses...
              </>
            ) : (
              "Masuk Dashboard"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
