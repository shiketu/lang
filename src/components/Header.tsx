"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { useWs, useDict } from "@/i18n/I18nProvider";
import WorkspaceSwitcher from "@/components/WorkspaceSwitcher";

export default function Header() {
  const router = useRouter();
  const ws = useWs();
  const dict = useDict();
  const [q, setQ] = useState("");

  return (
    <header className="h-16 shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 md:px-8 z-10">
      <div className="flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 px-4 py-2 w-56 md:w-96 focus-within:ring-2 focus-within:ring-indigo-500/30 transition-all">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && q.trim()) {
              router.push(`/${ws}/lakehouse?q=${encodeURIComponent(q.trim())}`);
            }
          }}
          placeholder={dict.common.searchPlaceholder}
          className="bg-transparent border-none outline-none text-sm w-full text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
        />
      </div>

      <div className="flex items-center gap-4">
        <WorkspaceSwitcher />
        <UserButton />
      </div>
    </header>
  );
}
