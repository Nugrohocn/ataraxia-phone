"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { History, User } from "lucide-react";

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data, error } = await supabase
          .from("activity_logs")
          .select(
            `
            id,
            created_at,
            action_type,
            description,
            user:user_id (email) 
          `
          ) // Kita join ke auth.users (kalau pakai foreign key) atau profiles
          // Catatan: join ke auth.users agak tricky di Supabase Client.
          // Untuk simpelnya kita ambil data mentah dulu, nanti kita perbaiki relasinya di SQL jika perlu.
          // SEMENTARA: Kita ambil email dari tabel profiles jika relasi sudah dibuat,
          // TAPI karena user_id di activity_logs merujuk ke auth.users, kita perlu setup relasi manual.
          // AGAR MUDAH SEKARANG: Kita tampilkan ID user dulu atau buat relasi ke profiles.

          // REVISI QUERY: Kita ambil data plain dulu
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) throw error;
        setLogs(data);
      } catch (error) {
        console.error("Error fetching logs:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Log Aktivitas</h1>
        <p className="text-sm text-gray-500">
          Rekam jejak aktivitas pengguna sistem.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 w-40">Waktu</th>
                <th className="px-6 py-4 w-32">Tipe</th>
                <th className="px-6 py-4">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="3" className="p-6 text-center">
                    Loading...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-6 text-center text-gray-400">
                    Belum ada aktivitas.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-500">
                      {new Date(log.created_at).toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-bold">
                        {log.action_type}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-800">
                      {log.description}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
