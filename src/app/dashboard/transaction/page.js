"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Search, ShoppingBag, ArrowRight, User, Fuel, Tag } from "lucide-react";

export default function TransactionPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [salePrice, setSalePrice] = useState("");
  const [operationalCost, setOperationalCost] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");

  useEffect(() => {
    const fetchAvailableProducts = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .gt("current_stock", 0)
          .order("name", { ascending: true });

        if (error) throw error;
        setProducts(data);
      } catch (error) {
        console.error("Error:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAvailableProducts();
  }, []);

  const handleSale = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !salePrice)
      return alert("Pilih produk dan isi harga jual!");
    setSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User tidak ditemukan");

      const { error } = await supabase.rpc("handle_new_sale", {
        p_product_id: selectedProduct.id,
        p_quantity_sold: 1,
        p_sale_price: parseInt(salePrice),
        p_user_id: user.id,
        p_operational_cost: parseInt(operationalCost) || 0,
        p_customer_name: customerName || "Umum",
        p_customer_contact: customerContact || "-",
      });

      if (error) throw error;
      alert(`Sukses! ${selectedProduct.name} terjual.`);
      router.push("/dashboard");
    } catch (error) {
      alert("Gagal transaksi: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const calculateRealProfit = () => {
    const price = parseInt(salePrice) || 0;
    const cost = selectedProduct?.cost_price || 0;
    const opCost = parseInt(operationalCost) || 0;
    return price - cost - opCost;
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.imei && p.imei.includes(searchTerm))
  );

  const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);

  return (
    // FIX RESPONSIF:
    // Mobile: flex-col, height auto
    // Desktop (lg): flex-row, height dikunci (calc) agar scroll internal
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 h-auto lg:h-[calc(100vh-8rem)]">
      {/* KOLOM KIRI: KATALOG PRODUK */}
      {/* Mobile: height auto, Desktop: height full */}
      <div className="flex-1 flex flex-col h-auto lg:h-full">
        {/* Header & Search */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kasir</h1>
            <p className="text-sm text-gray-500">Pilih produk untuk dijual.</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Cari Produk..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Grid Produk */}
        {/* Mobile: scroll page biasa, Desktop: overflow-y-auto */}
        <div className="flex-1 lg:overflow-y-auto pr-0 lg:pr-2 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {loading ? (
              <p className="text-gray-400">Loading...</p>
            ) : (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    setSelectedProduct(product);
                    // Scroll ke form di mobile saat produk diklik
                    if (window.innerWidth < 1024) {
                      document
                        .getElementById("cart-section")
                        .scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className={`
                                cursor-pointer rounded-3xl p-5 transition-all duration-200 border
                                ${
                                  selectedProduct?.id === product.id
                                    ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200 shadow-lg"
                                    : "border-transparent bg-white hover:border-gray-200 hover:shadow-md shadow-sm"
                                }
                            `}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wide">
                      Ready
                    </span>
                    <span className="text-xs font-bold text-gray-400">
                      {product.ram_internal}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg mb-1 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-400 mb-4 font-mono">
                    {product.imei || "No IMEI"}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Modal</span>
                    <span className="font-bold text-gray-900">
                      {formatRupiah(product.cost_price)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* KOLOM KANAN: CART / CHECKOUT */}
      {/* Mobile: Width Full, Order last. Desktop: Width 96px fixed */}
      <div
        id="cart-section"
        className="w-full lg:w-96 bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col h-auto lg:h-full overflow-hidden shrink-0 mb-8 lg:mb-0"
      >
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag size={20} className="text-blue-600" /> Detail Transaksi
          </h2>
        </div>

        <div className="flex-1 p-6 overflow-y-auto lg:overflow-y-auto">
          {selectedProduct ? (
            <form id="saleForm" onSubmit={handleSale} className="space-y-6">
              {/* Selected Item */}
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                <p className="text-xs text-blue-600 font-bold uppercase mb-1">
                  Item Terpilih
                </p>
                <p className="font-bold text-gray-900 text-lg">
                  {selectedProduct.name}
                </p>
                <div className="flex justify-between mt-2 text-sm text-blue-800/70">
                  <span>Modal Awal:</span>
                  <span>{formatRupiah(selectedProduct.cost_price)}</span>
                </div>
              </div>

              {/* Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                    Harga Jual (Deal)
                  </label>
                  <div className="relative mt-1">
                    <Tag
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      type="number"
                      required
                      placeholder="0"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-900"
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                    Biaya Operasional
                  </label>
                  <div className="relative mt-1">
                    <Fuel
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none font-medium text-red-600"
                      value={operationalCost}
                      onChange={(e) => setOperationalCost(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-dashed border-gray-200">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-2 block">
                    Info Pembeli
                  </label>
                  <div className="space-y-2">
                    <div className="relative">
                      <User
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={16}
                      />
                      <input
                        type="text"
                        placeholder="Nama Customer"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="No. WhatsApp"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      value={customerContact}
                      onChange={(e) => setCustomerContact(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="h-64 lg:h-full flex flex-col items-center justify-center text-gray-400 space-y-4 opacity-50">
              <ShoppingBag size={48} />
              <p className="text-center text-sm">
                Pilih produk dari katalog
                <br />
                untuk memulai transaksi
              </p>
            </div>
          )}
        </div>

        {/* Footer Summary */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          {selectedProduct && salePrice && (
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-gray-500">
                Estimasi Profit
              </span>
              <span
                className={`text-xl font-extrabold ${
                  calculateRealProfit() >= 0 ? "text-green-600" : "text-red-500"
                }`}
              >
                {formatRupiah(calculateRealProfit())}
              </span>
            </div>
          )}
          <button
            form="saleForm"
            type="submit"
            disabled={!selectedProduct || submitting}
            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              "Memproses..."
            ) : (
              <>
                <ArrowRight size={18} /> Konfirmasi Penjualan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
