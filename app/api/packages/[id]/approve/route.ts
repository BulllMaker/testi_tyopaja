import { env } from "cloudflare:workers";
import { getViewer, sameOrigin, unauthenticated } from "../../../../../lib/access";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return Response.json({ error: "Pyyntö estettiin." }, { status: 403 });
  const viewer = getViewer(request);
  if (!viewer) return unauthenticated();
  if (viewer.isAdmin) return Response.json({ error: "Hyväksynnän tekee asiakas." }, { status: 403 });
  const { id } = await params;
  try {
    const db = (env as unknown as { DB: D1Database }).DB;
    const result = await db.prepare("UPDATE approval_packages SET status = 'approved', approved_at = ?, approved_by = ? WHERE id = ? AND client_email = ? AND status = 'pending'")
      .bind(new Date().toISOString(), viewer.email, id, viewer.email).run();
    if (!result.meta.changes) return Response.json({ error: "Paketti ei ole hyväksyttävissä." }, { status: 409 });
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Package approval failed", error);
    return Response.json({ error: "Hyväksyntää ei voitu tallentaa. Yritä uudelleen." }, { status: 503 });
  }
}

