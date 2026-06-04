import { BrainCircuit, Mic, Video, PenTool, type LucideIcon } from "lucide-react";
import type { ActivityKind } from "./domain/Activity";

export interface RoutineStep {
  id: string;
  title: string;
  desc: string;
  icon: LucideIcon;
  href: string;
  time: string;
  accent: string; // tile bg + text
  btn: string; // active button color
  doneKinds: ActivityKind[]; // any of these done today marks the step complete
}

// The daily loop. Order is the intended flow; the first incomplete step is "active".
export const ROUTINE_STEPS: RoutineStep[] = [
  {
    id: "review",
    title: "忘却曲線レビュー",
    desc: "記憶が薄れる前に、最適なタイミングで積み重ねを復習します。",
    icon: BrainCircuit,
    href: "/review",
    time: "約10分",
    accent: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
    btn: "bg-blue-600 hover:bg-blue-700",
    doneKinds: ["review"],
  },
  {
    id: "shadowing",
    title: "シャドーイング比較",
    desc: "お手本の区間を繰り返し練習し、自分の発話と並べて比べます。",
    icon: Mic,
    href: "/shadowing",
    time: "約15分",
    accent: "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400",
    btn: "bg-violet-600 hover:bg-violet-700",
    doneKinds: ["shadowing"],
  },
  {
    id: "selftalk",
    title: "独り言アウトプット",
    desc: "テーマに沿って話し続け、録画して自分の言葉を振り返ります。",
    icon: Video,
    href: "/video",
    time: "約5分",
    accent: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400",
    btn: "bg-rose-600 hover:bg-rose-700",
    doneKinds: ["output"],
  },
  {
    id: "notes",
    title: "今日の気づきを記録",
    desc: "新しく学んだ表現や、言えなかった悔しさを書き留めます。",
    icon: PenTool,
    href: "/notes",
    time: "約5分",
    accent: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
    btn: "bg-emerald-600 hover:bg-emerald-700",
    doneKinds: ["note", "capture"],
  },
];

// Deterministic daily rotation so the theme is stable for a given day.
const THEMES = [
  "最近の悩み",
  "週末の予定",
  "好きな食べ物",
  "今日のニュース",
  "将来の夢",
  "最近見た作品",
  "仕事・勉強の話",
  "趣味について",
];

export function dailyTheme(date: string): string {
  const n = Number(date.replace(/-/g, "")) || 0;
  return THEMES[n % THEMES.length];
}
