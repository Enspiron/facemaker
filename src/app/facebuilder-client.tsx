"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Download, Search, RotateCcw, Users, Smile,
  SlidersHorizontal, Link2, Check, Copy,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────

type FaceUiData = { ui: { files: string[] }; story: { files: string[] } };
type TrimEntry = [string, string, string, string];
type CharFilter = "all" | "npc" | "playable";

// ─── Constants ─────────────────────────────────────────────────────────────

const CDN = "https://wfjukebox.b-cdn.net/wfjukebox/character/character_art";
const FALLBACK = "https://raw.githubusercontent.com/Enspiron/wf-utilities/main/public/data";
const OTHER_PART_STEMS = new Set(["shame", "sweat", "unknown"]);
const OTHER_PART_PREFIXES = ["hibi_", "guardian"];

// ─── Helpers ───────────────────────────────────────────────────────────────

const imgProxy = (u: string) => `/api/assets/image?url=${encodeURIComponent(u)}`;
const thumbnailUrl = (face: string) => imgProxy(`${CDN}/${face}/ui/battle_member_status_0.png`);
const storyUrl = (face: string, stem: string) => imgProxy(`${CDN}/${face}/ui/story/${stem}.png`);

function isOtherPart(face: string, stem: string) {
  if (OTHER_PART_STEMS.has(stem)) return true;
  if (OTHER_PART_PREFIXES.some((p) => stem.startsWith(p))) return true;
  if (face === "zegura" && stem === "cheek") return true;
  return false;
}
const isBase = (s: string) => /^base/.test(s);

function classifyStems(face: string, storyFiles: string[]) {
  const stems = storyFiles.map((f) => f.replace(/\.png$/, ""));
  return {
    baseFiles: stems.filter(isBase),
    expressionFiles: stems.filter((s) => !isBase(s) && !isOtherPart(face, s)),
    otherPartFiles: stems.filter((s) => isOtherPart(face, s)),
  };
}

function resolveBase(baseFiles: string[], variant: "0" | "1"): string | null {
  if (!baseFiles.length) return null;
  const find = (n: string) => (baseFiles.includes(n) ? n : null);
  const resolved =
    variant === "0"
      ? find("base_0") ?? find("base") ?? find("base_0_right")
      : find("base_1") ?? find("base_b") ?? find("base_1_right") ?? find("base_b_right") ?? find("base");
  if (resolved) return resolved;
  return baseFiles.find((f) => !f.includes("_right")) ?? baseFiles[0];
}

