"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Save, AlertCircle, PieChart } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State Persentase
  const [shares, setShares] = useState({
    superadmin: 60,
    partner: 40,
  });

  // 1. Ambil Settingan Saat Ini
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("business_settings")
          .select("*")
          .eq("id", 1) // Kita asumsikan ID 1 selalu ada
          .single();

        if (error) throw error;

        if (data) {
          setShares({
            superadmin: data.share_percent_superadmin,
            partner: data.share_percent_partner,
          });
        }
      } catch (error) {
        console.error("Error:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // 2. Handle Perubahan Input (Otomatis hitung sisanya)
  const handleShareChange = (e) => {
    let value = parseInt(e.target.value);
    if (isNaN(value)) value = 0;
    if (value > 100) value = 100;
    if (value < 0) value = 0;

    // Jika Superadmin diubah, Partner otomatis menyesuaikan
    setShares({
      superadmin: value,
      partner: 100 - value,
    });
  };

  // 3. Simpan ke Database
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from("business_settings")
        .update({
          share_percent_superadmin: shares.superadmin,
          share_percent_partner: shares.partner,
          last_updated: new Date().toISOString(),
        })
        .eq("id", 1);

      if (error) throw error;
      alert("Pengaturan bagi hasil berhasil disimpan!");
    } catch (error) {
      alert("Gagal menyimpan: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className="p-8 text-center">Loading settings...</div>;

  // ... (Logic sama) ...
  // Ganti RETURN (JSX) dengan ini:

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan Bisnis</h1>
        <p className="text-sm text-gray-500">
          Kelola pembagian profit sharing.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 p-8">
        <div className="flex items-start gap-4 mb-8 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <PieChart size={24} />
          </div>
          <div>
            <h4 className="font-bold text-blue-900 text-sm">
              Prinsip Bagi Hasil
            </h4>
            <p className="text-sm text-blue-700/80 mt-1 leading-relaxed">
              Total persentase antara Superadmin (Investor) dan Partner
              (Pelaksana) harus selalu berjumlah <strong>100%</strong>.
              Perubahan akan berlaku untuk perhitungan profit selanjutnya.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-10">
          {/* Visual Bar */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm font-bold">
              <span className="text-gray-900">Superadmin</span>
              <span className="text-gray-500">Partner</span>
            </div>
            <div className="h-6 w-full bg-gray-100 rounded-full overflow-hidden flex p-1">
              <div
                className="h-full bg-gray-900 rounded-full shadow-sm transition-all duration-500 ease-out flex items-center justify-center text-[10px] text-white font-bold"
                style={{ width: `${shares.superadmin}%` }}
              >
                {shares.superadmin}%
              </div>
            </div>
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Superadmin
              </label>
              <div className="relative group">
                <input
                  type="number"
                  value={shares.superadmin}
                  onChange={handleShareChange}
                  className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-gray-900 focus:border-transparent font-bold text-2xl text-gray-900 transition-all text-center"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                  %
                </span>
              </div>
              <p className="text-xs text-gray-400 text-center">Pemilik Modal</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Partner
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={shares.partner}
                  disabled
                  className="w-full p-4 border border-gray-100 bg-gray-50 rounded-2xl font-bold text-2xl text-gray-500 text-center cursor-not-allowed"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 font-bold">
                  %
                </span>
              </div>
              <p className="text-xs text-gray-400 text-center">Pelaksana</p>
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-2xl hover:bg-black font-bold shadow-lg shadow-gray-200 hover:shadow-xl transition-all disabled:opacity-50 active:scale-95"
            >
              <Save size={20} />
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
