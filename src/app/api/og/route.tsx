import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const CDN = "https://wfjukebox.b-cdn.net/wfjukebox/character/character_art";

type FaceUiData = { ui: { files: string[] }; story: { files: string[] } };

function resolveBase(
  storyFiles: string[],
  variant: string
): string | null {
  const stems = storyFiles.map((f) => f.replace(/\.png$/, "")).filter((s) => /^base/.test(s));
  if (!stems.length) return null;
  const find = (n: string) => (stems.includes(n) ? n : null);
  const resolved =
    variant === "1"
      ? find("base_1") ?? find("base_b") ?? find("base_1_right") ?? find("base_b_right") ?? find("base")
      : find("base_0") ?? find("base") ?? find("base_0_right");
  if (resolved) return resolved;
  return stems.find((f) => !f.includes("_right")) ?? stems[0];
}

/** Parse PNG width/height from the IHDR chunk */
function getPngSize(buf: ArrayBuffer): { w: number; h: number } {
  const dv = new DataView(buf);
  return { w: dv.getUint32(16), h: dv.getUint32(20) };
}

async function fetchSprite(
  face: string,
  stem: string
): Promise<{ dataUrl: string; w: number; h: number } | null> {
  try {
    const res = await fetch(`${CDN}/${face}/ui/story/${stem}.png`);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const { w, h } = getPngSize(buf);
    const b64 = Buffer.from(buf).toString("base64");
    return { dataUrl: `data:image/png;base64,${b64}`, w, h };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const face = searchParams.get("face") ?? "";
  const expr = searchParams.get("expr") ?? "";
  const base = searchParams.get("base") ?? "0";
  const parts = (searchParams.get("parts") ?? "").split(",").filter(Boolean);

  if (!face) {
    return new ImageResponse(
      <div style={{ display: "flex", width: 570, height: 690, alignItems: "center", justifyContent: "center", background: "#1a1a2e", color: "#fff", fontSize: 32 }}>
        WF Facemaker
      </div>,
      { width: 570, height: 690 }
    );
  }

  // Load face-ui to resolve base
  let faceUi: Record<string, FaceUiData> = {};
  let trimData: Record<string, string[]> = {};
  try {
    const [fuRaw, trRaw] = await Promise.all([
      readFile(path.join(process.cwd(), "jsons", "face-ui.json"), "utf-8"),
      readFile(path.join(process.cwd(), "jsons", "trimmed_image.json"), "utf-8"),
    ]);
    faceUi = JSON.parse(fuRaw);
    trimData = JSON.parse(trRaw);
  } catch { /* fall back to defaults */ }

  const storyFiles = faceUi[face]?.story.files ?? [];
  const resolvedBase = resolveBase(storyFiles, base);

  const layers = [resolvedBase, ...(expr ? [expr] : []), ...parts].filter(Boolean) as string[];

  // Determine canvas size from trim data
  let canvasW = 570, canvasH = 690;
  for (const stem of layers) {
    const trim = trimData[`character/${face}/ui/story/${stem}`];
    if (trim) { canvasW = parseInt(trim[2]); canvasH = parseInt(trim[3]); break; }
  }

  // Fetch all sprites in parallel
  const sprites = await Promise.all(
    layers.map(async (stem) => {
      const trim = trimData[`character/${face}/ui/story/${stem}`];
      const x = trim ? parseInt(trim[0]) : 0;
      const y = trim ? parseInt(trim[1]) : 0;
      const data = await fetchSprite(face, stem);
      return data ? { ...data, x, y } : null;
    })
  );

  const valid = sprites.filter(Boolean) as { dataUrl: string; w: number; h: number; x: number; y: number }[];

  return new ImageResponse(
    <div style={{ display: "flex", width: canvasW, height: canvasH, position: "relative", background: "transparent" }}>
      {valid.map((s, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={s.dataUrl}
          width={s.w}
          height={s.h}
          style={{ position: "absolute", left: s.x, top: s.y }}
        />
      ))}
    </div>,
    { width: canvasW, height: canvasH }
  );
}
