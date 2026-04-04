"use client";
import { ColorModeProvider } from "./ColorModeContext";

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return <ColorModeProvider>{children}</ColorModeProvider>;
}
