import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type GlowShape = "rounded" | "full";

interface GlowHighlightProps extends HTMLAttributes<HTMLDivElement> {
  shape?: GlowShape;
  intensity?: "soft" | "strong";
}

export function GlowHighlight({
  className,
  shape = "rounded",
  intensity = "soft",
  style,
  ...props
}: GlowHighlightProps) {
  const gradient = intensity === "strong"
    ? "radial-gradient(circle at 50% 0%, rgba(99,102,241,0.35), rgba(15,23,42,0) 65%)"
    : "radial-gradient(circle at 50% 0%, rgba(99,102,241,0.25), rgba(15,23,42,0) 55%)";

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0",
        shape === "full" ? "rounded-none" : "rounded-card",
        className,
      )}
      style={{ background: gradient, ...style }}
      {...props}
    />
  );
}
