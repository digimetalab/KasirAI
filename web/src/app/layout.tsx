import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KasirAI - Smart POS untuk UMKM Indonesia",
  description: "Sistem kasir cerdas dengan AI untuk bisnis Anda",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white antialiased">
        {children}
      </body>
    </html>
  );
}
