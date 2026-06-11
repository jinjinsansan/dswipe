'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { DocumentTextIcon, FolderOpenIcon, FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { getLibraryTemplates, TEMPLATE_CATEGORIES } from '@/lib/templates';
import { HEAD_BG } from '@/lib/momentum';
import { resolveViewerPalette } from '@/components/viewer/theme';
import type { BlockType, TemplateBlock } from '@/types/templates';

interface TemplateSelectorProps {
  onSelectTemplate: (template: TemplateBlock) => void;
  onClose: () => void;
}

const iconClass = 'h-4 w-4';

const CATEGORY_META = TEMPLATE_CATEGORIES.reduce<Record<string, { name: string; icon: React.ReactNode }>>(
  (acc, category) => {
    const baseIcon = (
      <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
        <rect x="4" y="4" width="16" height="16" rx="3" />
        <path strokeLinecap="round" d="M8 8h8M8 12h5" />
      </svg>
    );

    const iconMap: Record<string, React.ReactNode> = {
      header: (
        <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="6" />
          <path strokeLinecap="round" d="M12 3v2m0 14v2m9-9h-2M5 12H3" />
        </svg>
      ),
      content: (
        <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <path strokeLinecap="round" d="M8 7h8M8 11h8M8 15h5" />
        </svg>
      ),
      conversion: (
        <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 18 10 12l4 4 6-6" />
          <path strokeLinecap="round" d="M4 6h16" />
        </svg>
      ),
      trust: (
        <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13.5 9.5 18l9-12" />
          <path strokeLinecap="round" d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10" />
        </svg>
      ),
      urgency: (
        <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
        </svg>
      ),
      handwritten: (
        <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4 17 5.5-2.5L9 9l6 2 5-4" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 20h16" />
        </svg>
      ),
    };

    acc[category.id] = {
      name: category.name,
      icon: iconMap[category.id] ?? baseIcon,
    };
    return acc;
  },
  {}
);

type TemplateGroup = {
  templateId: BlockType;
  category: TemplateBlock['category'];
  variants: TemplateBlock[];
  displayName: string;
  summary: string;
};

const deriveDisplayName = (template: TemplateBlock) => {
  const match = template.name.match(/^(.*?)（/);
  if (match?.[1]) {
    return match[1].trim();
  }
  const parts = template.name.split(/[-–:：]/);
  if (parts[0]) {
    return parts[0].trim();
  }
  return template.name;
};

