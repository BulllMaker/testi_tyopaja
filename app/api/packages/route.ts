import { env } from "cloudflare:workers";
import { getViewer, sameOrigin, unauthenticated } from "../../../lib/access";

type PackageRow = {
  id: string; title: string; month: string; client_email: string; video_count: number;
  file_name: string; status: string; created_at: string; approved_at: string | null; approved_by: string | null;
};

const database = () => (env as unknown as { DB: D1Database }).DB;
const bucket = () => (env as unknown as { BUCKET: R2Bucket }).BUCKET;

export async function GET(request: Request) {
  const viewer = getViewer(request);
  if (!viewer) return unauthenticated();
  try {
    const query = viewer.isAdmin
      ? database().prepare("SELECT id, title, month, client_email, video_count, file_name, status, created_at, approved_at, approved_by FROM approval_packages ORDER BY created_at DESC")
      : database().prepare("SELECT id, title, month, client_email, video_count, file_name, status, created_at, approved_at, approved_by FROM approval_packages WHERE client_email = ? ORDER BY created_at DESC").bind(viewer.email);
    const { results } = await query.all<PackageRow>();
    return Response.json({ packages: results, viewer: { email: viewer.email, isAdmin: viewer.isAdmin } });
  } catch (error) {
    console.error("Package list failed", error);
    return Response.json({ error: "Paketteja ei voitu ladata. Yritä hetken kuluttua uudelleen." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Pyyntö estettiin." }, { status: 403 });
  const viewer = getViewer(request);
  if (!viewer) return unauthenticated();
  if (!viewer.isAdmin) return Response.json({ error: "Vain YhetPuheet voi lähettää paketteja." }, { status: 403 });
  try {
    const form = await request.formData();
    const title = String(form.get("title") || "").trim();
    const month = String(form.get("month") || "").trim();
    const clientEmail = String(form.get("clientEmail") || "").trim().toLowerCase();
    const count = Number(form.get("videoCount"));
    const file = form.get("file");
    if (!title || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail) || !Number.isInteger(count) || count < 1 || count > 100 || !(file instanceof File)) {
      return Response.json({ error: "Täytä nimi, kuukausi, asiakkaan sähköposti ja videomäärä sekä valitse PDF." }, { status: 400 });
    }
    if (file.type !== "application/pdf" || !file.name.toLowerCase().endsWith(".pdf") || file.size < 1 || file.size > 20 * 1024 * 1024) {
      return Response.json({ error: "Valitse enintään 20 Mt:n PDF-tiedosto." }, { status: 400 });
    }
    const id = crypto.randomUUID();
    const key = `packages/${id}.pdf`;
    await bucket().put(key, await file.arrayBuffer(), { httpMetadata: { contentType: "application/pdf" } });
    const now = new Date().toISOString();
    try {
      await database().prepare("INSERT INTO approval_packages (id, title, month, client_email, video_count, file_name, file_key, file_type, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .bind(id, title, month, clientEmail, count, file.name, key, "application/pdf", "pending", now).run();
    } catch (error) {
      await bucket().delete(key);
      throw error;
    }
    return Response.json({ id }, { status: 201 });
  } catch (error) {
    console.error("Package create failed", error);
    return Response.json({ error: "Paketin lähetys epäonnistui. Yritä uudelleen." }, { status: 503 });
  }
}

