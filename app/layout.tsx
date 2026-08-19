import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "ALMACO FASHION | E-Commerce Premium",
  description: "Sentuhan rancangan arsitektural untuk kepribadian modern.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#E6E3DA] text-[#1A1A1A]">
        <AuthProvider>
          <KeranjangProvider>
            {children}
          </KeranjangProvider>
        </AuthProvider>
      </body>
    </html>
  );
}