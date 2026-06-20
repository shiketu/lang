import { notFound } from "next/navigation";
import { Show } from "@clerk/nextjs";
import Nav from "@/components/Nav";
import Header from "@/components/Header";
import PageTransition from "@/components/PageTransition";
import { hasLocale } from "@/lib/workspace";
import { getDictionary } from "@/i18n";
import { I18nProvider } from "@/i18n/I18nProvider";

export function generateStaticParams() {
  return [{ ws: "ja" }, { ws: "en" }];
}

// Per-workspace shell: dictionary + locale-aware chrome. Renders inside the stable
// root layout (which owns <html>/<body>/ClerkProvider), so re-rendering this on a
// workspace switch does not touch the Clerk provider above it.
export default async function WorkspaceLayout({
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
  );
}
