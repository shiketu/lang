import { listNotes } from "@/features/notes/application/service";

export async function GET() {
  const notes = await listNotes();
  return Response.json(notes);
}
