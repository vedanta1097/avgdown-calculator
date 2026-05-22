import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kalkulator Averaging Down Saham",
  description:
    "Hitung strategi averaging down saham: berapa lot yang harus dibeli dan berapa uang yang dibutuhkan.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body
        className={`${geist.className} bg-slate-900 text-white min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
