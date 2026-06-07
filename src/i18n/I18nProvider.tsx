"use client";

import { createContext, useContext, useEffect } from "react";
import type { Workspace } from "@/lib/workspace";
import type { Dictionary } from "./index";

const Ctx = createContext<{ ws: Workspace; dict: Dictionary } | null>(null);

export function I18nProvider({
  ws,
  dict,
  children,
}: {
  ws: Workspace;
  dict: Dictionary;
  children: React.ReactNode;
}) {
  // Keep <html lang> correct on the client (root is rendered with the route's ws).
  useEffect(() => {
    document.documentElement.lang = ws;
  }, [ws]);

  return <Ctx.Provider value={{ ws, dict }}>{children}</Ctx.Provider>;
}

export function useDict(): Dictionary {
  const c = useContext(Ctx);
  if (!c) throw new Error("useDict must be used within I18nProvider");
  return c.dict;
}

export function useWs(): Workspace {
  return useContext(Ctx)?.ws ?? "ja";
}
