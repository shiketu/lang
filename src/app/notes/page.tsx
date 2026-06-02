import NoteEditor from "@/features/notes/components/NoteEditor";

export default function NotesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">毎日ノート</h1>
      <p className="text-gray-500 mb-6">
        毎日出会った表現や気づきを記録しましょう。
      </p>
      <NoteEditor />
    </div>
  );
}
