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
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://almacofashion.com"),
  alternates: {
    canonical: "/",
  },
  title: {
    default: "ALMACO FASHION | E-Commerce Premium",
    template: "%s | ALMACO FASHION",
  },
  description:
    "Grosir & Eceran Busana Muslimah Premium langsung dari Konveksi. Sentuhan rancangan arsitektural untuk kepribadian modern.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "ALMACO FASHION | E-Commerce Premium",
    description:
      "Grosir & Eceran Busana Muslimah Premium langsung dari Konveksi. Sentuhan rancangan arsitektural untuk kepribadian modern.",
    url: "https://almacofashion.com",
    siteName: "ALMACO FASHION",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 800,
        alt: "Logo ALMACO FASHION",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ALMACO FASHION | E-Commerce Premium",
    description:
      "Grosir & Eceran Busana Muslimah Premium langsung dari Konveksi.",
    images: ["/logo.png"],
  },
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
