import { Inter } from "next/font/google";
import "./globals.css";
// 1. Import Toaster
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Nuka Phone Management",
  description: "Sistem Manajemen Stok & Kasir HP Bekas",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        {children}

        {/* 2. Pasang Toaster disini */}
        <Toaster position="top-right" richColors closeButton theme="light" />
      </body>
    </html>
  );
}
