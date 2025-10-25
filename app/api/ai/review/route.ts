import { NextResponse } from "next/server";
import type { AIReviewIssue, AIReviewRequest, AIReviewResponse } from "@/types/api";

function parseColor(color?: string) {
  if (!color) return null;

  if (color.startsWith("#")) {
    const hex = color.replace("#", "");
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return { r, g, b };
    }
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return { r, g, b };
    }
    if (hex.length === 8) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return { r, g, b };
    }
    return null;
  }

  const rgbMatch = color.match(/rgba?\(([^)]+)\)/i);
  if (rgbMatch) {
    const parts = rgbMatch[1].split(",").map((v) => parseFloat(v.trim()));
    if (parts.length >= 3) {
      return { r: parts[0], g: parts[1], b: parts[2] };
    }
  }

  return null;
}

function luminance(value: number) {
  const channel = value / 255;
  return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
}

function contrastRatio(colorA?: string, colorB?: string) {
  const a = parseColor(colorA);
  const b = parseColor(colorB);
  if (!a || !b) return null;

  const luminanceA = 0.2126 * luminance(a.r) + 0.7152 * luminance(a.g) + 0.0722 * luminance(a.b);
  const luminanceB = 0.2126 * luminance(b.r) + 0.7152 * luminance(b.g) + 0.0722 * luminance(b.b);
  const lighter = Math.max(luminanceA, luminanceB);
  const darker = Math.min(luminanceA, luminanceB);
  return (lighter + 0.05) / (darker + 0.05);
}

function extractPadding(padding?: string) {
  if (!padding) return null;
  const match = padding.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  return parseFloat(match[1]);
}

function getString(content: Record<string, unknown>, key: string) {
  const value = content[key];
  return typeof value === "string" ? value : undefined;
}

function evaluateBlock(block: { blockType: string; content: Record<string, unknown> }, index: number): AIReviewIssue[] {
  const issues: AIReviewIssue[] = [];
  const { blockType, content } = block;

  const contrast = contrastRatio(getString(content, "backgroundColor"), getString(content, "textColor"));
  if (contrast !== null && contrast < 4.5) {
    issues.push({
      severity: "warn",
      message: `コントラスト比が低く (${contrast.toFixed(2)}) 読みづらい可能性があります。背景色と文字色の差を広げてください。`,
      target: { blockIndex: index, field: "textColor" },
    });
  }

  const paddingValue = extractPadding(getString(content, "padding"));
  if (paddingValue !== null && paddingValue < 32) {
    issues.push({
      severity: "info",
      message: "セクションの上下余白が少ないため、視認性が損なわれる可能性があります。",
      target: { blockIndex: index, field: "padding" },
    });
  }

  const buttonText = getString(content, "buttonText");
  if ((blockType.includes("cta") || buttonText) && buttonText) {
    const length = buttonText.trim().length;
    if (length < 6 || length > 18) {
      issues.push({
        severity: "info",
        message: "CTAボタンのテキストは6〜18文字に収めるとクリック率が高まります。",
        target: { blockIndex: index, field: "buttonText" },
      });
    }
  }

  const subtitle = getString(content, "subtitle");
  if (blockType === "top-hero-1" && subtitle) {
    const sentenceCount = subtitle.split("。").filter(Boolean).length;
    if (sentenceCount > 2) {
      issues.push({
        severity: "info",
        message: "ヒーローセクションのサブコピーは2文以内にまとめると読みやすくなります。",
        target: { blockIndex: index, field: "subtitle" },
      });
    }
  }

  return issues;
}

const SEVERITY_WEIGHT: Record<AIReviewIssue["severity"], number> = {
  info: 4,
  warn: 12,
  error: 25,
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AIReviewRequest;

    if (!body?.blocks?.length) {
      return NextResponse.json({ detail: "blocks is required" }, { status: 400 });
    }

    const issues = body.blocks.flatMap((block, index) => evaluateBlock(block, index));
    const penalty = issues.reduce((total, issue) => total + (SEVERITY_WEIGHT[issue.severity] ?? 0), 0);
    const score = Math.max(40, Math.round(100 - penalty));

    const suggestions = Array.from(
      new Set(
        issues.map((issue) => issue.message),
      ),
    );

    const response: AIReviewResponse = {
      score,
      issues,
      suggestions,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("AI review error", error);
    return NextResponse.json(
      { detail: "Failed to review landing page" },
      { status: 400 },
    );
  }
}
