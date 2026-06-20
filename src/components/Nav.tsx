"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  Database,
  BookOpen,
  Edit3,
  Video,
  ListTodo,
  BrainCircuit,
  Mic,
  X,
  type LucideIcon,
} from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav";
import { useWs, useDict } from "@/i18n/I18nProvider";
import { useSidebar } from "@/components/SidebarProvider";

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  Database,
  BookOpen,
  Edit3,
  Video,
  ListTodo,
  BrainCircuit,
  Mic,
};

export default function Nav() {
  const pathname = usePathname();
  const ws = useWs();
  const dict = useDict();
  const { open, close } = useSidebar();
  const navLabels = dict.nav as Record<string, string>;

  return (
    <>
      {/* Mobile backdrop (md+: never shown, sidebar is static) */}
      <div
        onClick={close}
        aria-hidden="true"
        className={`fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm transition-opacity md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Off-canvas on mobile (slides in when open); static column on md+ */}
      <nav
        className={`fixed inset-y-0 left-0 z-40 w-64 shrink-0 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-200 ease-out md:static md:z-auto md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo + mobile close */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            {dict.common.brandMark}
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
            {dict.common.appName}
          </span>
          <button
            onClick={close}
            aria-label={dict.common.close}
            className="ml-auto p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <div className="flex-1 px-4 py-2 overflow-y-auto">
          <p className="px-3 mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            {dict.nav.menuTitle}
          </p>
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = ICONS[item.icon] ?? LayoutDashboard;
              const full = item.href === "/" ? `/${ws}` : `/${ws}${item.href}`;
              const active =
                item.href === "/"
                  ? pathname === `/${ws}`
                  : pathname.startsWith(full);
              return (
                <li key={item.id}>
                  <Link
                    href={full}
                    onClick={close}
                    className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                      active
                        ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 font-medium"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-indigo-600 dark:bg-indigo-400"
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      />
                    )}
                    <Icon
                      className={`w-5 h-5 ${
                        active
                          ? "text-indigo-600 dark:text-indigo-300"
                          : "text-slate-400"
                      }`}
                    />
                    {navLabels[item.id] ?? item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </>
  );
}
