import type { NextRequest } from "next/server";

const ALLOWED_HOST = "wfjukebox.b-cdn.net";

// 1×1 transparent PNG — returned instead of propagating upstream 404s
const TRANSPARENT_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64"
);

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) return new Response("Missing url", { status: 400 });

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return new Response("Invalid url", { status: 400 });
  }

  if (parsed.hostname !== ALLOWED_HOST) {
    return new Response("Disallowed host", { status: 403 });
  }

  let res: Response;
  try {
    res = await fetch(url);
  } catch {
    return new Response(TRANSPARENT_PNG, {
      headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=60" },
    });
  }

  if (!res.ok) {
    // Return transparent placeholder so browsers don't log 404 errors
    return new Response(TRANSPARENT_PNG, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": `public, max-age=${res.status === 404 ? 3600 : 60}`,
      },
    });
  }

  const contentType = res.headers.get("content-type") ?? "image/png";
  const buffer = await res.arrayBuffer();

  return new Response(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
