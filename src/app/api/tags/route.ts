import { getAllTags } from "@/features/entries/application/service";

export async function GET() {
  const tags = await getAllTags();
  return Response.json(tags);
}
