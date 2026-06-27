import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
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
  title: "Language Learning Platform",
  description:
    "Language learning platform with structured storage, expression practice, and video recording.",
  applicationName: "LangLearn",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LangLearn",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

// Stable app shell. ClerkProvider lives here (not in [ws]) so switching workspace
// (/ja ⇄ /en) never remounts it — otherwise Clerk re-initializes on every switch and
// the UserButton/Header flicker. The <html lang> is corrected per-route on the client
// by I18nProvider.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html
        lang="ja"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="h-screen flex overflow-hidden bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
          {children}
          <ServiceWorkerRegister />
        </body>
      </html>
    </ClerkProvider>
  );
}
