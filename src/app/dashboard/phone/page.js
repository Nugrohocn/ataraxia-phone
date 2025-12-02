"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Plus, Search, Trash2, Edit, Eye, Smartphone } from "lucide-react";
import ProductDetailModal from "@/components/dashboard/ProductDetailModal";
// 1. Import DeleteModal & Toast
import DeleteModal from "@/components/ui/DeleteModal";
import { toast } from "sonner";

export default function PhoneListPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // State untuk Modal Detail
  const [selectedProductId, setSelectedProductId] = useState(null);

  // 2. State untuk Modal Hapus
  const [deleteId, setDeleteId] = useState(null); // ID yang akan dihapus
  const [isDeleting, setIsDeleting] = useState(false); // Loading state saat menghapus

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data);
    } catch (error) {
      console.error("Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Fungsi ini dipanggil saat tombol "Ya, Hapus" di klik
  const confirmDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", deleteId);
      if (error) throw error;

      // Sukses
      toast.success("Data berhasil dihapus");
      fetchProducts(); // Refresh list
      setDeleteId(null); // Tutup modal
    } catch (error) {
      toast.error("Gagal menghapus: " + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.imei?.includes(searchTerm)
  );

  const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stok Handphone</h1>
          <p className="text-sm text-gray-500">
            Kelola inventaris toko Anda di sini.
          </p>
        </div>
        <Link
          href="/dashboard/phone/add"
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 font-bold text-sm"
        >
          <Plus size={20} />
          Tambah Unit Baru
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white p-2 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 flex items-center">
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Cari nama HP, Brand, atau IMEI..."
            className="w-full pl-12 pr-4 py-3 bg-transparent border-none focus:outline-none text-gray-700 font-medium placeholder:text-gray-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-400 font-bold uppercase text-xs tracking-wider">
              <tr>
                <th className="px-8 py-5">Produk</th>
                <th className="px-6 py-5">Spek</th>
                <th className="px-6 py-5">Modal</th>
                <th className="px-6 py-5">Stok</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-gray-400">
                    Loading inventory...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-gray-400">
                    Tidak ada data ditemukan.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                          <Smartphone size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-400 font-mono tracking-wide">
                            {item.imei || "No IMEI"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-gray-600 font-medium">
                      {item.ram_internal}
                    </td>
                    <td className="px-6 py-5 font-bold text-gray-900">
                      {formatRupiah(item.cost_price)}
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          item.current_stock > 0
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {item.current_stock} Unit
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded w-fit">
                          {item.sinyal}
                        </span>
                        <span className="text-[10px] font-bold text-blue-600">
                          BH {item.battery_health}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setSelectedProductId(item.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 hover:shadow-sm transition-all"
                          title="Detail"
                        >
                          <Eye size={18} />
                        </button>
                        <Link
                          href={`/dashboard/phone/edit/${item.id}`}
                          className="p-2 text-gray-400 hover:text-orange-500 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 hover:shadow-sm transition-all"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          // 4. Ubah logika onClick: Buka Modal (Set ID)
                          onClick={() => setDeleteId(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 hover:shadow-sm transition-all"
                          title="Hapus"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- RENDER MODAL DETAIL (Yang Lama) --- */}
      {selectedProductId && (
        <ProductDetailModal
          productId={selectedProductId}
          onClose={() => setSelectedProductId(null)}
        />
      )}

      {/* --- 5. RENDER MODAL HAPUS (YANG BARU) --- */}
      <DeleteModal
        isOpen={!!deleteId} // Buka jika deleteId tidak null
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        loading={isDeleting}
      />
    </div>
  );
}
