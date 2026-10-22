import "./globals.css";

export const metadata = {
  title: "3D Baskı İş Takip & Finans Yönetim Sistemi",
  description: "3D Baskı Atölyesi İçin Sipariş Takibi, Süre/Maliyet Hesaplayıcı ve Trendyol Finans Yönetimi (Next.js + Turso)",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2306b6d4' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2'/><path d='M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6'/><rect x='6' y='14' width='12' height='8' rx='1'/></svg>"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className="dark">
      <body className="bg-[#0b0f19] text-gray-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
