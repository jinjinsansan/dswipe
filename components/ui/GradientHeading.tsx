import { ElementType, ReactNode, ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

type GradientTone = "primary" | "magenta" | "aqua" | "gold" | "emerald" | "crimson";

const toneClassMap: Record<GradientTone, string> = {
  primary: "bg-gradient-primary",
  magenta: "bg-gradient-magenta",
  aqua: "bg-gradient-aqua",
  gold: "bg-gradient-gold",
  emerald: "bg-gradient-emerald",
  crimson: "bg-gradient-crimson",
};

type GradientHeadingProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  className?: string;
  tone?: GradientTone;
} & ComponentPropsWithoutRef<T>;

export function GradientHeading<T extends ElementType = "h2">({
  as,
  children,
  className,
  tone = "primary",
  ...props
}: GradientHeadingProps<T>) {
  const Tag = (as ?? "h2") as ElementType;

  return (
    <Tag
      className={cn(
        "font-display text-3xl font-semibold tracking-tight text-transparent bg-clip-text md:text-4xl",
        toneClassMap[tone],
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
