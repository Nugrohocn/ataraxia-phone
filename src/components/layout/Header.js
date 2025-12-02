"use client";

import { usePathname } from "next/navigation";
import { Bell, Search, Calendar, Menu } from "lucide-react"; // Tambah Menu Icon

// Terima props 'onMenuClick'
export default function Header({ onMenuClick }) {
  const pathname = usePathname();

  const getPageTitle = () => {
    // ... (Logika judul tetap sama) ...
    const path = pathname.split("/").pop();
    if (!path || path === "dashboard") return "Dashboard";
    if (pathname.includes("/phone/edit")) return "Edit Data HP";
    if (pathname.includes("/phone/add")) return "Tambah Unit Baru";
    return path.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between px-4 md:px-8 bg-white/80 backdrop-blur-md border-b border-slate-200 transition-all duration-300">
      <div className="flex items-center gap-4">
        {/* --- TOMBOL MENU (Hanya Mobile) --- */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
        >
          <Menu size={24} />
        </button>

        {/* Title */}
        <div>
          <h2 className="text-lg md:text-2xl font-extrabold text-gray-900 line-clamp-1">
            {getPageTitle()}
          </h2>
          <p className="hidden md:flex text-sm text-gray-500 font-medium mt-1 items-center gap-2">
            <Calendar size={14} className="text-blue-500" />
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="flex items-center gap-3 md:gap-6">
        <div className="hidden md:flex items-center bg-white rounded-2xl px-5 py-3 shadow-sm border border-gray-100 w-64 lg:w-80 transition-all focus-within:ring-2 focus-within:ring-blue-100">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none focus:outline-none text-sm ml-3 text-gray-700 w-full"
          />
        </div>

        <button className="relative p-2.5 bg-white text-gray-400 hover:text-blue-600 rounded-2xl shadow-sm border border-gray-100 transition-all active:scale-95">
          <Bell size={20} />
          <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
        </button>
      </div>
    </header>
  );
}
