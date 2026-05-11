import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
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
      className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} antialiased`}
    >
      <body className="min-h-screen bg-canvas flex flex-col items-center justify-center font-sans text-white overflow-x-hidden">
        <main className="w-full max-w-150 min-h-screen bg-canvas flex flex-col relative overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
