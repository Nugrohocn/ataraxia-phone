"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  ArrowLeft,
  Save,
  UploadCloud,
  Image as ImageIcon,
  Film,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner"; // Pastikan sudah install sonner

export default function EditPhonePage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // State Data HP
  const [formData, setFormData] = useState({
    name: "",
    brand: "Apple",
    ram_internal: "",
    cost_price: "",
    current_stock: 0,
    sinyal: "All Operator",
    face_id_status: true,
    truetone_status: true,
    battery_health: 0,
    minus_description: "",
    other_notes: "",
    nomor_model: "",
    nomor_seri: "",
    imei: "",
  });

  // State Media
  const [existingMedia, setExistingMedia] = useState([]);
  const [newFiles, setNewFiles] = useState({
    depan: null,
    belakang: null,
    samping: null,
    dus: null,
    video: null,
  });

  // 1. Fetch Data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*, product_media(*)")
          .eq("id", id)
          .single();

        if (error) throw error;

        if (data) {
          const { product_media, ...productDetails } = data;
          setFormData(productDetails);
          setExistingMedia(product_media || []);
        }
      } catch (error) {
        toast.error("Gagal mengambil data: " + error.message);
        router.push("/dashboard/phone");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id, router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e, category) => {
    const file = e.target.files[0];
    if (file) setNewFiles((prev) => ({ ...prev, [category]: file }));
  };

  const handleDeleteMedia = async (mediaId) => {
    if (!confirm("Yakin hapus foto ini?")) return;
    try {
      const { error } = await supabase
        .from("product_media")
        .delete()
        .eq("id", mediaId);
      if (error) throw error;
      setExistingMedia((prev) => prev.filter((m) => m.id !== mediaId));
      toast.success("Foto dihapus");
    } catch (error) {
      toast.error("Gagal hapus media");
    }
  };

  const handleCancelUpload = (category) =>
    setNewFiles((prev) => ({ ...prev, [category]: null }));

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
    setSubmitting(true);
    const toastId = toast.loading("Menyimpan perubahan...");

    try {
      // Update Data
      const { error } = await supabase
        .from("products")
        .update(formData)
        .eq("id", id);
      if (error) throw error;

      // Upload Files
      const mediaPromises = [];
      for (const [category, file] of Object.entries(newFiles)) {
        if (file) {
          const fileExt = file.name.split(".").pop();
          const fileName = `${id}_${category}_${Date.now()}.${fileExt}`;
          const filePath = `phones/${fileName}`;
          const uploadPromise = uploadFileToStorage(file, filePath).then(
            (url) => {
              return supabase.from("product_media").insert({
                product_id: id,
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

      toast.success("Data HP berhasil diperbarui!", { id: toastId });
      router.push("/dashboard/phone");
    } catch (error) {
      toast.error("Gagal update: " + error.message, { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  // --- Helper Render Media Input (UI Modern) ---
  const renderMediaInput = (label, category, icon) => {
    const existing = existingMedia.find((m) => m.category === category);
    const newFile = newFiles[category];

    return (
      <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center hover:bg-blue-50/50 hover:border-blue-300 transition-all relative group bg-gray-50/50">
        {newFile ? (
          <div>
            <p className="text-xs text-green-600 font-bold mb-1 uppercase tracking-wide">
              Siap Upload
            </p>
            <p className="text-xs text-gray-600 truncate mb-2 font-medium">
              {newFile.name}
            </p>
            <button
              type="button"
              onClick={() => handleCancelUpload(category)}
              className="text-[10px] text-red-500 hover:text-red-700 font-bold uppercase tracking-wider border border-red-200 px-2 py-1 rounded bg-white"
            >
              Batalkan
            </button>
          </div>
        ) : existing ? (
          <div className="relative">
            {category === "video" ? (
              <div className="flex flex-col items-center py-2 text-gray-400">
                <Film size={24} />
                <span className="text-[10px] mt-1 font-bold">VIDEO ADA</span>
              </div>
            ) : (
              <img
                src={existing.file_url}
                alt={label}
                className="h-20 w-full object-cover rounded-lg shadow-sm"
              />
            )}
            <button
              type="button"
              onClick={() => handleDeleteMedia(existing.id)}
              className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600 transition-colors"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ) : (
          <label className="cursor-pointer block w-full h-full flex flex-col items-center justify-center">
            <div className="h-10 w-10 bg-white text-blue-600 rounded-xl shadow-sm flex items-center justify-center mb-2 border border-gray-100 group-hover:scale-110 transition-transform">
              {icon}
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide group-hover:text-blue-600">
              {label}
            </span>
            <input
              type="file"
              accept={category === "video" ? "video/*" : "image/*"}
              className="hidden"
              onChange={(e) => handleFileChange(e, category)}
            />
          </label>
        )}
      </div>
    );
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Header Back */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard/phone"
          className="p-3 bg-white border border-gray-200 hover:border-gray-300 rounded-xl transition-all shadow-sm"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Edit Data</h1>
          <p className="text-sm text-gray-500">
            Perbarui informasi stok dan kondisi unit.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Identitas (Card Modern) */}
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
                value={formData.name}
                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-gray-900"
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
                  value={formData.brand}
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
                value={formData.ram_internal}
                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-gray-900"
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                Modal
              </label>
              <input
                name="cost_price"
                type="number"
                required
                value={formData.cost_price}
                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-gray-900"
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                Stok Saat Ini
              </label>
              <input
                name="current_stock"
                type="number"
                required
                value={formData.current_stock}
                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-gray-900"
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Media (Fitur Edit) */}
        <div className="bg-white rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100 flex items-center gap-2">
            <UploadCloud size={20} className="text-blue-600" />
            Edit Foto & Video
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {renderMediaInput("Foto Depan", "depan", <ImageIcon size={20} />)}
            {renderMediaInput(
              "Foto Belakang",
              "belakang",
              <ImageIcon size={20} />
            )}
            {renderMediaInput(
              "Foto Samping",
              "samping",
              <ImageIcon size={20} />
            )}
            {renderMediaInput("Dusbook", "dus", <PackageIcon />)}
            {renderMediaInput("Video Unit", "video", <Film size={20} />)}
          </div>
        </div>

        {/* Kondisi */}
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
                  value={formData.sinyal}
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
                value={formData.battery_health || ""}
                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-gray-900"
                onChange={handleChange}
              />
            </div>
            <div className="flex items-center gap-6 mt-8">
              <label className="flex items-center gap-3 cursor-pointer select-none bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 w-full hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  name="face_id_status"
                  checked={formData.face_id_status}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                />
                <span className="text-sm font-bold text-gray-700">Face ID</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer select-none bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 w-full hover:bg-gray-100 transition-colors">
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
                Minus / Deskripsi
              </label>
              <textarea
                name="minus_description"
                rows="2"
                value={formData.minus_description || ""}
                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-gray-900"
                onChange={handleChange}
              ></textarea>
            </div>
          </div>
        </div>

        {/* Submit Button Fixed at Bottom (Opsional, atau static di bawah form) */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-2xl hover:bg-black font-bold shadow-lg shadow-gray-300 hover:shadow-xl transition-all disabled:opacity-50 active:scale-95"
          >
            <Save size={20} />
            {submitting ? "Menyimpan..." : "Simpan Perubahan"}
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
