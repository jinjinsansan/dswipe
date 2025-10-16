import { ReactNode, CSSProperties } from "react";
import { cn } from "@/lib/utils";

type SectionTone = "base" | "tint" | "alt" | "none";
type SectionPadding = "default" | "condensed" | "extended";

const toneClassMap: Record<SectionTone, string> = {
  base: "bg-surface-base",
  tint: "bg-surface-tint",
  alt: "bg-surface-alt",
  none: "",
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
  style?: CSSProperties;
}

export function Section({
  children,
  id,
  className,
  tone = "base",
  padding = "default",
  style,
}: SectionProps) {
  // tone が "none" の場合は style を適用、そうでない場合は tone クラスを使用
  const shouldUseStyle = tone === "none" && style;
  
  return (
    <section
      id={id}
      className={cn("relative w-full", !shouldUseStyle && toneClassMap[tone], paddingClassMap[padding], className)}
      style={shouldUseStyle ? style : undefined}
    >
      <div className="section-inner">
        {children}
      </div>
    </section>
  );
}
