"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Plus, Shield, Send, Mail, User, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function TeamPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  // Fetch Data & Cek Permission
  useEffect(() => {
    const initPage = async () => {
      try {
        setLoading(true);

        // 1. Cek User Saat Ini & Role-nya
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: currentUserProfile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        // 2. PROTEKSI: Jika bukan superadmin, tendang keluar
        if (currentUserProfile?.role !== "superadmin") {
          toast.error("Akses Ditolak! Halaman ini khusus Superadmin.");
          router.push("/dashboard");
          return;
        }

        // 3. Jika lolos (Superadmin), baru ambil daftar semua user
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setUsers(data);
      } catch (error) {
        console.error(error);
        toast.error("Gagal memuat data tim");
      } finally {
        setLoading(false);
      }
    };

    initPage();
  }, [router]);

  // Handle Invite (Panggil API Route /api/invite)
  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setInviting(true);
    const toastId = toast.loading("Mengirim undangan...");

    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      toast.success("Undangan terkirim! Minta partner cek email.", {
        id: toastId,
      });
      setInviteEmail("");
    } catch (error) {
      toast.error(error.message, { id: toastId });
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Tim</h1>
          <p className="text-sm text-gray-500">
            Undang partner atau admin untuk mengelola toko bersama.
          </p>
        </div>
      </div>

      {/* CARD UNDANG ANGGOTA */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)]">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Send size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">
              Undang Anggota Baru
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Anggota baru akan menerima email untuk membuat password mereka
              sendiri.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleInvite}
          className="flex flex-col sm:flex-row gap-4 items-end mt-6"
        >
          <div className="flex-1 space-y-2 w-full">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-wider">
              Email Partner
            </label>
            <div className="relative group">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
                size={20}
              />
              <input
                type="email"
                required
                placeholder="contoh@partner.com"
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-gray-900 placeholder:text-gray-400"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={inviting}
            className="w-full sm:w-auto bg-gray-900 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-black transition-all disabled:opacity-50 h-[52px] flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
          >
            {inviting ? (
              "Mengirim..."
            ) : (
              <>
                <Plus size={20} /> Kirim Undangan
              </>
            )}
          </button>
        </form>
      </div>

      {/* LIST USER CARD */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
          <h3 className="font-bold text-gray-900 text-lg">
            Daftar Pengguna Aktif
          </h3>
          <span className="text-xs font-bold bg-gray-200 text-gray-600 px-2 py-1 rounded-lg">
            {users.length} User
          </span>
        </div>

        <div className="divide-y divide-gray-50">
          {loading ? (
            <div className="p-10 text-center text-gray-400 flex flex-col items-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
              Loading data...
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-blue-50/10 transition-colors gap-4 group"
              >
                <div className="flex items-center gap-5">
                  <div
                    className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm border border-white/50 ${
                      user.role === "superadmin"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-orange-100 text-orange-600"
                    }`}
                  >
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-base flex items-center gap-2">
                      {user.full_name || "Tanpa Nama"}
                      {user.role === "superadmin" && (
                        <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded border border-blue-200">
                          YOU
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500 font-medium">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pl-[68px] sm:pl-0 w-full sm:w-auto justify-between sm:justify-end">
                  <span
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wide flex items-center gap-2 border ${
                      user.role === "superadmin"
                        ? "bg-blue-50 border-blue-100 text-blue-700"
                        : "bg-orange-50 border-orange-100 text-orange-700"
                    }`}
                  >
                    <Shield
                      size={14}
                      fill="currentColor"
                      className="opacity-20"
                    />
                    {user.role === "superadmin"
                      ? "Super Admin"
                      : "Partner / Admin"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
