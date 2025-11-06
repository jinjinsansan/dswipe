'use client';

import React, { useMemo, useState } from 'react';
import { DocumentTextIcon, FolderOpenIcon, FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { getAllTemplates, TEMPLATE_CATEGORIES } from '@/lib/templates';
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
  const templates = useMemo(() => getAllTemplates(), []);

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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-6xl h-[90vh] sm:h-auto sm:max-h-[88vh] overflow-hidden rounded-2xl border border-white/10 bg-[#070b16]/95 shadow-[0_36px_120px_-60px_rgba(56,189,248,0.6)] flex flex-col">
        <div className="pointer-events-none absolute -top-24 -left-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -right-16 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />

        {/* Header with integrated search and filters */}
        <div className="relative flex-shrink-0 bg-sky-50 border-b border-sky-200">
          {/* Title bar */}
          <div className="flex items-center justify-between px-3 sm:px-5 sm:px-6 py-3 sm:py-4">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.32em] text-slate-600 mb-1">Template Library</p>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900 truncate">テンプレートを選択</h2>
              <p className="text-xs text-slate-700 mt-1 hidden sm:block">追加したいブロックを選び、瞬時にLPへ反映できます。</p>
            </div>
            <button
              onClick={onClose}
              className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-sky-100 text-slate-900 hover:bg-sky-200 transition flex-shrink-0 ml-2"
              aria-label="閉じる"
            >
              ×
            </button>
          </div>

          {/* Search bar */}
          <div className="px-3 sm:px-5 sm:px-6 pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" aria-hidden="true" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="テンプレートを検索 (キーワード/用途/カラー)"
                  className="w-full rounded-lg border border-sky-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/70"
                  aria-label="テンプレート検索"
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <FunnelIcon className="h-4 w-4" aria-hidden="true" />
                カテゴリを絞り込み
              </div>
            </div>
          </div>

          {/* Category filters */}
          <div className="px-3 sm:px-5 sm:px-6 pb-3 border-t border-sky-200 pt-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {categoryOptions.map((category) => {
                const isActive = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category.id as typeof selectedCategory)}
                    className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                      isActive
                        ? 'bg-blue-500 text-white shadow-[0_8px_24px_-12px_rgba(37,99,235,0.9)]'
                        : 'bg-sky-100 text-slate-700 hover:bg-sky-200'
                    }`}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="relative flex-1 overflow-y-auto min-h-0 px-2 sm:px-5 sm:px-6 py-3 sm:py-5 sm:py-6">

          {templates.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-center text-slate-700">
              <FolderOpenIcon className="h-12 w-12 text-slate-500" aria-hidden="true" />
              <p className="text-sm">利用可能なテンプレートがありません。管理者にお問い合わせください。</p>
            </div>
          ) : (
            <>
              {filteredGroups.length === 0 ? (
                <div className="mt-6 rounded-xl border border-sky-200 bg-sky-50 p-10 text-center text-sm text-slate-700">
                  条件に一致するテンプレートが見つかりませんでした。検索ワードやカテゴリを変更してみてください。
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  {filteredGroups.map((group) => {
                    const activeVariantId = activeVariants[group.templateId] ?? group.variants[0]?.id;
                    const activeVariant = group.variants.find((variant) => variant.id === activeVariantId) ?? group.variants[0];
                    const palette = activeVariant ? getPalette(activeVariant) : { accent: '#38BDF8', accentSoft: '#38BDF8', background: '#0F172A', text: '#FFFFFF' };
                    const categoryMeta = CATEGORY_META[group.category] ?? {
                      name: group.category,
                      icon: <DocumentTextIcon className={iconClass} aria-hidden="true" />,
                    };

                    return (
                      <div
                        key={group.templateId}
                        className="group relative overflow-hidden rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 sm:px-5 sm:py-5 transition-colors hover:border-sky-300 hover:bg-sky-100"
                      >
                        <div className="absolute inset-x-0 -top-28 h-32 bg-gradient-to-br from-blue-500/25 via-transparent to-purple-500/25 blur-3xl opacity-0 transition group-hover:opacity-100" />

                        <div className="relative flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span
                              className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-300 bg-sky-100 text-slate-700"
                            >
                              {categoryMeta.icon}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-slate-900">{group.displayName}</span>
                                <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700">
                                  バリエーション {group.variants.length}
                                </span>
                              </div>
                              <div className="mt-1 flex items-center gap-1">
                                <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">{categoryMeta.name}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleAddTemplate(group)}
                            className="shrink-0 rounded-full border border-sky-300 bg-sky-100 px-3 py-1 text-xs font-semibold text-slate-900 transition hover:bg-sky-200 hover:border-sky-400"
                          >
                            追加する
                          </button>
                        </div>

                        <div className="relative mt-4 grid gap-2">
                          <div className="flex flex-wrap gap-2">
                            {group.variants.map((variant) => {
                              const paletteForVariant = getPalette(variant);
                              const isActive = variant.id === activeVariant?.id;
                              return (
                                <button
                                  key={variant.id}
                                  type="button"
                                  onClick={() => handleVariantSelect(group.templateId, variant.id)}
                                  className={`rounded-full border px-3 py-1 text-[11px] font-medium transition ${
                                    isActive
                                      ? 'shadow-[0_12px_30px_-20px_rgba(148,163,255,0.9)]'
                                      : 'opacity-90 hover:opacity-100'
                                  }`}
                                  style={{
                                    borderColor: isActive ? '#2563eb' : '#bae6fd',
                                    background: isActive ? '#2563eb' : '#e0f2fe',
                                    color: isActive ? '#FFFFFF' : '#0f172a',
                                  }}
                                >
                                  {variant.name.replace(group.displayName, '').replace(/[（）]/g, '').trim() || '基本'}
                                </button>
                              );
                            })}
                          </div>

                          {activeVariant && (
                            <div className="rounded-xl border border-sky-200 bg-sky-50 p-3">
                              <h4 className="text-xs font-semibold text-slate-900">
                                {activeVariant.name}
                              </h4>
                              <p className="mt-1 text-[11px] leading-relaxed text-slate-700">
                                {activeVariant.description}
                              </p>
                            </div>
                          )}
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
        <div className="relative border-t border-sky-200 bg-sky-50 px-2 sm:px-5 sm:px-6 py-2 sm:py-3.5 text-center text-[10px] sm:text-[11px] sm:text-xs text-slate-700 flex-shrink-0">
          <span className="font-medium text-slate-900">ヒント:</span> <span className="hidden sm:inline">追加後はプロパティパネルで色やコンテンツを自由に編集できます。</span><span className="sm:hidden">追加後に編集できます</span>
        </div>
      </div>
    </div>
  );
}
