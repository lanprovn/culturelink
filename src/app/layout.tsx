import type { Metadata } from "next";
import { Be_Vietnam_Pro, Dancing_Script } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-vietnam",
});

const dancingScript = Dancing_Script({
  subsets: ["latin", "vietnamese"],
  weight: ["600", "700"],
  variable: "--font-script",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://culturelink-vn.pages.dev"),
  title: "CultureLink – Khám phá Văn hóa & Nghệ thuật TP.HCM",
  description: "Nền tảng đặt vé, bản đồ di sản, trải nghiệm workshop và kết nối cộng đồng văn hóa tại TP. Hồ Chí Minh.",
  keywords: ["CultureLink", "CulturePass", "Văn hóa Sài Gòn", "Vé sự kiện", "Triển lãm TP.HCM", "Workshop", "Bản đồ di sản"],
  openGraph: {
    title: "CultureLink – Nền tảng Trải nghiệm Văn hóa & Nghệ thuật TP.HCM",
    description: "Khám phá bản đồ văn hóa tương tác, đặt vé sự kiện nghệ thuật và trắc nghiệm tìm gu trải nghiệm.",
    url: "https://culturelink-vn.pages.dev",
    siteName: "CultureLink",
    locale: "vi_VN",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning className={`${beVietnamPro.variable} ${dancingScript.variable} h-full antialiased`}>
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body suppressHydrationWarning className="min-h-screen bg-app font-sans antialiased text-foreground">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
