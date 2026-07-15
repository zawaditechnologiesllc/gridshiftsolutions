import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";
import Header from "@/components/header";
import Footer from "@/components/footer";
import MobileNav from "@/components/mobile-nav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: {
    default: "GridShift Solutions — Engineered for Energy Independence",
    template: "%s | GridShift Solutions",
  },
  description:
    "High-performance solar and storage solutions designed for those who demand precision, reliability, and total control over their energy future.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="flex-1 pb-20 md:pb-0">{children}</main>
            <Footer />
            <MobileNav />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
