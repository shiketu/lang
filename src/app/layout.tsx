import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider, Show } from "@clerk/nextjs";
import Nav from "@/components/Nav";
import Header from "@/components/Header";
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
  title: "言語学習プラットフォーム",
  description: "Japanese language learning platform with structured storage, expression practice, and video recording.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="ja"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="h-screen flex overflow-hidden bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
          <Show when="signed-in">
            <Nav />
          </Show>
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <Show when="signed-in">
              <Header />
            </Show>
            <div className="flex-1 overflow-auto p-4 md:p-8">{children}</div>
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
