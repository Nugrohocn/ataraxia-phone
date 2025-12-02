"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function DashboardShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* 1. SIDEBAR (Responsive Logic) */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* 2. WRAPPER KONTEN */}
      {/* Di Desktop (lg): padding-left 72 (288px) agar tidak tertutup sidebar */}
      {/* Di Mobile: padding-left 0 */}
      <div className="lg:pl-72 flex flex-col min-h-screen transition-all duration-300">
        {/* Header menerima fungsi toggle sidebar */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* 3. OVERLAY (Hanya Mobile) */}
      {/* Gelapkan background saat sidebar terbuka di HP */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}
