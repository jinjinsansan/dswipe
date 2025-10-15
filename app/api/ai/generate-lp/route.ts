import { NextResponse } from "next/server";
import { COLOR_THEMES, getTemplateById } from "@/lib/templates";
import type { AIGenerationRequest, AIGenerationResponse } from "@/types/api";
import type { BlockType, GeneratedBlock } from "@/types/templates";

type ThemeKey = keyof typeof COLOR_THEMES;
type Palette = (typeof COLOR_THEMES)[ThemeKey];

const DEFAULT_SEQUENCE: BlockType[] = [
  "hero-aurora",
  "features-aurora",
  "sticky-cta-1",
];

const FALLBACK_THEME: ThemeKey = "urgent_red";

function cloneContent<T>(content: T): T {
  return structuredClone(content);
}

function inferOutline(blocks: GeneratedBlock[]): string[] {
  return blocks.map((block) => {
    const template = getTemplateById(block.blockType);
    return template?.name ?? block.blockType;
  });
}

function applyProductContext(
  blockType: BlockType,
  content: Record<string, unknown>,
  request: AIGenerationRequest,
) {
  const next: Record<string, unknown> = { ...content };
  const { product, audience } = request;

  if (blockType === "hero-aurora") {
    if (product?.name) {
      next["title"] = `${product.name}で、${audience?.desiredOutcome ?? "成果"}を最短で実現`;
    }
    if (product?.category) {
      next["tagline"] = product.category;
    }
    if (product?.description) {
      next["subtitle"] = product.description;
    }
    if (product?.keyBenefits?.length) {
      next["highlightText"] = product.keyBenefits[0];
    }
    if (!next["buttonText"]) {
      next["buttonText"] = "無料で体験する";
    }
  }

  if (blockType === "features-aurora" && product?.keyBenefits?.length) {
    const features = Array.isArray(next["features"]) ? (next["features"] as unknown[]) : [];
    next["features"] = features.map((feature, index) => ({
      ...(feature as Record<string, unknown>),
      description: product.keyBenefits?.[index] ?? (feature as Record<string, unknown>).description,
    }));
  }

  if (blockType === "sticky-cta-1") {
    if (product?.name) {
      next["buttonText"] = `${product.name}を今すぐ始める`;
    }
    if (audience?.desiredOutcome) {
      next["subText"] = `${audience.desiredOutcome}を今すぐ体験`;
    }
  }

  return next;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AIGenerationRequest;

    const themeKey = (body.theme && body.theme in COLOR_THEMES
      ? (body.theme as ThemeKey)
      : FALLBACK_THEME);
    const palette: Palette = COLOR_THEMES[themeKey];

    const sequence = DEFAULT_SEQUENCE;

    const blocks: GeneratedBlock[] = sequence
      .map((type) => {
        const template = getTemplateById(type);
        if (!template) {
          return null;
        }

        const baseContent = cloneContent(template.defaultContent) as Record<string, unknown>;
        const contentWithContext = applyProductContext(type, baseContent, body);

        const block: GeneratedBlock = {
          blockType: type,
          content: contentWithContext,
          theme: themeKey,
          reason: `${template.name}に基づく自動生成`,
        };

        return block;
      })
      .filter((block): block is GeneratedBlock => Boolean(block));

    const outline = body.outline?.length ? body.outline : inferOutline(blocks);

    const response: AIGenerationResponse = {
      theme: themeKey,
      palette: {
        primary: palette.primary,
        accent: palette.accent,
        secondary: palette.secondary ?? palette.accent,
        background: palette.background,
        surface: palette.background,
        text: palette.text,
      },
      outline,
      blocks: blocks.map((block) => ({
        blockType: block.blockType,
        content: block.content as Record<string, unknown>,
        reason: block.reason,
      })),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("AI generation error", error);
    return NextResponse.json(
      { detail: "Failed to generate landing page template" },
      { status: 400 },
    );
  }
}
