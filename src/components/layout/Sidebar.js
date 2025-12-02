"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Smartphone,
  BarChart3,
  Settings,
  LogOut,
  ShoppingCart,
  History,
  X,
  Wallet,
  Users, // Icon untuk Team
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function Sidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();
  const router = useRouter();

  // State untuk menyimpan profil user agar kita tahu role-nya
  const [userProfile, setUserProfile] = useState(null);

  // Fetch Profil saat Sidebar dimuat untuk cek Role
  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        setUserProfile(data);
      }
    };
    fetchProfile();
  }, []);

  // Definisi Menu Dasar
  const baseNavigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Manage Phone", href: "/dashboard/phone", icon: Smartphone },
    { name: "Transaksi", href: "/dashboard/transaction", icon: ShoppingCart },
    { name: "Keuangan", href: "/dashboard/finance", icon: Wallet },
    { name: "Laporan", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Log Aktivitas", href: "/dashboard/logs", icon: History },
  ];

  // Menu Tambahan Khusus Superadmin
  const adminMenu = [
    { name: "Kelola Tim", href: "/dashboard/team", icon: Users },
  ];

  // Menu Akhir (Pengaturan selalu di bawah)
  const settingsMenu = [
    { name: "Pengaturan", href: "/dashboard/settings", icon: Settings },
  ];

  // Gabungkan Menu berdasarkan Role
  // Jika role belum load (null), tampilkan menu dasar dulu
  const navigation = [
    ...baseNavigation,
    ...(userProfile?.role === "superadmin" ? adminMenu : []),
    ...settingsMenu,
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <>
      {/* SIDEBAR CONTAINER */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 shadow-sm flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 
      `}
      >
        {/* LOGO AREA */}
        <div className="flex h-24 items-center justify-between px-8">
          {/* Logo Image */}
          <div className="relative h-12 w-48">
            <Image
              src="/image/ataraxia-logo.png"
              alt="Ataraxia Logo"
              fill
              className="object-contain object-left"
              priority
            />
          </div>

          {/* Tombol Close (Hanya Mobile) */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 px-6 py-4 space-y-2 overflow-y-auto">
          <p className="px-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Menu
          </p>

          {navigation.map((item) => {
            // Cek aktif
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-4 px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-200 group
                  ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                      : "text-gray-500 hover:bg-gray-50 hover:text-blue-600"
                  }
                `}
              >
                <item.icon
                  size={22}
                  className={`transition-colors ${
                    isActive
                      ? "text-white"
                      : "text-gray-400 group-hover:text-blue-600"
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* USER PROFILE (BOTTOM) */}
        <div className="p-6 border-t border-gray-50">
          <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 border border-gray-100">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex-shrink-0 overflow-hidden flex items-center justify-center text-blue-600 font-bold">
              {userProfile?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">
                {userProfile?.full_name || "Loading..."}
              </p>
              <p className="text-xs text-gray-500 truncate capitalize flex items-center gap-1">
                {userProfile?.role || "..."}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
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
