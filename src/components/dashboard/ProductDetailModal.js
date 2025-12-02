"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { X, Image as ImageIcon, Video, Info, Maximize2 } from "lucide-react";

export default function ProductDetailModal({ productId, onClose }) {
  const [product, setProduct] = useState(null);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- STATE BARU: Untuk menyimpan URL gambar yang sedang di-zoom ---
  const [previewImage, setPreviewImage] = useState(null);

  const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);

  useEffect(() => {
    if (!productId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("products")
          .select("*, product_media(*)")
          .eq("id", productId)
          .single();

        if (error) throw error;

        const { product_media, ...info } = data;
        setProduct(info);
        setMedia(product_media || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  const handleContentClick = (e) => e.stopPropagation();

  if (!productId) return null;

  return (
    <>
      {/* === MODAL UTAMA (Detail Produk) === */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
          onClick={handleContentClick}
        >
          {/* Tombol Close Modal Utama */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 p-2 bg-white/80 rounded-full hover:bg-gray-100 transition-colors shadow-sm"
          >
            <X size={20} />
          </button>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
            </div>
          ) : product ? (
            <div className="flex flex-col md:flex-row">
              {/* BAGIAN KIRI: GALERI MEDIA */}
              <div className="md:w-1/2 bg-gray-50 p-6 border-r border-gray-100">
                <h3 className="mb-4 font-bold text-gray-800 flex items-center gap-2">
                  <ImageIcon size={18} className="text-blue-500" /> Dokumentasi
                  Unit
                </h3>

                {media.length === 0 ? (
                  <div className="aspect-square w-full rounded-xl bg-gray-200 flex items-center justify-center text-gray-400">
                    Tidak ada foto
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {media.map((item) => (
                      <div
                        key={item.id}
                        className="group relative aspect-square overflow-hidden rounded-lg bg-white border border-gray-200 shadow-sm cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
                        // --- LOGIKA KLIK GAMBAR ---
                        // Jika Video: Biarkan default (putar)
                        // Jika Gambar: Set state previewImage agar popup muncul
                        onClick={() =>
                          item.media_type !== "video" &&
                          setPreviewImage(item.file_url)
                        }
                      >
                        {item.media_type === "video" ? (
                          <div className="w-full h-full flex items-center justify-center bg-black/5">
                            <video
                              src={item.file_url}
                              className="w-full h-full object-cover opacity-90"
                              controls
                            />
                            <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 pointer-events-none">
                              <Video size={10} /> Video
                            </div>
                          </div>
                        ) : (
                          <>
                            <img
                              src={item.file_url}
                              alt={item.category}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded capitalize">
                              {item.category}
                            </span>
                            {/* Ikon Zoom saat hover */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <Maximize2
                                className="text-white drop-shadow-md"
                                size={24}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* BAGIAN KANAN: INFORMASI (Tidak Berubah) */}
              <div className="md:w-1/2 p-6 space-y-6">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {product.name}
                      </h2>
                      <p className="text-gray-500">
                        {product.brand} • {product.ram_internal}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        product.current_stock > 0
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      Stok: {product.current_stock}
                    </span>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-blue-600">
                    {formatRupiah(product.cost_price)}
                  </p>
                  <p className="text-xs text-gray-400">Harga Modal</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase">Sinyal</p>
                    <p className="font-semibold text-gray-800">
                      {product.sinyal}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase">
                      Battery Health
                    </p>
                    <p className="font-semibold text-gray-800">
                      {product.battery_health}%
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase">TrueTone</p>
                    <p className="font-semibold text-gray-800">
                      {product.truetone_status ? "Aktif ✅" : "Mati ❌"}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase">Face ID</p>
                    <p className="font-semibold text-gray-800">
                      {product.face_id_status ? "Aktif ✅" : "Mati ❌"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <Info size={16} /> Minus / Fisik
                    </h4>
                    <p className="text-sm text-gray-600 bg-orange-50 border border-orange-100 p-3 rounded-lg mt-1">
                      {product.minus_description || "Tidak ada minus."}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-800">
                      Identitas Unit
                    </h4>
                    <div className="text-xs text-gray-500 mt-1 font-mono space-y-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <p>IMEI: {product.imei || "-"}</p>
                      <p>Serial: {product.nomor_seri || "-"}</p>
                      <p>Model: {product.nomor_model || "-"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-10 text-center text-red-500">
              Data tidak ditemukan
            </div>
          )}
        </div>
      </div>

      {/* === MODAL POPUP GAMBAR (ZOOM) === */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)} // Klik dimanapun untuk tutup
        >
          {/* Tombol Close Gambar */}
          <button
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
            onClick={() => setPreviewImage(null)}
          >
            <X size={40} />
          </button>

          {/* Gambar Besar */}
          <img
            src={previewImage}
            alt="Preview"
            className="max-h-[90vh] max-w-full rounded-lg shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()} // Biar klik gambar gak nutup modal
          />
        </div>
      )}
    </>
  );
}
