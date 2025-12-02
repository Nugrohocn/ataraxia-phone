"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Lock, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Menyimpan password...");

    try {
      // Fungsi Supabase untuk update data user yang sedang login
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      toast.success("Password berhasil dibuat!", { id: toastId });

      // Setelah sukses, lempar ke Dashboard
      router.replace("/dashboard");
    } catch (error) {
      toast.error("Gagal: " + error.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <Lock size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Buat Password Baru
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Selamat datang! Silakan buat password untuk akun Anda agar bisa
            login di kemudian hari.
          </p>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
              Password Baru
            </label>
            <input
              type="password"
              required
              minLength={6}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-70 flex justify-center items-center gap-2"
          >
            {loading ? (
              "Menyimpan..."
            ) : (
              <>
                <CheckCircle size={20} /> Simpan & Masuk
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
