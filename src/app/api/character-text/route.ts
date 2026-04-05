import type { NextRequest } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get("lang") ?? "en";
  const subdir = lang === "en" ? "datalist_en" : "datalist";
  const filePath = path.join(
    process.cwd(),
    "jsons",
    subdir,
    "character",
    "character_text.json"
  );

  try {
    const raw = await readFile(filePath, "utf-8");
    return new Response(raw, {
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=3600" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
