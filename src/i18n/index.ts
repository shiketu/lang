import { ja } from "./dictionaries/ja";
import { en } from "./dictionaries/en";
import type { Workspace } from "@/lib/workspace";

export type Dictionary = typeof ja;

export function getDictionary(ws: Workspace): Dictionary {
  return ws === "en" ? en : ja;
}

/** Resolves `{name}` placeholders in a template string. */
export function fmt(tpl: string, vars: Record<string, string | number>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}
