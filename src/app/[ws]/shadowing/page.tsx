import ShadowingStudio from "@/features/shadowing/components/ShadowingStudio";
import { getDictionary } from "@/i18n";
import type { Workspace } from "@/lib/workspace";

export default async function ShadowingPage({
  params,
}: {
  params: Promise<{ ws: string }>;
}) {
  const { ws } = await params;
  const dict = getDictionary(ws as Workspace);
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-2 text-slate-800 dark:text-slate-100">
        {dict.pages.shadowing.title}
      </h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">{dict.pages.shadowing.desc}</p>
      <ShadowingStudio />
    </div>
  );
}
