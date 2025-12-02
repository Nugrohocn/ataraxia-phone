"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Plus, ArrowUpCircle, ArrowDownCircle, Wallet } from "lucide-react";
import { toast } from "sonner";

export default function FinancePage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // State Form
  const [formData, setFormData] = useState({
    type: "in", // 'in' atau 'out'
    category: "modal_investor",
    amount: "",
    description: "",
  });

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("finances")
        .select("*")
        .order("transaction_date", { ascending: false });

      if (error) throw error;
      setTransactions(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { error } = await supabase.from("finances").insert([
        {
          ...formData,
          amount: parseInt(formData.amount),
          created_by: user.id,
        },
      ]);

      if (error) throw error;

      toast.success("Transaksi berhasil dicatat!");
      fetchTransactions();
      setIsModalOpen(false);
      setFormData({
        type: "in",
        category: "modal_investor",
        amount: "",
        description: "",
      }); // Reset
    } catch (error) {
      toast.error("Gagal: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Keuangan & Kas</h1>
          <p className="text-sm text-gray-500">
            Catat modal masuk dan pengeluaran operasional toko.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-2xl hover:bg-black transition-all shadow-lg font-bold text-sm"
        >
          <Plus size={18} /> Catat Transaksi
        </button>
      </div>

      {/* Tabel Transaksi */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-400 font-bold uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Tanggal</th>
              <th className="px-6 py-4">Kategori</th>
              <th className="px-6 py-4">Keterangan</th>
              <th className="px-6 py-4 text-right">Jumlah</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {transactions.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-blue-50/30 transition-colors"
              >
                <td className="px-6 py-4 text-gray-500">
                  {new Date(item.transaction_date).toLocaleDateString("id-ID")}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      item.category === "modal_investor"
                        ? "bg-purple-100 text-purple-700"
                        : item.category === "operasional_toko"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {item.category.replace("_", " ")}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {item.description}
                </td>
                <td
                  className={`px-6 py-4 text-right font-bold ${
                    item.type === "in" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {item.type === "in" ? "+" : "-"} {formatRupiah(item.amount)}
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-400">
                  Belum ada data keuangan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL INPUT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Catat Keuangan
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Pilihan Tipe */}
              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() =>
                    setFormData({
                      ...formData,
                      type: "in",
                      category: "modal_investor",
                    })
                  }
                  className={`cursor-pointer border p-4 rounded-2xl flex flex-col items-center gap-2 transition-all ${
                    formData.type === "in"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 text-gray-400"
                  }`}
                >
                  <ArrowUpCircle size={24} />
                  <span className="text-xs font-bold uppercase">
                    Uang Masuk
                  </span>
                </div>
                <div
                  onClick={() =>
                    setFormData({
                      ...formData,
                      type: "out",
                      category: "operasional_toko",
                    })
                  }
                  className={`cursor-pointer border p-4 rounded-2xl flex flex-col items-center gap-2 transition-all ${
                    formData.type === "out"
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-gray-200 text-gray-400"
                  }`}
                >
                  <ArrowDownCircle size={24} />
                  <span className="text-xs font-bold uppercase">
                    Uang Keluar
                  </span>
                </div>
              </div>

              {/* Kategori Dropdown */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                  Kategori
                </label>
                <select
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  {formData.type === "in" ? (
                    <option value="modal_investor">
                      Suntik Modal Investor
                    </option>
                  ) : (
                    <>
                      <option value="operasional_toko">
                        Biaya Operasional (Listrik, Wifi)
                      </option>
                      <option value="tarik_modal">Tarik Modal Investor</option>
                      <option value="prive">Ambil Profit (Prive)</option>
                    </>
                  )}
                </select>
              </div>

              {/* Nominal */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                  Nominal (Rp)
                </label>
                <input
                  type="number"
                  required
                  placeholder="0"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none font-bold text-lg"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                />
              </div>

              {/* Keterangan */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                  Keterangan
                </label>
                <textarea
                  rows="2"
                  required
                  placeholder="Contoh: Bayar tagihan IndiHome bulan Juli"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                ></textarea>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 font-bold text-gray-500 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-black disabled:opacity-50"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
