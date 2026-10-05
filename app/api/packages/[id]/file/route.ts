import { env } from "cloudflare:workers";
import { getViewer, unauthenticated } from "../../../../../lib/access";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const viewer = getViewer(request);
  if (!viewer) return unauthenticated();
  const { id } = await params;
  const db = (env as unknown as { DB: D1Database }).DB;
  const row = await db.prepare("SELECT client_email, file_key, file_name FROM approval_packages WHERE id = ?").bind(id).first<{ client_email: string; file_key: string; file_name: string }>();
  if (!row || (!viewer.isAdmin && row.client_email !== viewer.email)) return new Response("Tiedostoa ei löytynyt.", { status: 404 });
  const object = await (env as unknown as { BUCKET: R2Bucket }).BUCKET.get(row.file_key);
  if (!object) return new Response("Tiedosto ei ole saatavilla.", { status: 503 });
  return new Response(object.body, { headers: {
    "Content-Type": "application/pdf",
    "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(row.file_name)}`,
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
  } });
}

