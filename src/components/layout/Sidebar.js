"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Smartphone,
  BarChart3,
  Settings,
  LogOut,
  ShoppingCart,
  History,
  Box,
  X,
  Wallet, // Icon untuk Keuangan
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function Sidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();
  const router = useRouter();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Manage Phone", href: "/dashboard/phone", icon: Smartphone },
    { name: "Transaksi", href: "/dashboard/transaction", icon: ShoppingCart },
    { name: "Keuangan", href: "/dashboard/finance", icon: Wallet }, // Menu Baru
    { name: "Laporan", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Log Aktivitas", href: "/dashboard/logs", icon: History },
    { name: "Pengaturan", href: "/dashboard/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <>
      {/* LOGIKA RESPONSIF:
        - Mobile: Default hidden (-translate-x-full), muncul jika isOpen=true.
        - Desktop (lg): Selalu muncul (translate-x-0).
      */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 shadow-xl flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 
      `}
      >
        {/* Logo Area */}
        <div className="flex h-20 items-center justify-between px-8 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-900/50">
              <Box size={24} strokeWidth={3} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight">
                Nuka<span className="text-indigo-500">Phone</span>
              </h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                Management
              </p>
            </div>
          </div>
          {/* Tombol Close (Hanya Mobile) */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 text-slate-400 hover:text-red-500 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Main Menu
          </p>

          {navigation.map((item) => {
            // Cek aktif: exact match ATAU startsWith (untuk sub-halaman seperti /phone/add)
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)} // Tutup sidebar saat link diklik (Mobile only)
                className={`
                  flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group
                  ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }
                `}
              >
                <item.icon
                  size={20}
                  className={`transition-colors ${
                    isActive
                      ? "text-white"
                      : "text-slate-400 group-hover:text-white"
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile (Bottom) */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                Administrator
              </p>
              <p className="text-xs text-slate-500 truncate">Super Admin</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
