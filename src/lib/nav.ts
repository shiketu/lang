export interface NavItem {
  id: string;
  label: string;
  href: string;
  /** lucide-react icon name (mapped to a component in Nav). */
  icon: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "ダッシュボード", href: "/", icon: "LayoutDashboard" },
  { id: "lakehouse", label: "言語データ", href: "/lakehouse", icon: "Database" },
  { id: "notes", label: "毎日ノート", href: "/notes", icon: "BookOpen" },
  { id: "practice", label: "表現練習", href: "/practice", icon: "Edit3" },
  { id: "video", label: "録画練習", href: "/video", icon: "Video" },
  { id: "todos", label: "学習計画", href: "/todos", icon: "ListTodo" },
];
