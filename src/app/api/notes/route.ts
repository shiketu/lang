import { listNotes } from "@/features/notes/application/service";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const notes = await listNotes();
  return Response.json(notes);
}
