import type { Metadata } from "next";
import { Suspense } from "react";
import { headers } from "next/headers";
import FacemakerClient from "./facebuilder-client";

interface Props {
  searchParams: Promise<{
    face?: string;
    expr?: string;
    base?: string;
    parts?: string;
  }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { face, expr, base, parts } = await searchParams;
  if (!face) return { title: "WF Facemaker" };

  // Derive the absolute base URL from the incoming request host
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "https";
  const metadataBase = new URL(`${proto}://${host}`);

  const label = [face, expr, ...(parts?.split(",").filter(Boolean) ?? [])].join(" + ");
  const ogParams = new URLSearchParams({ face });
  if (expr) ogParams.set("expr", expr);
  if (base && base !== "0") ogParams.set("base", base);
  if (parts) ogParams.set("parts", parts);
  const ogUrl = `/api/og?${ogParams}`;

  return {
    metadataBase,
    title: `${face} — WF Facemaker`,
    description: `Face composition: ${label}`,
    openGraph: {
      title: `${face} — WF Facemaker`,
      description: `Face composition: ${label}`,
      images: [{ url: ogUrl, width: 570, height: 690 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${face} — WF Facemaker`,
      description: `Face composition: ${label}`,
      images: [ogUrl],
    },
  };
}

export default async function Page({ searchParams }: Props) {
  const { face, expr, base, parts } = await searchParams;
  return (
    <Suspense>
      <FacemakerClient
        initialFace={face}
        initialExpr={expr}
        initialBase={base === "1" ? "1" : "0"}
        initialParts={parts ? parts.split(",").filter(Boolean) : []}
      />
    </Suspense>
  );
}
