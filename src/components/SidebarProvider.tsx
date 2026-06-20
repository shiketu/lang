"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { usePathname } from "next/navigation";

// Shares the mobile sidebar's open state between the hamburger (Header) and the
// drawer (Nav), which are siblings in the layout tree. No effect on desktop,
// where the sidebar is always visible (md:static).
const Ctx = createContext<{
  open: boolean;
  toggle: () => void;
  close: () => void;
} | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer after navigating.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on Escape while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const toggle = useCallback(() => setOpen((o) => !o), []);
  const close = useCallback(() => setOpen(false), []);

  return <Ctx.Provider value={{ open, toggle, close }}>{children}</Ctx.Provider>;
}

export function useSidebar() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useSidebar must be used within SidebarProvider");
  return c;
}
