import { getAllTags } from "@/features/entries/application/service";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const tags = await getAllTags();
  return Response.json(tags);
}
