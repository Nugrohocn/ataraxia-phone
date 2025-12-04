import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Ataraxia Phone Management",
  description: "Sistem Manajemen Stok & Kasir HP Bekas",
};

export default function RootLayout({ children }) {
  return (
    // --- PERBAIKAN: Tambahkan suppressHydrationWarning={true} ---
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        {children}
        <Toaster position="top-right" richColors closeButton theme="light" />
      </body>
    </html>
  );
}
