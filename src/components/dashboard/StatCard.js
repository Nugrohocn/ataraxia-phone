import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color,
}) {
  // Logic warna trend (Naik = Hijau, Turun = Merah)
  const isPositive = trend === "up";

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 transition-transform hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div
          className={`p-3 rounded-2xl ${
            color === "blue"
              ? "bg-blue-50 text-blue-600"
              : color === "orange"
              ? "bg-orange-50 text-orange-600"
              : "bg-green-50 text-green-600"
          }`}
        >
          <Icon size={24} strokeWidth={2.5} />
        </div>

        {/* Trend Indicator ala Referensi */}
        {trendValue && (
          <div
            className={`flex items-center gap-1 text-xs font-bold ${
              isPositive ? "text-green-500" : "text-red-500"
            }`}
          >
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{trendValue}</span>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          {value}
        </h3>
        <p className="text-sm font-semibold text-gray-400 mt-1">{title}</p>
      </div>
    </div>
  );
}
