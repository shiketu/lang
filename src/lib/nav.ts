export interface NavItem {
  id: string;
  label: string;
  href: string;
  /** lucide-react icon name (mapped to a component in Nav). */
  icon: string;
}

// Order mirrors the daily flow: home → today's review → output → notes → library.
export const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "ホーム", href: "/", icon: "LayoutDashboard" },
  { id: "review", label: "今日の復習", href: "/review", icon: "BrainCircuit" },
  { id: "shadowing", label: "シャドーイング", href: "/shadowing", icon: "Mic" },
  { id: "video", label: "録画練習", href: "/video", icon: "Video" },
  { id: "notes", label: "毎日ノート", href: "/notes", icon: "BookOpen" },
  { id: "lakehouse", label: "言語データ", href: "/lakehouse", icon: "Database" },
  { id: "practice", label: "表現練習", href: "/practice", icon: "Edit3" },
  { id: "todos", label: "学習計画", href: "/todos", icon: "ListTodo" },
];
