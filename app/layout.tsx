import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Footer from "@/components/Footer";
import "./globals.css";
import { BookingProvider } from "@/context/Booking";

const interFont = Inter({
  variable: "--font-inter",
  subsets: ["latin"]
})

export const metadata: Metadata = {
  title: "Bermalam",
  description: "Kamu butuh tempat bermalam? Tenang Aja! Bermalam Hadir Untuk Memudahkan Kamu Dalam Memesan Hotel Yang Sedang Kamu Tuju",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${interFont.variable} antialiased`}
      >
        <BookingProvider>
          {children}
        </BookingProvider>
        <div className="w-full h-30"></div>
      <Footer/>
      </body>
    </html>
  );
}
