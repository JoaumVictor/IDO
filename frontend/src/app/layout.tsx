import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IDO Project | Tamagotchi Social",
  description: "Treine e molde a personalidade do seu IDO.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-screen bg-gray-950 flex flex-col items-center justify-center font-sans text-gray-900 overflow-x-hidden">
        {/* Container limitador Mobile-First */}
        <main className="w-full max-w-[600px] min-h-screen bg-gray-50 flex flex-col relative shadow-2xl overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
