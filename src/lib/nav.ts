export interface NavItem {
  id: string;
  label: string;
  href: string;
  /** lucide-react icon name (mapped to a component in Nav). */
  icon: string;
}

// Order mirrors the daily flow: home → today's review → study a video →
// produce expressions → the library everything accumulates into.
export const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "ホーム", href: "/", icon: "LayoutDashboard" },
  { id: "review", label: "今日の復習", href: "/review", icon: "BrainCircuit" },
  { id: "study", label: "動画勉強", href: "/study", icon: "Film" },
  { id: "practice", label: "表現練習", href: "/practice", icon: "Edit3" },
  { id: "lakehouse", label: "言語データ", href: "/lakehouse", icon: "Database" },
];
