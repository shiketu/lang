"use client";

import { usePathname, useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import { useWs } from "@/i18n/I18nProvider";

// Switches the active workspace by swapping the first URL segment (/ja ⇄ /en).
// URL is the single source of truth — no cookie.
export default function WorkspaceSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const ws = useWs();
  const other = ws === "en" ? "ja" : "en";

  function switchTo() {
    const parts = pathname.split("/");
    if (parts.length > 1) parts[1] = other;
    router.push(parts.join("/") || `/${other}`);
  }

  return (
    <button
      onClick={switchTo}
      title={ws === "en" ? "日本語版に切り替え" : "Switch to English"}
      className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
    >
      <Languages className="w-4 h-4" />
      {ws === "en" ? "日本語" : "English"}
    </button>
  );
}
