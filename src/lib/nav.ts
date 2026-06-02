export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "ダッシュボード", href: "/", icon: "📊" },
  { id: "lakehouse", label: "言語データ", href: "/lakehouse", icon: "📚" },
  { id: "notes", label: "毎日ノート", href: "/notes", icon: "📝" },
  { id: "practice", label: "表現練習", href: "/practice", icon: "✍️" },
  { id: "video", label: "録画練習", href: "/video", icon: "🎥" },
  { id: "todos", label: "学習計画", href: "/todos", icon: "✅" },
];