export default function TemplateSelector({ onSelectTemplate, onClose }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<TemplateBlock[]>([]);

  useEffect(() => {
    let mounted = true;
    getLibraryTemplates().then((data) => {
      if (!mounted) {
        return;
      }
      setTemplates(data);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const templateGroups = useMemo<TemplateGroup[]>(() => {
    const groups = new Map<BlockType, TemplateGroup>();

    templates.forEach((template) => {
      const existing = groups.get(template.templateId as BlockType);
      if (!existing) {
        groups.set(template.templateId as BlockType, {
          templateId: template.templateId as BlockType,
          category: template.category,
          variants: [template],
          displayName: deriveDisplayName(template),
          summary: template.description,
        });
      } else {
        existing.variants.push(template);
      }
    });

    return Array.from(groups.values()).map((group) => ({
      ...group,
      variants: group.variants.sort((a, b) => a.name.localeCompare(b.name, 'ja')),
      summary: group.summary || group.variants[0]?.description || '',
    }));
  }, [templates]);

  const [selectedCategory, setSelectedCategory] = useState<'all' | TemplateBlock['category']>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVariants, setActiveVariants] = useState<Partial<Record<BlockType, string>>>({});

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredGroups = useMemo(() => {
    return templateGroups
      .filter((group) => selectedCategory === 'all' || group.category === selectedCategory)
      .filter((group) => {
        if (!normalizedQuery) return true;
        const groupText = `${group.displayName} ${group.summary}`.toLowerCase();
        if (groupText.includes(normalizedQuery)) return true;
        return group.variants.some((variant) =>
          `${variant.name} ${variant.description}`.toLowerCase().includes(normalizedQuery)
        );
      })
      .sort((a, b) => {
        if (a.category === b.category) {
          return a.displayName.localeCompare(b.displayName, 'ja');
        }
        return a.category.localeCompare(b.category, 'ja');
      });
  }, [templateGroups, selectedCategory, normalizedQuery]);

  const handleVariantSelect = (templateId: BlockType, variantId: string) => {
    setActiveVariants((prev) => ({ ...prev, [templateId]: variantId }));
  };

  const handleAddTemplate = (group: TemplateGroup) => {
    const activeVariantId = activeVariants[group.templateId] ?? group.variants[0]?.id;
    const targetVariant = group.variants.find((variant) => variant.id === activeVariantId);
    if (targetVariant) {
      onSelectTemplate(targetVariant);
      onClose();
    }
  };

  const getPalette = (template: TemplateBlock) => {
    const defaultContent = template.defaultContent as { themeKey?: string; accentColor?: string; backgroundColor?: string };
    const palette = resolveViewerPalette(defaultContent?.themeKey, defaultContent?.accentColor);
    return {
      accent: palette.accent,
      accentSoft: palette.accentSoft ?? palette.accent,
      background: defaultContent?.backgroundColor ?? palette.background,
      text: '#FFFFFF',
    };
  };

  const categoryOptions = useMemo(
    () => [
      { id: 'all', name: 'すべて' },
      ...TEMPLATE_CATEGORIES,
    ],
    []
  );

  return (
    <div className="fixed inset-0 bg-[rgba(7,15,30,.7)] backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-6xl h-[90vh] sm:h-auto sm:max-h-[88vh] overflow-hidden rounded-3xl bg-white shadow-[0_40px_100px_-30px_rgba(0,0,0,.6)] flex flex-col">
        {/* Navy header — mock: D-Swipe Block Library.html .head */}
        <div className="relative flex-shrink-0" style={{ background: HEAD_BG }}>
          <div className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-5">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-300">Block Library</p>
              <h2 className="mt-1 text-lg sm:text-xl font-extrabold tracking-tight text-pure-white truncate">ブロックを選んで、自由に組む。</h2>
              <p className="text-xs text-[#bcd3ee] mt-1 hidden sm:block">種類×レイアウト変種で、どんな目的のスワイプLPも。タップで追加してエディタへ。</p>
            </div>
            <button
              onClick={onClose}
              className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-white/25 bg-white/10 text-pure-white hover:bg-white/15 transition flex-shrink-0 ml-2"
              aria-label="閉じる"
            >
              ×
            </button>
          </div>

          {/* Search bar */}
          <div className="px-4 sm:px-6 py-3">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-[#9fb4d0]" aria-hidden="true" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="ブロックを検索 (キーワード/用途)"
                className="w-full rounded-xl border border-white/20 bg-white/10 pl-9 pr-3 py-2 text-sm text-pure-white placeholder:text-[#9fb4d0] focus:border-cyan-300/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                aria-label="ブロック検索"
              />
            </div>
          </div>
        </div>

        {/* Category filter chips — mock: .fchip */}
        <div className="flex-shrink-0 border-b border-[#e2ebf6] bg-[#f4f8fd] px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <FunnelIcon className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
            {categoryOptions.map((category) => {
              const isActive = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.id as typeof selectedCategory)}
                  className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                    isActive
                      ? 'border-[#bfe6fb] bg-[#e9f6fe] text-sky-600'
                      : 'border-[#e2ebf6] bg-white text-slate-600 hover:border-[#bfe6fb] hover:text-[#0b1f3a]'
                  }`}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="relative flex-1 overflow-y-auto min-h-0 bg-[#f4f8fd] px-3 sm:px-6 py-4 sm:py-5">

          {templates.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-center text-slate-600">
              <FolderOpenIcon className="h-12 w-12 text-slate-400" aria-hidden="true" />
              <p className="text-sm">利用可能なテンプレートがありません。管理者にお問い合わせください。</p>
            </div>
          ) : (
            <>
              {filteredGroups.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-[#bfe6fb] bg-white p-10 text-center text-sm text-slate-600">
                  条件に一致するブロックが見つかりませんでした。検索ワードやカテゴリを変更してみてください。
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  {filteredGroups.map((group) => {
                    const activeVariantId = activeVariants[group.templateId] ?? group.variants[0]?.id;
                    const activeVariant = group.variants.find((variant) => variant.id === activeVariantId) ?? group.variants[0];
                    const palette = activeVariant ? getPalette(activeVariant) : { accent: '#22D3EE', accentSoft: '#22D3EE', background: '#0B1F3A', text: '#FFFFFF' };
                    const categoryMeta = CATEGORY_META[group.category] ?? {
                      name: group.category,
                      icon: <DocumentTextIcon className={iconClass} aria-hidden="true" />,
                    };

                    return (
                      <div
                        key={group.templateId}
                        className="group relative overflow-hidden rounded-2xl border border-[#e2ebf6] bg-white shadow-sm transition hover:-translate-y-[2px] hover:border-[#bfe6fb] hover:shadow-[0_22px_44px_-24px_rgba(2,132,199,.34)]"
                      >
                        {/* Color preview — mock: .btile .pp */}
                        <div
                          className="relative flex h-24 items-end px-4 pb-3"
                          style={{ background: palette.background }}
                        >
                          <span
                            className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full"
                            style={{ background: palette.accent }}
                            aria-hidden="true"
                          />
                          <span className="text-[13px] font-extrabold tracking-tight text-pure-white drop-shadow">
                            {group.displayName}
                          </span>
                        </div>

                        <div className="px-4 py-3 sm:px-5 sm:py-4">
                          <div className="relative flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#bfe6fb] bg-[#e9f6fe] text-sky-600">
                                {categoryMeta.icon}
                              </span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-[#0b1f3a]">{group.displayName}</span>
                                  <span className="rounded-full bg-[#e9f6fe] px-2.5 py-0.5 text-[11px] font-semibold text-sky-600">
                                    {categoryMeta.name}
                                  </span>
                                </div>
                                <p className="mt-0.5 text-[11px] text-slate-500">バリエーション {group.variants.length}種</p>
                              </div>
                            </div>
                          </div>

                          <div className="relative mt-3 grid gap-2">
                            <div className="flex flex-wrap gap-2">
                              {group.variants.map((variant) => {
                                const isActive = variant.id === activeVariant?.id;
                                return (
                                  <button
                                    key={variant.id}
                                    type="button"
                                    onClick={() => handleVariantSelect(group.templateId, variant.id)}
                                    className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                                      isActive
                                        ? 'border-sky-600 bg-sky-600 text-pure-white shadow-[0_10px_26px_-8px_rgba(6,182,212,.55)]'
                                        : 'border-[#e2ebf6] bg-white text-slate-600 hover:border-[#bfe6fb] hover:text-[#0b1f3a]'
                                    }`}
                                  >
                                    {variant.name.replace(group.displayName, '').replace(/[（）]/g, '').trim() || '基本'}
                                  </button>
                                );
                              })}
                            </div>

                            {activeVariant && (
                              <p className="text-[11px] leading-relaxed text-slate-500">
                                {activeVariant.description}
                              </p>
                            )}

                            {/* Add — mock: .btile .badd */}
                            <button
                              onClick={() => handleAddTemplate(group)}
                              className="mt-1 w-full rounded-[9px] border border-[#bfe6fb] bg-[#e9f6fe] py-1.5 text-xs font-bold text-sky-600 transition hover:bg-[#dbf0fd]"
                            >
                              このブロックを追加
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="relative border-t border-[#e2ebf6] bg-white px-3 sm:px-6 py-2 sm:py-3 text-center text-[10px] sm:text-xs text-slate-500 flex-shrink-0">
          <span className="font-bold text-[#0b1f3a]">ヒント:</span> <span className="hidden sm:inline">追加後はプロパティパネルで色やコンテンツを自由に編集できます。</span><span className="sm:hidden">追加後に編集できます</span>
        </div>
      </div>
    </div>
  );
}
