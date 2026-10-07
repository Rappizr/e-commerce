import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { KeranjangProvider } from "./penyimpanan/KeranjangContext";
import { AuthProvider } from "./penyimpanan/authcontext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#E6E3DA",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://almacofashion.com"),
  alternates: {
    canonical: "/",
  },
  title: {
    default: "ALMACO FASHION — Grosir & Eceran Busana Muslimah Berkualitas",
    template: "%s | ALMACO FASHION",
  },
  description:
    "Belanja busana butik Indonesia dan fashion muslimah syar'i berkualitas langsung dari konveksi di Tulungagung. Grosir & eceran gamis, abaya, dan tunik premium. Kirim ke seluruh Indonesia.",
  keywords: [
    "busana muslimah",
    "grosir busana muslimah",
    "fashion muslimah premium",
    "gamis premium",
    "abaya",
    "tunik muslimah",
    "konveksi busana muslimah",
    "ALMACO FASHION",
    "baju muslim wanita",
    "pakaian syari",
    "toko baju tulungagung",
    "toko baju muslimah",
    "toko baju muslimah tulungagung",
    "toko baju muslimah online",
    "toko baju muslimah grosir",
    "toko baju muslimah eceran",
    "toko baju muslimah berkualitas",
    "toko baju muslimah murah",
    "toko baju muslimah premium",
    "toko baju muslimah terpercaya",
    "gamis tulungagung",
    "gamis tulungagung online",
    "gamis tulungagung grosir",
    "beli baju tulungagung",
    "beli baju muslimah tulungagung",
    "beli baju muslimah online",
    "almaco fashion tulungagung",
    "baju tulungagung",
    "baju muslimah tulungagung",
    "eceran gamis",
    "daster tulungagung",
    "daster tulungagung online",
    "set cell tulungagung",
    "beli daster",
    "polinema daster",
    "beli daster tulungagung",
    "beli daster eceran",
    "daster eceran",
    "daster termurah",
    "gamis eceran",
    "abaya eceran",
    "tunik eceran",
    "gamis termurah",
    "abaya termurah",
    "tunik termurah",
    "abaya tulungagung",
    "gamis tulungagung",
    "tunik tulungagung",
    "daster terdekat",
    "gamis terdekat",
    "abaya terdekat",
    "tunik terdekat",
  ],
  authors: [{ name: "ALMACO FASHION", url: "https://almacofashion.com" }],
  creator: "ALMACO FASHION",
  publisher: "ALMACO FASHION",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "ALMACO FASHION — Grosir & Eceran Busana Muslimah Berkualitas",
    description:
      "Belanja busana butik Indonesia dan fashion muslimah syar'i berkualitas langsung dari konveksi di Tulungagung. Grosir & eceran gamis, abaya, dan tunik premium. Kirim ke seluruh Indonesia.",
    url: "https://almacofashion.com",
    siteName: "ALMACO FASHION",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Logo ALMACO FASHION — Grosir & Eceran Busana Muslimah Berkualitas",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ALMACO FASHION — Grosir & Eceran Busana Muslimah Berkualitas",
    description:
      "Belanja busana butik Indonesia dan fashion muslimah syar'i berkualitas langsung dari konveksi di Tulungagung. Grosir & eceran gamis, abaya, dan tunik premium. Kirim ke seluruh Indonesia.",
    images: ["/og-image.jpg"],
  },
  category: "fashion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#E6E3DA] text-[#1A1A1A] selection:bg-amber-900 selection:text-white">
        <AuthProvider>
          <KeranjangProvider>{children}</KeranjangProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
