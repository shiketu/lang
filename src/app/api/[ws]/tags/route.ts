import { getAllTags } from "@/features/entries/application/service";
import { requireAuth } from "@/lib/auth";
import { withWorkspaceRoute } from "@/lib/workspace";

export const GET = withWorkspaceRoute(async () => {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const tags = await getAllTags();
  return Response.json(tags);
});
