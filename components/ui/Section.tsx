import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionTone = "base" | "tint" | "alt";
type SectionPadding = "default" | "condensed" | "extended";

const toneClassMap: Record<SectionTone, string> = {
  base: "bg-surface-base",
  tint: "bg-surface-tint",
  alt: "bg-surface-alt",
};

const paddingClassMap: Record<SectionPadding, string> = {
  default: "py-section",
  condensed: "py-section-sm",
  extended: "py-section-lg",
};

interface SectionProps {
  children: ReactNode;
  id?: string;
  className?: string;
  tone?: SectionTone;
  padding?: SectionPadding;
}

export function Section({
  children,
  id,
  className,
  tone = "base",
  padding = "default",
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn("relative w-full", toneClassMap[tone], paddingClassMap[padding], className)}
    >
      <div className="section-inner">
        {children}
      </div>
    </section>
  );
}
