import { BrainCircuit, Mic, Video, PenTool, type LucideIcon } from "lucide-react";
import type { ActivityKind } from "./domain/Activity";

// Structural config only — titles/descriptions/times/themes live in the i18n
// dictionary (keyed by `id`), so the daily loop is localized per workspace.
export interface RoutineStep {
  id: string;
  icon: LucideIcon;
  href: string;
  accent: string; // tile bg + text
  btn: string; // active button color
  doneKinds: ActivityKind[]; // any of these done today marks the step complete
}

export const ROUTINE_STEPS: RoutineStep[] = [
  {
    id: "review",
    icon: BrainCircuit,
    href: "/review",
    accent: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
    btn: "bg-blue-600 hover:bg-blue-700",
    doneKinds: ["review"],
  },
  {
    id: "shadowing",
    icon: Mic,
    href: "/shadowing",
    accent: "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400",
    btn: "bg-violet-600 hover:bg-violet-700",
    doneKinds: ["shadowing"],
  },
  {
    id: "selftalk",
    icon: Video,
    href: "/video",
    accent: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400",
    btn: "bg-rose-600 hover:bg-rose-700",
    doneKinds: ["output"],
  },
  {
    id: "notes",
    icon: PenTool,
    href: "/notes",
    accent: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
    btn: "bg-emerald-600 hover:bg-emerald-700",
    doneKinds: ["note", "capture"],
  },
];
