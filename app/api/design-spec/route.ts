import { NextResponse } from "next/server";

const SPEC = {
  colors: {
    brand: {
      primary: "#6366F1",
      accent: "#EC4899",
      secondary: "#38BDF8",
      warm: "#F97316",
    },
    surfaces: {
      base: "#050814",
      tint: "#0B1120",
      alt: "#111827",
      glass: "rgba(255, 255, 255, 0.04)",
      solid: "rgba(15, 23, 42, 0.78)",
    },
    borders: {
      glass: "rgba(255, 255, 255, 0.12)",
    },
    shadows: {
      glow: "0 30px 80px -40px rgba(56, 189, 248, 0.6)",
      glowStrong: "0 45px 120px -60px rgba(99, 102, 241, 0.7)",
      soft: "0 18px 48px -28px rgba(15, 23, 42, 0.55)",
    },
  },
  typography: {
    display: {
      family: "Plus Jakarta Sans",
      sizes: { lg: "64px", md: "48px", sm: "36px" },
      weight: 700,
      tracking: "-0.02em",
    },
    body: {
      family: "Noto Sans JP",
      size: "16px",
      lineHeight: 1.7,
      color: "#E2E8F0",
    },
  },
  spacing: {
    section: 96,
    sectionSm: 72,
    sectionLg: 120,
    cardPadding: 32,
    gutter: 24,
  },
  radii: {
    card: 24,
    button: 12,
  },
  hero: {
    layout: "text-left with device mock",
    background: "gradient + particles",
    callToAction: "glow button + subtle tertiary button",
  },
  blocks: [
    "hero",
    "benefits",
    "feature grid",
    "social proof",
    "cta",
    "pricing",
    "faq",
    "footer",
  ],
};

export async function GET() {
  return NextResponse.json(SPEC);
}
