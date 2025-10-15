import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SurfaceVariant = "glass" | "solid" | "subtle";

const variantClassMap: Record<SurfaceVariant, string> = {
  glass: "bg-surface-glass border border-glass",
  solid: "bg-surface-solid border border-glass-soft",
  subtle: "bg-surface-alt-soft border border-glass-faint",
};

interface SurfaceCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SurfaceVariant;
  glow?: boolean;
}

export function SurfaceCard({
  className,
  variant = "glass",
  glow = false,
  ...props
}: SurfaceCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-card shadow-soft transition-all duration-500",
        variantClassMap[variant],
        glow && "shadow-glow",
        className,
      )}
      {...props}
    />
  );
}
