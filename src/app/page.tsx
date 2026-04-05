import type { Metadata } from "next";
import { Suspense } from "react";
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
  const { face, expr, parts } = await searchParams;
  if (!face) return { title: "WF Facemaker" };

  const label = [face, expr, ...(parts?.split(",").filter(Boolean) ?? [])].join(" + ");
  const ogUrl = `/api/og?${new URLSearchParams({
    face,
    ...(expr ? { expr } : {}),
    ...(parts ? { parts } : {}),
  })}`;

  return {
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
