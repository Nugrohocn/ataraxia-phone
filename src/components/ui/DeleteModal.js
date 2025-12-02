"use client";

import { AlertTriangle, X } from "lucide-react";

export default function DeleteModal({ isOpen, onClose, onConfirm, loading }) {
  if (!isOpen) return null;

  return (
    // Backdrop Blur
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm transition-opacity p-4">
      {/* Modal Card */}
      <div className="w-full max-w-sm scale-100 transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Header Icon & Close */}
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 mb-4">
            <AlertTriangle size={24} strokeWidth={2.5} />
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="mt-2">
          <h3 className="text-lg font-bold leading-6 text-slate-900">
            Hapus Data Ini?
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Apakah Anda yakin ingin menghapus data ini secara permanen? Tindakan
            ini tidak dapat dibatalkan.
          </p>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            className="inline-flex justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 transition-colors"
            onClick={onClose}
            disabled={loading}
          >
            Batalkan
          </button>
          <button
            type="button"
            className="inline-flex justify-center rounded-xl border border-transparent bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors shadow-lg shadow-red-200"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Menghapus..." : "Ya, Hapus Permanen"}
          </button>
        </div>
      </div>
    </div>
  );
}