async function loadJson<T>(local: string, fallback: string): Promise<T> {
  try { const r = await fetch(local); if (r.ok) return r.json(); } catch {}
  return fetch(fallback).then((r) => r.json());
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// ─── CharacterList ─────────────────────────────────────────────────────────

function CharacterList({
  faces, faceUi, nameMap, search, setSearch,
  filter, setFilter, selectedFace, onSelect,
}: {
  faces: string[]; faceUi: Record<string, FaceUiData>; nameMap: Record<string, string>;
  search: string; setSearch: (v: string) => void;
  filter: CharFilter; setFilter: (v: CharFilter) => void;
  selectedFace: string | null; onSelect: (face: string) => void;
}) {
  const filtered = faces.filter((face) => {
    const isPlayable = faceUi[face]?.ui.files.includes("battle_member_status_0.png");
    if (filter === "playable" && !isPlayable) return false;
    if (filter === "npc" && isPlayable) return false;
    if (search) {
      const name = nameMap[face]?.toLowerCase() ?? "";
      return name.includes(search.toLowerCase()) || face.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b space-y-2 shrink-0">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input className="pl-7 h-8 text-sm" placeholder="Search…" value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex rounded-md border overflow-hidden text-xs">
          {(["all", "npc", "playable"] as CharFilter[]).map((opt) => (
            <button key={opt} onClick={() => setFilter(opt)}
              className={`flex-1 py-1 capitalize transition-colors ${
                filter === opt ? "bg-primary text-primary-foreground font-medium" : "hover:bg-accent"
              }`}>{opt}</button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.map((face) => {
          const isPlayable = faceUi[face]?.ui.files.includes("battle_member_status_0.png");
          const name = nameMap[face] ?? face;
          return (
            <button key={face} onClick={() => onSelect(face)}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-accent transition-colors ${selectedFace === face ? "bg-accent" : ""}`}>
              {isPlayable ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumbnailUrl(face)} alt=""
                  className="w-8 h-8 rounded object-cover shrink-0 bg-muted"
                  onError={(e) => ((e.target as HTMLImageElement).style.visibility = "hidden")} />
              ) : (
                <div className="w-8 h-8 rounded bg-muted shrink-0 flex items-center justify-center">
                  <Smile className="h-4 w-4 text-muted-foreground/40" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium truncate">{name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{face}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── ExpressionControls ────────────────────────────────────────────────────

function GridItem({ active, onClick, src, label }: { active: boolean; onClick: () => void; src: string; label: string }) {
  return (
    <button onClick={onClick}
      className={`relative rounded border overflow-hidden aspect-square transition-all ${
        active ? "border-primary ring-1 ring-primary" : "border-border hover:border-primary/50"
      }`} title={label}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={label} className="w-full h-full object-cover"
        onError={(e) => ((e.target as HTMLImageElement).style.opacity = "0.2")} />
      <span className="absolute bottom-0 left-0 right-0 text-[8px] text-center bg-black/50 text-white px-0.5 truncate">{label}</span>
    </button>
  );
}

function ListItem({ active, onClick, src, label }: { active: boolean; onClick: () => void; src: string; label: string }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg border transition-all text-left ${
        active ? "border-primary bg-accent ring-1 ring-primary" : "border-transparent hover:bg-accent"
      }`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={label} className="w-10 h-10 rounded object-cover shrink-0 bg-muted"
        onError={(e) => ((e.target as HTMLImageElement).style.opacity = "0.2")} />
      <span className="text-sm truncate">{label}</span>
    </button>
  );
}

function ExpressionControls({
  selectedFace, baseVariant, setBaseVariant, hasVariant1,
  expressionFiles, otherPartFiles, selectedExpr, setSelectedExpr,
  otherParts, setOtherParts, onReset, layout = "grid",
}: {
  selectedFace: string; baseVariant: "0" | "1"; setBaseVariant: (v: "0" | "1") => void;
  hasVariant1: boolean; expressionFiles: string[]; otherPartFiles: string[];
  selectedExpr: string | null; setSelectedExpr: (v: string | null) => void;
  otherParts: Set<string>; setOtherParts: (fn: (p: Set<string>) => Set<string>) => void;
  onReset: () => void; layout?: "grid" | "list";
}) {
  const isList = layout === "list";

  return (
    <div className="p-3 space-y-4">
      {hasVariant1 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Base</p>
          <div className="flex gap-1">
            {(["0", "1"] as const).map((v) => (
              <Button key={v} variant={baseVariant === v ? "default" : "outline"} size="sm"
                className="flex-1 h-7 text-xs" onClick={() => setBaseVariant(v)}>
                {v === "0" ? "Default" : "Alt"}
              </Button>
            ))}
          </div>
        </div>
      )}
      {expressionFiles.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Expression</p>
          {isList ? (
            <div className="flex flex-col gap-1">
              {expressionFiles.map((expr) => (
                <ListItem key={expr} active={selectedExpr === expr}
                  onClick={() => setSelectedExpr(selectedExpr === expr ? null : expr)}
                  src={storyUrl(selectedFace, expr)} label={expr} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {expressionFiles.map((expr) => (
                <GridItem key={expr} active={selectedExpr === expr}
                  onClick={() => setSelectedExpr(selectedExpr === expr ? null : expr)}
                  src={storyUrl(selectedFace, expr)} label={expr} />
              ))}
            </div>
          )}
        </div>
      )}
      {otherPartFiles.length > 0 && (
        <>
          <Separator />
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Add-ons</p>
            {isList ? (
              <div className="flex flex-col gap-1">
                {otherPartFiles.map((part) => {
                  const active = otherParts.has(part);
                  return (
                    <ListItem key={part} active={active}
                      onClick={() => setOtherParts((prev) => { const n = new Set(prev); active ? n.delete(part) : n.add(part); return n; })}
                      src={storyUrl(selectedFace, part)} label={part} />
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1">
                {otherPartFiles.map((part) => {
                  const active = otherParts.has(part);
                  return (
                    <GridItem key={part} active={active}
                      onClick={() => setOtherParts((prev) => { const n = new Set(prev); active ? n.delete(part) : n.add(part); return n; })}
                      src={storyUrl(selectedFace, part)} label={part} />
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
      <Separator />
      <Button variant="outline" size="sm" className="w-full h-7 text-xs gap-1" onClick={onReset}>
        <RotateCcw className="h-3 w-3" /> Reset
      </Button>
    </div>
  );
}

// ─── Main client component ─────────────────────────────────────────────────

export default function FacemakerClient({
  initialFace, initialExpr, initialBase, initialParts,
}: {
  initialFace?: string;
  initialExpr?: string;
  initialBase?: "0" | "1";
  initialParts?: string[];
}) {
  const [faces, setFaces] = useState<string[]>([]);
  const [faceUi, setFaceUi] = useState<Record<string, FaceUiData>>({});
  const [nameMap, setNameMap] = useState<Record<string, string>>({});
  const [trimData, setTrimData] = useState<Record<string, TrimEntry>>({});
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<CharFilter>("all");
  const [selectedFace, setSelectedFace] = useState<string | null>(initialFace ?? null);
  const [baseVariant, setBaseVariant] = useState<"0" | "1">(initialBase ?? "0");
  const [selectedExpr, setSelectedExpr] = useState<string | null>(initialExpr ?? null);
  const [otherParts, setOtherParts] = useState<Set<string>>(new Set(initialParts ?? []));

  const [charSheetOpen, setCharSheetOpen] = useState(false);
  const [exprSheetOpen, setExprSheetOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedImg, setCopiedImg] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rendering, setRendering] = useState(false);
  const isInitialMount = useRef(true);

  // ── Load data ──────────────────────────────────────────────────────────

  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const safeCharText = fetch("/api/character-text?lang=en")
          .then((r) => r.json())
          .catch(() => ({})) as Promise<Record<string, string[]>>;

        const [facesData, faceUiData, charData, charTextData, trimRaw] = await Promise.all([
          loadJson<{ faces: string[] }>("/data/faces.json", `${FALLBACK}/faces.json`),
          loadJson<Record<string, FaceUiData>>("/data/face-ui.json", `${FALLBACK}/face-ui.json`),
          loadJson<Record<string, string[]>>("/data/character.json", `${FALLBACK}/character.json`),
          safeCharText,
          loadJson<Record<string, TrimEntry>>(
            "/data/datalist/generated/trimmed_image.json",
            `${FALLBACK}/datalist/generated/trimmed_image.json`
          ),
        ]);
        const names: Record<string, string> = {};
        for (const [id, vals] of Object.entries(charData)) {
          const name = charTextData[id]?.[0];
          if (vals[0] && name) names[vals[0]] = name;
        }
        setFaces(facesData.faces);
        setFaceUi(faceUiData);
        setNameMap(names);
        setTrimData(trimRaw);
        setLoading(false);
      } catch {
        setLoadError(true);
        setLoading(false);
      }
    }
    init();
  }, []);

  // ── Sync URL to current state ────────────────────────────────────────────

  useEffect(() => {
    if (!selectedFace) { window.history.replaceState(null, "", "/"); return; }
    const p = new URLSearchParams();
    p.set("face", selectedFace);
    if (selectedExpr) p.set("expr", selectedExpr);
    if (baseVariant !== "0") p.set("base", baseVariant);
    if (otherParts.size > 0) p.set("parts", Array.from(otherParts).join(","));
    window.history.replaceState(null, "", `/?${p}`);
  }, [selectedFace, selectedExpr, baseVariant, otherParts]);

  // ── Derived ──────────────────────────────────────────────────────────────

  const faceData = selectedFace ? faceUi[selectedFace] : null;
  const { baseFiles, expressionFiles, otherPartFiles } = faceData
    ? classifyStems(selectedFace!, faceData.story.files)
    : { baseFiles: [], expressionFiles: [], otherPartFiles: [] };

  const hasVariant1 = baseFiles.some((f) => f === "base_1" || f === "base_b");
  const resolvedBase = selectedFace ? resolveBase(baseFiles, baseVariant) : null;

  // ── Canvas render ────────────────────────────────────────────────────────

  const renderCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedFace || !resolvedBase) return;
    setRendering(true);
    const layers = [resolvedBase, ...(selectedExpr ? [selectedExpr] : []), ...Array.from(otherParts)];
    let cW = 512, cH = 512;
    for (const stem of layers) {
      const trim = trimData[`character/${selectedFace}/ui/story/${stem}`];
      if (trim) { cW = parseInt(trim[2]); cH = parseInt(trim[3]); break; }
    }
    canvas.width = cW; canvas.height = cH;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, cW, cH);
    for (const stem of layers) {
      const trim = trimData[`character/${selectedFace}/ui/story/${stem}`];
      const x = trim ? parseInt(trim[0]) : 0;
      const y = trim ? parseInt(trim[1]) : 0;
      try { ctx.drawImage(await loadImage(storyUrl(selectedFace, stem)), x, y); } catch { /* skip */ }
    }
    setRendering(false);
  }, [selectedFace, resolvedBase, selectedExpr, otherParts, trimData]);

  useEffect(() => { renderCanvas(); }, [renderCanvas]);

  // Reset expressions when face changes (skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) { isInitialMount.current = false; return; }
    setSelectedExpr(null);
    setOtherParts(new Set());
    setBaseVariant("0");
  }, [selectedFace]);

  // ── Actions ──────────────────────────────────────────────────────────────

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `${selectedFace ?? "face"}_compose.png`;
    a.click();
  }

  async function handleCopyImage() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        setCopiedImg(true);
        setTimeout(() => setCopiedImg(false), 2000);
      } catch { /* clipboard not supported */ }
    });
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSelectFace(face: string) { setSelectedFace(face); setCharSheetOpen(false); }

  const displayName = selectedFace ? (nameMap[selectedFace] ?? selectedFace) : null;

  // ── Loading ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen flex-col gap-4">
        <p className="text-muted-foreground text-sm">Loading data…</p>
        <Progress value={0} className="w-48" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-screen flex-col gap-4 p-6 text-center">
        <p className="font-semibold">Failed to load data</p>
        <p className="text-muted-foreground text-sm">Check your connection and try again.</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  const charListProps = { faces, faceUi, nameMap, search, setSearch, filter, setFilter, selectedFace, onSelect: handleSelectFace };
  const exprControlProps = selectedFace
    ? { selectedFace, baseVariant, setBaseVariant, hasVariant1, expressionFiles, otherPartFiles, selectedExpr, setSelectedExpr, otherParts, setOtherParts, onReset: () => { setSelectedExpr(null); setOtherParts(new Set()); setBaseVariant("0"); } }
    : null;

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex h-dvh overflow-hidden bg-background">

      {/* Desktop: character list sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r shrink-0">
        <div className="p-3 border-b flex items-center gap-2 shrink-0">
          <span className="font-semibold text-sm">Face Maker</span>
        </div>
        <CharacterList {...charListProps} />
      </aside>

      {/* Desktop: expression controls sidebar */}
      <div className="hidden md:flex w-56 flex-col border-r shrink-0 overflow-y-auto">
        {!selectedFace
          ? <div className="flex items-center justify-center h-full text-sm text-muted-foreground p-4 text-center">Select a character to get started</div>
          : exprControlProps && <ExpressionControls {...exprControlProps} />}
      </div>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Mobile top bar */}
        <header className="flex md:hidden items-center gap-2 px-3 py-2 border-b shrink-0">
          <div className="flex-1 min-w-0">
            {displayName
              ? <p className="text-sm font-semibold truncate">{displayName}</p>
              : <p className="text-sm text-muted-foreground">Face Maker</p>}
          </div>
          {selectedFace && exprControlProps && (
            <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={() => setExprSheetOpen(true)}>
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          )}
          <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={() => setCharSheetOpen(true)}>
            <Users className="h-4 w-4" />
          </Button>
        </header>

        {/* Canvas area */}
        <main className="flex-1 flex flex-col items-center justify-center bg-muted/30 gap-4 p-4 md:p-6 overflow-auto">
          {!selectedFace ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <p className="text-muted-foreground text-sm">
                <span className="hidden md:inline">← Select a character</span>
                <span className="md:hidden">Tap <strong>Characters</strong> to pick a face</span>
              </p>
              <Button variant="outline" size="sm" className="md:hidden gap-2" onClick={() => setCharSheetOpen(true)}>
                <Users className="h-4 w-4" /> Browse Characters
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2 self-start">
                <p className="font-semibold hidden md:block">{displayName}</p>
                <span className="text-xs text-muted-foreground hidden md:block">{selectedFace}</span>
                {resolvedBase && <Badge variant="outline" className="text-xs">{resolvedBase}</Badge>}
                {selectedExpr && <Badge variant="secondary" className="text-xs">{selectedExpr}</Badge>}
                {Array.from(otherParts).map((p) => <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>)}
              </div>

              <div className="relative rounded-lg border bg-background shadow-sm overflow-hidden w-full md:w-auto">
                {rendering && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60 z-10">
                    <span className="text-xs text-muted-foreground">Rendering…</span>
                  </div>
                )}
                <canvas ref={canvasRef} className="block max-w-full max-h-[55dvh] md:max-h-[70vh] mx-auto"
                  style={{ imageRendering: "pixelated" }} />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="md:hidden gap-1" onClick={() => setExprSheetOpen(true)}>
                  <SlidersHorizontal className="h-3.5 w-3.5" /> Expressions
                </Button>
                <Button variant="outline" onClick={handleShare} className="gap-2" disabled={rendering}>
                  {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
                  <span className="hidden sm:inline">{copied ? "Copied!" : "Share"}</span>
                </Button>
                <Button onClick={handleDownload} className="gap-2" disabled={rendering}>
                  <Download className="h-4 w-4" /> Download PNG
                </Button>
                <Button variant="outline" onClick={handleCopyImage} className="gap-2" disabled={rendering}>
                  {copiedImg ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span className="hidden sm:inline">{copiedImg ? "Copied!" : "Copy Image"}</span>
                </Button>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Mobile sheets */}
      <Sheet open={charSheetOpen} onOpenChange={setCharSheetOpen}>
        <SheetContent side="left" className="w-[80vw] max-w-xs p-0 flex flex-col">
          <SheetHeader className="px-4 pt-4 pb-2 shrink-0">
            <SheetTitle className="text-sm">Characters</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-hidden">
            <CharacterList {...charListProps} />
          </div>
        </SheetContent>
      </Sheet>

      {exprControlProps && (
        <Sheet open={exprSheetOpen} onOpenChange={setExprSheetOpen}>
          <SheetContent side="bottom" className="h-[70dvh] overflow-y-auto rounded-t-xl">
            <SheetHeader className="mb-2">
              <SheetTitle className="text-sm flex items-center gap-2">
                <Smile className="h-4 w-4" /> Expressions — {displayName}
              </SheetTitle>
            </SheetHeader>
            <ExpressionControls {...exprControlProps} layout="list" />
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
