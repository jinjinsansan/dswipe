"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { XMarkIcon, Squares2X2Icon } from "@heroicons/react/24/outline";
import type { DashboardNavGroup, DashboardNavLink } from "./navLinks";
import { getDashboardNavClasses, getDashboardNavGroupMeta, isDashboardLinkActive } from "./navLinks";

interface DashboardMobileNavProps {
  navGroups: DashboardNavGroup[];
  pathname: string;
}

interface LinkRenderOptions {
  link: DashboardNavLink;
  active: boolean;
  variant: "mobile" | "grid";
  onSelect?: () => void;
}

export default function DashboardMobileNav({ navGroups, pathname }: DashboardMobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const featuredLinks = useMemo(() => {
    return navGroups
      .map((group) => group.items[0])
      .filter((link): link is DashboardNavLink => Boolean(link));
  }, [navGroups]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let isDragging = false;
    let hasDirection = false;
    let startX = 0;
    let startY = 0;
    let startScrollLeft = 0;

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      isDragging = false;
      hasDirection = false;
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
      startScrollLeft = container.scrollLeft;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      const touch = event.touches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;

      if (!hasDirection) {
        if (Math.abs(deltaX) < 6 && Math.abs(deltaY) < 6) {
          return;
        }

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          isDragging = true;
        }
        hasDirection = true;
      }

      if (!isDragging) {
        return;
      }

      event.preventDefault();
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (maxScroll <= 0) {
        return;
      }

      const nextScroll = startScrollLeft - deltaX;
      container.scrollLeft = Math.min(Math.max(nextScroll, 0), maxScroll);
    };

    const handleTouchEnd = () => {
      isDragging = false;
      hasDirection = false;
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: false });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });
    container.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [featuredLinks.length]);

  const renderLink = ({ link, active, variant, onSelect }: LinkRenderOptions) => {
    const classes = getDashboardNavClasses(link, { variant: "mobile", active });
    const linkProps = link.external
      ? { href: link.href, target: "_blank" as const, rel: "noopener noreferrer" }
      : { href: link.href };

    const content = (
      <span className="flex min-w-0 items-center gap-2">
        <span className={`flex h-4 w-4 items-center justify-center ${classes.icon}`}>{link.icon}</span>
        <span className="truncate text-[11px] font-semibold">{link.label}</span>
      </span>
    );

    if (variant === "mobile") {
      return (
        <Link
          key={link.href}
          {...linkProps}
          onClick={() => {
            if (onSelect) onSelect();
          }}
          className={`inline-flex h-9 min-w-[6.5rem] items-center gap-2 whitespace-nowrap rounded-lg border border-slate-200/70 bg-white/70 px-3 ${
            classes.container
          }`}
        >
          {content}
          {link.badge ? (
            <span className={`text-[9px] font-semibold ${classes.badge}`}>{link.badge}</span>
          ) : null}
        </Link>
      );
    }

    const groupMeta = getDashboardNavGroupMeta(link.group);

    return (
      <Link
        key={link.href}
        {...linkProps}
        onClick={() => {
          if (onSelect) onSelect();
        }}
        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
          active ? `${classes.container}` : `${groupMeta.desktop.base} border-transparent`
        }`}
      >
        <span className={`flex h-4 w-4 items-center justify-center ${classes.icon}`}>{link.icon}</span>
        <span className="flex-1 truncate text-left text-[11px]">{link.label}</span>
        {link.badge ? (
          <span className={`rounded px-1.5 py-0.5 text-[9px] ${classes.badge}`}>{link.badge}</span>
        ) : null}
      </Link>
    );
  };

  return (
    <nav className="flex flex-col gap-2 px-3 py-2 overflow-x-hidden max-w-full">
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-2 overflow-x-auto pb-1 overscroll-x-none touch-pan-y max-w-full"
        style={{ 
          WebkitOverflowScrolling: 'touch',
          overscrollBehaviorX: 'contain',
          touchAction: 'pan-y'
        }}
      >
        {featuredLinks.map((link) =>
          renderLink({
            link,
            active: isDashboardLinkActive(pathname, link.href),
            variant: "mobile",
          })
        )}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
        >
          <Squares2X2Icon className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">すべてのメニューを表示</span>
        </button>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/40 backdrop-blur-sm">
          <div className="mt-auto w-full rounded-t-3xl bg-white shadow-xl">
            <div className="flex items-center justify-between px-4 pt-4 pb-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">すべてのメニュー</p>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-slate-200 p-1 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
              >
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="space-y-4 px-4 pb-6">
              {navGroups.map((group) => {
                const meta = getDashboardNavGroupMeta(group.key);
                return (
                  <div key={group.key} className="space-y-2">
                    <p className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${meta.headingClass}`}>
                      {meta.label}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {group.items.map((link) =>
                        renderLink({
                          link,
                          variant: "grid",
                          active: isDashboardLinkActive(pathname, link.href),
                          onSelect: () => setIsOpen(false),
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
