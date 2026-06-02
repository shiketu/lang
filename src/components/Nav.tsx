"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { NAV_ITEMS } from "@/lib/nav";

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="w-56 shrink-0 border-r border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-lg font-bold">言語学習</h1>
        <p className="text-xs text-gray-500">Language Learning Platform</p>
      </div>
      <ul className="flex-1 p-2 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                  active
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <UserButton showName />
      </div>
    </nav>
  );
}
