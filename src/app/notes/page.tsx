import NoteEditor from "@/features/notes/components/NoteEditor";

export default function NotesPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-2 text-slate-800 dark:text-slate-100">毎日ノート</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">
        毎日出会った表現や気づきを記録しましょう。
      </p>
      <NoteEditor />
    </div>
  );
}
