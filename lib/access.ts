import { env } from "cloudflare:workers";

export function getViewer(request: Request) {
  const email = request.headers.get("oai-authenticated-user-email")?.trim().toLowerCase() || "";
  const id = request.headers.get("oai-authenticated-user-id") || "";
  if (!email || !id) return null;
  const adminEmail = (env as unknown as { ADMIN_EMAIL?: string }).ADMIN_EMAIL?.trim().toLowerCase();
  return { email, id, isAdmin: Boolean(adminEmail && email === adminEmail) };
}

export function unauthenticated() {
  return Response.json({ error: "Kirjaudu sisään nähdäksesi työtilan." }, { status: 401 });
}

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

