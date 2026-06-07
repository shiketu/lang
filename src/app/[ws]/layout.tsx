import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider, Show } from "@clerk/nextjs";
import Nav from "@/components/Nav";
import Header from "@/components/Header";
import PageTransition from "@/components/PageTransition";
import { hasLocale } from "@/lib/workspace";
import { getDictionary } from "@/i18n";
import { I18nProvider } from "@/i18n/I18nProvider";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Language Learning Platform",
  description:
    "Language learning platform with structured storage, expression practice, and video recording.",
};

export function generateStaticParams() {
  return [{ ws: "ja" }, { ws: "en" }];
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ ws: string }>;
}) {
  const { ws } = await params;
  if (!hasLocale(ws)) notFound();
  const dict = getDictionary(ws);

  return (
    <ClerkProvider>
      <html
        lang={ws}
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="h-screen flex overflow-hidden bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
          <I18nProvider ws={ws} dict={dict}>
            <Show when="signed-in">
              <Nav />
            </Show>
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
              <Show when="signed-in">
                <Header />
              </Show>
              <div className="flex-1 overflow-auto p-4 md:p-8">
                <PageTransition>{children}</PageTransition>
              </div>
            </main>
          </I18nProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
