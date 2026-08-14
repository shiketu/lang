import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ImportPanel from "@/features/entries/components/ImportPanel";
import { getDictionary } from "@/i18n";
import type { Workspace } from "@/lib/workspace";

export default async function ImportPage({
  params,
}: {
  params: Promise<{ ws: string }>;
}) {
  const { ws } = await params;
  const dict = getDictionary(ws as Workspace);
  return (
    <div className="max-w-5xl mx-auto">
      <Link
        href={`/${ws}/lakehouse`}
        className="btn-ghost mb-4 -ml-2 inline-flex"
      >
        <ArrowLeft className="w-4 h-4" />
        {dict.imports.backToLibrary}
      </Link>
      <h1 className="text-2xl font-bold mb-2 text-slate-800 dark:text-slate-100">
        {dict.pages.import.title}
      </h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">{dict.pages.import.desc}</p>
      <ImportPanel />
    </div>
  );
}
