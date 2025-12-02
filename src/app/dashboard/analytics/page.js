"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { MessageCircle, Search, User } from "lucide-react";

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. AMBIL DATA
        const { data, error } = await supabase
          .from("sales")
          .select(
            `
            id,
            sale_price,
            quantity_sold,
            sale_date,
            operational_cost,  
            customer_name,
            customer_contact,
            products (name, cost_price)
          `
          )
          .order("sale_date", { ascending: false });

        if (error) throw error;

        // 2. Olah Data untuk Grafik
        const profitByProduct = {};

        data.forEach((sale) => {
          const productName = sale.products?.name || "Unknown";
          const revenue = sale.sale_price;
          const cost = (sale.products?.cost_price || 0) * sale.quantity_sold;
          const profit = revenue - cost - (sale.operational_cost || 0);

          if (profitByProduct[productName]) {
            profitByProduct[productName] += profit;
          } else {
            profitByProduct[productName] = profit;
          }
        });

        const formattedChartData = Object.keys(profitByProduct).map((key) => ({
          name: key,
          profit: profitByProduct[key],
        }));

        setChartData(formattedChartData);
        setSalesHistory(data);
      } catch (error) {
        console.error("Error:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);

  const filteredSales = salesHistory.filter(
    (sale) =>
      sale.products?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">Loading analytics...</div>
    );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Laporan Penjualan
          </h1>
          <p className="text-sm text-gray-500">
            Analisis performa dan riwayat transaksi.
          </p>
        </div>
      </div>

      {/* GRAFIK CONTAINER */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-8">
          Profit Bersih per Produk
        </h3>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f3f4f6"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                tickFormatter={(value) => `Rp${value / 1000}k`}
              />
              <Tooltip
                cursor={{ fill: "#f9fafb" }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value) => formatRupiah(value)}
              />
              <Bar
                dataKey="profit"
                fill="url(#colorProfit)"
                radius={[6, 6, 0, 0]}
                barSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TABEL TRANSAKSI */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="font-bold text-gray-900">Riwayat Transaksi</h3>
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Cari transaksi..."
              className="pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/50 text-gray-400 font-bold uppercase text-xs">
              <tr>
                <th className="px-8 py-4">Tanggal</th>
                <th className="px-6 py-4">Produk</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4 text-right">Harga</th>
                <th className="px-6 py-4 text-right">Opsional</th>
                <th className="px-8 py-4 text-right">Net Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredSales.map((sale) => {
                const modal =
                  (sale.products?.cost_price || 0) * sale.quantity_sold;
                const ops = sale.operational_cost || 0;
                const profit = sale.sale_price - modal - ops;

                let waLink = "#";
                if (sale.customer_contact) {
                  let number = sale.customer_contact.replace(/\D/g, "");
                  if (number.startsWith("0")) number = "62" + number.slice(1);
                  waLink = `https://wa.me/${number}`;
                }

                return (
                  <tr
                    key={sale.id}
                    className="hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="px-8 py-4 text-gray-500">
                      {new Date(sale.sale_date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {sale.products?.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                          {sale.customer_name || "Umum"}
                        </span>
                        {sale.customer_contact &&
                          sale.customer_contact !== "-" && (
                            <a
                              href={waLink}
                              target="_blank"
                              className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-0.5"
                              rel="noreferrer"
                            >
                              <MessageCircle size={10} />{" "}
                              {sale.customer_contact}
                            </a>
                          )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-600">
                      {formatRupiah(sale.sale_price)}
                    </td>
                    <td className="px-6 py-4 text-right text-red-400 text-xs">
                      {ops > 0 ? `-${formatRupiah(ops)}` : "-"}
                    </td>
                    <td className="px-8 py-4 text-right text-emerald-600 font-bold">
                      +{formatRupiah(profit)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredSales.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              Tidak ada data transaksi.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
