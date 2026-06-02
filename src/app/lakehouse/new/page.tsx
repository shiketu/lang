import EntryForm from "@/features/entries/components/EntryForm";

export default function NewEntryPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">新規エントリー追加</h1>
      <EntryForm />
    </div>
  );
}
