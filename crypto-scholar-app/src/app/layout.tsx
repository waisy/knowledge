import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import 'katex/dist/katex.min.css';
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Crypto Scholar",
  description: "Knowledge base for crypto products",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <div 
          className="relative flex min-h-screen flex-col bg-background"
        >
          <div className="container mx-auto flex-1 items-start md:grid md:grid-cols-[240px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">
            <Sidebar />
            <main className="relative py-6 lg:py-8 px-4">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
