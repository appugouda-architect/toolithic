import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/shared/Header";

export const metadata: Metadata = {
  title: "Toolithic - Ultimate Pro Toolkit",
  description: "Bite-sized utility tools for developers, designers, and creators. 100% local, 100% secure.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-black">
        <Header />
        <main className="flex-1 pt-16">{children}</main>
      </body>
    </html>
  );
}