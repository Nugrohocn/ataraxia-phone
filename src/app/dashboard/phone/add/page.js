"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  ArrowLeft,
  Save,
  UploadCloud,
  Image as ImageIcon,
  Film,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function AddPhonePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    brand: "Apple",
    ram_internal: "",
    cost_price: "",
    modal_pribadi: "", // <--- FIELD BARU (Dana Talangan)
    current_stock: 1,
    sinyal: "All Operator",
    face_id_status: true,
    truetone_status: true,
    battery_health: 90,
    minus_description: "Mulus",
    other_notes: "",
    nomor_model: "",
    nomor_seri: "",
    imei: "",
  });

  const [files, setFiles] = useState({
    depan: null,
    belakang: null,
    samping: null,
    dus: null,
    video: null,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e, category) => {
    const file = e.target.files[0];
    if (file) {
      setFiles((prev) => ({ ...prev, [category]: file }));
    }
  };

  const uploadFileToStorage = async (file, pathName) => {
    const { error } = await supabase.storage
      .from("product-images")
      .upload(pathName, file);

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from("product-images").getPublicUrl(pathName);

    return publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUploading(true);

    const toastId = toast.loading("Sedang menyimpan data...");

    try {
      // 1. Simpan Data Produk
      const { data: productData, error: productError } = await supabase
        .from("products")
        .insert([
          {
            ...formData,
            // Pastikan angka valid atau 0
            cost_price: parseInt(formData.cost_price) || 0,
            modal_pribadi: parseInt(formData.modal_pribadi) || 0,
            current_stock: parseInt(formData.current_stock) || 1,
            battery_health: parseInt(formData.battery_health) || 0,
          },
        ])
        .select()
        .single();

      if (productError) throw productError;

      const newProductId = productData.id;

      // 2. Upload Files
      const mediaPromises = [];
      for (const [category, file] of Object.entries(files)) {
        if (file) {
          const fileExt = file.name.split(".").pop();
          const fileName = `${newProductId}_${category}_${Date.now()}.${fileExt}`;
          const filePath = `phones/${fileName}`;

          const uploadPromise = uploadFileToStorage(file, filePath).then(
            (url) => {
              return supabase.from("product_media").insert({
                product_id: newProductId,
                file_url: url,
                category: category,
                media_type: category === "video" ? "video" : "image",
              });
            }
          );
          mediaPromises.push(uploadPromise);
        }
      }

      await Promise.all(mediaPromises);

      toast.success("Stok HP berhasil ditambahkan!", {
        id: toastId,
        description: `${formData.name} kini tersedia di inventaris.`,
      });

      router.push("/dashboard/phone");
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyimpan data", {
        id: toastId,
        description: error.message,
      });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard/phone"
          className="p-3 bg-white border border-gray-200 hover:border-gray-300 rounded-xl transition-all shadow-sm"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Tambah Stok Baru
          </h1>
          <p className="text-sm text-gray-500">
            Input data unit HP yang baru masuk.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Identitas */}
        <div className="bg-white rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">
            Identitas Unit
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                Nama HP
              </label>
              <input
                name="name"
                required
                placeholder="Contoh: iPhone 11 Pro"
                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-gray-900 placeholder:text-gray-300"
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                Brand
              </label>
              <div className="relative">
                <select
                  name="brand"
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-gray-900 appearance-none"
                  onChange={handleChange}
                >
                  <option value="Apple">Apple</option>
                  <option value="Samsung">Samsung</option>
                  <option value="Xiaomi">Xiaomi</option>
                  <option value="Oppo">Oppo</option>
                  <option value="Vivo">Vivo</option>
                  <option value="Other">Lainnya</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                RAM / Internal
              </label>
              <input
                name="ram_internal"
                required
                placeholder="Contoh: 4/64GB"
                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-gray-900 placeholder:text-gray-300"
                onChange={handleChange}
              />
            </div>

            {/* --- MODAL TOKO --- */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                Modal Toko (Harga Beli)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                  Rp
                </span>
                <input
                  name="cost_price"
                  type="number"
                  required
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* --- INPUT BARU: DANA TALANGAN --- */}
            <div className="col-span-1 md:col-span-2 bg-orange-50/50 p-4 rounded-2xl border border-orange-100 flex flex-col md:flex-row items-center gap-4">
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-orange-600 uppercase tracking-wider mb-2 ml-1">
                  Dana Talangan Pribadi (Opsional)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400 font-bold">
                    Rp
                  </span>
                  <input
                    name="modal_pribadi"
                    type="number"
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-3.5 bg-white border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-bold text-orange-800 placeholder:text-orange-200"
                    onChange={handleChange}
                  />
                </div>
                <p className="text-[10px] text-orange-500 mt-2 ml-1">
                  * Isi jika Anda menggunakan uang pribadi untuk menutupi
                  kekurangan modal toko.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detail Serial */}
        <div className="bg-white rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">
            Detail Serial & IMEI
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                Nomor Model
              </label>
              <input
                name="nomor_model"
                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-gray-900"
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                Nomor Seri
              </label>
              <input
                name="nomor_seri"
                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-gray-900"
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                IMEI
              </label>
              <input
                name="imei"
                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-gray-900 tracking-wide"
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Media Upload */}
        <div className="bg-white rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100 flex items-center gap-2">
            <UploadCloud size={20} className="text-blue-600" />
            Media & Dokumentasi
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {["depan", "belakang", "samping", "dus", "video"].map((type) => (
              <div
                key={type}
                className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center hover:bg-blue-50/50 hover:border-blue-300 transition-all cursor-pointer relative group bg-gray-50/50"
              >
                <label className="cursor-pointer block w-full h-full">
                  <div className="mx-auto h-12 w-12 bg-white text-blue-600 rounded-xl shadow-sm flex items-center justify-center mb-3 border border-gray-100 group-hover:scale-110 transition-transform">
                    {type === "video" ? (
                      <Film size={20} />
                    ) : (
                      <ImageIcon size={20} />
                    )}
                  </div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1 group-hover:text-blue-600 transition-colors">
                    {type}
                  </span>
                  <span className="text-[10px] text-gray-400 block truncate px-2">
                    {files[type] ? (
                      <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">
                        Terpilih
                      </span>
                    ) : (
                      "Klik Upload"
                    )}
                  </span>
                  <input
                    type="file"
                    accept={type === "video" ? "video/*" : "image/*"}
                    className="hidden"
                    onChange={(e) => handleFileChange(e, type)}
                  />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Kondisi Fisik */}
        <div className="bg-white rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">
            Kondisi Fisik
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                Status Sinyal
              </label>
              <div className="relative">
                <select
                  name="sinyal"
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-gray-900 appearance-none"
                  onChange={handleChange}
                >
                  <option value="All Operator">All Operator</option>
                  <option value="WiFi Only">WiFi Only</option>
                  <option value="Smartfren Only">Smartfren Only</option>
                  <option value="Blokir IMEI">Blokir IMEI</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                Battery Health (%)
              </label>
              <input
                name="battery_health"
                type="number"
                placeholder="Cth: 90"
                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-gray-900"
                onChange={handleChange}
              />
            </div>
            <div className="flex items-center gap-6 mt-8">
              <label className="flex items-center gap-3 cursor-pointer select-none bg-gray-50 px-4 py-3.5 rounded-2xl border border-gray-200 w-full hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  name="face_id_status"
                  checked={formData.face_id_status}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                />
                <span className="text-sm font-bold text-gray-700">Face ID</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer select-none bg-gray-50 px-4 py-3.5 rounded-2xl border border-gray-200 w-full hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  name="truetone_status"
                  checked={formData.truetone_status}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                />
                <span className="text-sm font-bold text-gray-700">
                  TrueTone
                </span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                Minus / Deskripsi Fisik
              </label>
              <textarea
                name="minus_description"
                rows="2"
                placeholder="Cth: Mulus, lecet pemakaian wajar..."
                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-gray-900"
                onChange={handleChange}
              ></textarea>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                Catatan Lain (Internal)
              </label>
              <textarea
                name="other_notes"
                rows="2"
                placeholder="Cth: Sudah ganti baterai..."
                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-gray-900"
                onChange={handleChange}
              ></textarea>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-2xl hover:bg-black font-bold shadow-lg shadow-gray-300 hover:shadow-xl transition-all disabled:opacity-50 active:scale-95"
          >
            <Save size={20} />
            {loading
              ? uploading
                ? "Mengupload Foto..."
                : "Menyimpan Data..."
              : "Simpan Stok & Media"}
          </button>
        </div>
      </form>
    </div>
  );
}

function PackageIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
      <line x1="12" y1="22.08" x2="12" y2="12"></line>
    </svg>
  );
}
