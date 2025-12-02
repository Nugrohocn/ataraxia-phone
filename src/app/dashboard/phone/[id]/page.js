"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Smartphone,
  Battery,
  Signal,
  AlertCircle,
  DollarSign,
  Box,
  Video,
} from "lucide-react";

export default function PhoneDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [media, setMedia] = useState([]);

  const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        // Ambil data produk + media sekaligus
        const { data, error } = await supabase
          .from("products")
          .select("*, product_media(*)")
          .eq("id", id)
          .single();

        if (error) throw error;

        if (data) {
          const { product_media, ...info } = data;
          setProduct(info);
          setMedia(product_media || []);
        }
      } catch (error) {
        console.error("Error:", error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProductDetail();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Yakin ingin menghapus data HP ini permanen?")) return;

    try {
      // Hapus (Media di storage tidak otomatis terhapus lewat API ini,
      // tapi link di DB akan hilang karena Cascade Delete.
      // Untuk best practice, hapus file di storage dulu, tapi untuk skrg ini cukup).
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      router.push("/dashboard/phone");
    } catch (error) {
      alert("Gagal hapus: " + error.message);
    }
  };

  if (loading)
    return <div className="p-10 text-center">Loading details...</div>;
  if (!product)
    return (
      <div className="p-10 text-center text-red-500">Data tidak ditemukan</div>
    );

  return (
    <div className="max-w-5xl mx-auto pb-10">
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/phone"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>
            <p className="text-sm text-gray-500">
              {product.brand} • {product.ram_internal}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/dashboard/phone/edit/${product.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium transition-colors"
          >
            <Edit size={18} /> Edit
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium transition-colors"
          >
            <Trash2 size={18} /> Hapus
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- KOLOM KIRI: GALERI MEDIA --- */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Smartphone size={18} className="text-blue-500" /> Dokumentasi
            </h3>

            {media.length === 0 ? (
              <div className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                Tidak ada foto
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {media.map((item) => (
                  <div
                    key={item.id}
                    className="relative group overflow-hidden rounded-lg border border-gray-100"
                  >
                    {item.media_type === "video" ? (
                      <div className="aspect-square bg-black flex items-center justify-center relative">
                        <video
                          src={item.file_url}
                          className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Video className="text-white" size={24} />
                        </div>
                        <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1 rounded">
                          Video
                        </span>
                      </div>
                    ) : (
                      <div className="aspect-square relative">
                        <img
                          src={item.file_url}
                          alt={item.category}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded capitalize backdrop-blur-sm">
                          {item.category}
                        </span>
                      </div>
                    )}
                    {/* Tombol View Full (Opsional, bisa ditambah fitur modal/lightbox) */}
                    <a
                      href={item.file_url}
                      target="_blank"
                      className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"
                      rel="noreferrer"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status Stok Kecil */}
          <div
            className={`p-4 rounded-xl border ${
              product.current_stock > 0
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-semibold">Sisa Stok</span>
              <span className="text-2xl font-bold">
                {product.current_stock} Unit
              </span>
            </div>
          </div>
        </div>

        {/* --- KOLOM KANAN: DETAIL INFO --- */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Kondisi Fisik & Fungsi */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">
              Kondisi Unit
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Signal size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Sinyal
                  </p>
                  <p className="font-medium text-gray-900">{product.sinyal}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                  <Battery size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Battery Health
                  </p>
                  <p className="font-medium text-gray-900">
                    {product.battery_health}%
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                  <Smartphone size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Fitur Utama
                  </p>
                  <div className="flex gap-2 mt-1">
                    <span
                      className={`text-xs px-2 py-1 rounded border ${
                        product.face_id_status
                          ? "bg-blue-50 border-blue-200 text-blue-700"
                          : "bg-gray-50 text-gray-500 line-through"
                      }`}
                    >
                      Face ID
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded border ${
                        product.truetone_status
                          ? "bg-blue-50 border-blue-200 text-blue-700"
                          : "bg-gray-50 text-gray-500 line-through"
                      }`}
                    >
                      TrueTone
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Minus / Fisik
                  </p>
                  <p className="font-medium text-gray-900 text-sm">
                    {product.minus_description || "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Informasi Identitas (IMEI dll) */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">
              Identitas & Serial
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-2 text-gray-500 w-1/3">Nomor Model</td>
                    <td className="py-2 font-mono text-gray-800 select-all">
                      {product.nomor_model || "-"}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-500">Nomor Seri</td>
                    <td className="py-2 font-mono text-gray-800 select-all">
                      {product.nomor_seri || "-"}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-500">IMEI</td>
                    <td className="py-2 font-mono text-gray-800 font-bold select-all tracking-wider">
                      {product.imei || "-"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Info Finansial (Hanya Admin yang lihat) */}
          <div className="bg-gray-900 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-800 rounded-full border border-gray-700">
                <DollarSign size={24} className="text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Harga Modal (Beli)</p>
                <p className="text-3xl font-bold tracking-tight">
                  {formatRupiah(product.cost_price)}
                </p>
              </div>
            </div>
            {product.other_notes && (
              <div className="mt-4 pt-4 border-t border-gray-700 text-sm text-gray-300">
                <span className="font-bold text-gray-400 block text-xs uppercase mb-1">
                  Catatan Internal:
                </span>
                {product.other_notes}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
