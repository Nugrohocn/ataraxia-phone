"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function DashboardShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">
      {/* 1. SIDEBAR (Fixed position) */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* 2. WRAPPER KONTEN */}
      {/* - Mobile: w-full (Penuh)
          - Desktop (lg): pl-72 (Geser ke kanan 288px karena ada sidebar)
          - min-w-0: Mencegah flex item memaksa lebar berlebih
      */}
      <div className="flex flex-col min-h-screen w-full lg:pl-72 transition-all duration-300">
        {/* Header menerima fungsi toggle sidebar */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 w-full max-w-[100vw]">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>

      {/* 3. OVERLAY (Hanya Mobile - Gelapkan background saat sidebar buka) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}
