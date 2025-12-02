"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import StatCard from "@/components/dashboard/StatCard";
import {
  Smartphone,
  ShoppingCart,
  DollarSign,
  Package,
  Wallet,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import DashboardSkeleton from "@/components/ui/DashboardSkeleton";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({});
  const [salesHistory, setSalesHistory] = useState([]);
  const [recentSales, setRecentSales] = useState([]);

  const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num || 0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Dashboard Summary
        const { data: summaryData } = await supabase.rpc(
          "get_dashboard_summary"
        );

        // 2. Data Penjualan (Untuk Grafik & Recent)
        const { data: salesData } = await supabase
          .from("sales")
          .select("id, sale_price, sale_date, products(name)")
          .order("sale_date", { ascending: true });

        setSummary(summaryData || {});

        // Data Grafik
        setSalesHistory(salesData || []);

        // Data Recent (5 Terakhir - Descending)
        setRecentSales([...(salesData || [])].reverse().slice(0, 5));
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8 pb-10">
      {/* === ROW 1: STAT CARDS === */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {/* --- KARTU BARU: SISA MODAL --- */}
        <StatCard
          title="Sisa Modal Investor"
          value={formatRupiah(summary.investor_fund)}
          icon={Package} // Bisa ganti icon Wallet jika mau
          color="purple"
          trend="neutral"
          trendValue="Cash"
        />
        <StatCard
          title="Total Pendapatan"
          value={formatRupiah(summary.total_revenue)}
          icon={DollarSign}
          color="blue"
          trend="up"
          trendValue="+12.5%"
        />
        <StatCard
          title="Unit Terjual"
          value={summary.total_sold_units}
          icon={ShoppingCart}
          color="orange"
          trend="up"
          trendValue="+5"
        />
        <StatCard
          title="Total Profit"
          value={formatRupiah(summary.total_profit)}
          icon={Package}
          color="green"
          trend="up"
          trendValue="+8.2%"
        />
        <StatCard
          title="Sisa Stok"
          value={summary.total_stock_units}
          icon={Smartphone}
          color="blue"
          trend="down"
          trendValue="-2"
        />
      </div>

      {/* === ROW 1.5: WIDGET TALANGAN (Hanya muncul jika ada data) === */}
      {(summary.talangan_stok > 0 || summary.talangan_cair > 0) && (
        <div className="bg-gradient-to-r from-orange-50 to-rose-50 border border-orange-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white text-orange-600 rounded-2xl shadow-sm border border-orange-100">
              <Wallet size={28} strokeWidth={2} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-lg">
                Dana Talangan Pribadi
              </h4>
              <p className="text-sm text-gray-600">
                Rekap uang pribadi yang digunakan untuk modal toko.
              </p>
            </div>
          </div>

          <div className="flex gap-8 text-right w-full md:w-auto bg-white/60 p-4 rounded-2xl border border-white/50 backdrop-blur-sm">
            <div className="flex-1 md:flex-none">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Tertahan di Stok
              </p>
              <p className="font-bold text-gray-700 text-lg">
                {formatRupiah(summary.talangan_stok)}
              </p>
            </div>
            <div className="w-px bg-gray-300"></div>
            <div className="flex-1 md:flex-none">
              <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider mb-1">
                Siap Ditarik (Cair)
              </p>
              <p className="text-2xl font-extrabold text-green-600">
                {formatRupiah(summary.talangan_cair)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* === ROW 2: PROFIT & SPLIT CARD === */}
      <div className="rounded-3xl bg-slate-900 p-8 shadow-xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-indigo-500 opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-blue-500 opacity-20 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Total Profit Section */}
          <div className="text-center md:text-left w-full md:w-auto">
            <p className="text-slate-400 text-sm font-medium mb-2 uppercase tracking-widest">
              Total Keuntungan Bersih
            </p>

            <div className="flex items-center gap-4 justify-center md:justify-start">
              <h2 className="text-5xl font-bold tracking-tight text-white">
                {formatRupiah(summary.total_profit)}
              </h2>

              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                +Net Profit
              </span>
            </div>
          </div>

          {/* Cards Section */}
          <div className="grid grid-cols-2 md:flex gap-4 w-full md:w-auto">
            {/* Investor Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 min-w-[150px] flex-1">
              <p className="text-indigo-300 text-xs font-bold uppercase mb-1">
                Investor ({summary.percent_superadmin}%)
              </p>
              <p className="text-2xl font-bold text-white">
                {formatRupiah(summary.share_superadmin)}
              </p>
            </div>

            {/* Partner Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 min-w-[150px] flex-1">
              <p className="text-amber-300 text-xs font-bold uppercase mb-1">
                Pelaksana ({summary.percent_partner}%)
              </p>
              <p className="text-2xl font-bold text-white">
                {formatRupiah(summary.share_partner)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* === ROW 3: MAIN CHART & WIDGET === */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Grafik Besar */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Analitik Penjualan
              </h3>
              <p className="text-sm text-gray-400">
                Performa penjualan minggu ini
              </p>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesHistory}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f3f4f6"
                />
                <XAxis
                  dataKey="sale_date"
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(str) =>
                    new Date(str).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })
                  }
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  tickFormatter={(val) => `${val / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                  formatter={(value) => formatRupiah(value)}
                />
                <Area
                  type="monotone"
                  dataKey="sale_price"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Widget Kanan */}
        <div className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Baru Terjual</h3>
          <div className="space-y-6">
            {recentSales.map((sale, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold shadow-sm flex-shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 text-sm truncate">
                    {sale.products?.name}
                  </h4>
                  <p className="text-xs text-gray-400">
                    {new Date(sale.sale_date).toLocaleDateString("id-ID")}
                  </p>
                </div>
                <div className="text-right">
                  <span className="block text-sm font-bold text-gray-900">
                    {formatRupiah(sale.sale_price)}
                  </span>
                </div>
              </div>
            ))}
            {recentSales.length === 0 && (
              <p className="text-sm text-gray-400">Belum ada data.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
