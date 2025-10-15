import Link from "next/link";
import {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type GlowButtonVariant = "primary" | "secondary";

const variantClassMap: Record<GlowButtonVariant, string> = {
  primary:
    "bg-gradient-primary text-white shadow-glow hover:shadow-glow-strong",
  secondary:
    "bg-surface-glass border border-glass text-white/90 hover:text-white",
};

interface BaseProps {
  children: ReactNode;
  className?: string;
  variant?: GlowButtonVariant;
}

type ButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type AnchorProps = BaseProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

type GlowButtonProps = ButtonProps | AnchorProps;

export function GlowButton(props: GlowButtonProps) {
  const { children, className, variant = "primary" } = props;

  const baseClass = cn(
    "inline-flex items-center justify-center gap-2 rounded-button px-6 py-3 font-medium transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1120] focus-visible:ring-[rgba(99,102,241,0.6)]",
    variantClassMap[variant],
    className,
  );

  if ("href" in props && props.href) {
    const { href, ...anchorProps } = props;
    return (
      <Link href={href} className={baseClass} {...anchorProps}>
        {children}
      </Link>
    );
  }

  const { href: _unused, ...buttonProps } = props as ButtonProps;

  return (
    <button className={baseClass} {...buttonProps}>
      {children}
    </button>
  );
}
