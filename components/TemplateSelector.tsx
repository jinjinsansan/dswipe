'use client';

import React from 'react';
import { DocumentTextIcon, FolderOpenIcon } from '@heroicons/react/24/outline';
import { getAllTemplates } from '@/lib/templates';
import { resolveViewerPalette } from '@/components/viewer/theme';
import type { TemplateBlock } from '@/types/templates';

interface TemplateSelectorProps {
  onSelectTemplate: (template: TemplateBlock) => void;
  onClose: () => void;
}

const iconClass = 'h-4 w-4';

const CATEGORY_META: Record<string, { name: string; icon: React.ReactNode }> = {
  header: {
    name: 'ヒーロー',
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="6" />
        <path strokeLinecap="round" d="M12 3v2m0 14v2m9-9h-2M5 12H3" />
        <path strokeLinecap="round" d="M16.95 7.05 15.54 8.46M8.46 15.54 7.05 16.95M16.95 16.95l-1.41-1.41M8.46 8.46 7.05 7.05" />
      </svg>
    ),
  },
  content: {
    name: 'コンテンツ',
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path strokeLinecap="round" d="M8 7h8M8 11h8M8 15h5" />
      </svg>
    ),
  },
  conversion: {
    name: 'コンバージョン',
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 18 10 12l4 4 6-6" />
        <path strokeLinecap="round" d="M4 6h16" />
      </svg>
    ),
  },
  'social-proof': {
    name: '社会的証明',
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
        <path d="M12 3 4 7v5c0 5 4 9 8 9s8-4 8-9V7l-8-4Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m9.5 12 1.5 1.5L15 9.5" />
      </svg>
    ),
  },
  media: {
    name: 'メディア',
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
        <rect x="4" y="5" width="16" height="14" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m10 9 6 4-6 4V9Z" />
      </svg>
    ),
  },
  form: {
    name: 'フォーム',
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
        <path d="M8 3h8l3 4v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
        <path strokeLinecap="round" d="M9 12h6M9 16h4M9 7h3" />
      </svg>
    ),
  },
  'info-product': {
    name: '情報商材特化',
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
        <path d="m12 3 8 4-8 4-8-4 8-4Z" />
        <path d="m4 11 8 4 8-4" />
        <path d="m4 15 8 4 8-4" />
      </svg>
    ),
  },
  image: {
    name: '画像',
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m8 14 3-3 4 4 3-3" />
        <circle cx="9" cy="10" r="1" />
      </svg>
    ),
  },
};

export default function TemplateSelector({ onSelectTemplate, onClose }: TemplateSelectorProps) {
  const templates = React.useMemo(() => getAllTemplates(), []);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-6xl h-[90vh] sm:h-auto sm:max-h-[88vh] overflow-hidden rounded-2xl border border-white/10 bg-[#070b16]/95 shadow-[0_36px_120px_-60px_rgba(56,189,248,0.6)] flex flex-col">
        <div className="pointer-events-none absolute -top-24 -left-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -right-16 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />

        {/* Header */}
        <div className="relative flex items-center justify-between px-3 sm:px-5 sm:px-6 py-3 sm:py-4 sm:py-5 border-b border-white/10 flex-shrink-0">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.32em] text-blue-200/80 mb-1">Template Library</p>
            <h2 className="text-lg sm:text-xl font-semibold text-white truncate">テンプレートを選択</h2>
            <p className="text-xs text-gray-400 mt-1 hidden sm:block">追加したいブロックを選び、瞬時にLPへ反映できます。</p>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition flex-shrink-0 ml-2"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="relative flex-1 overflow-y-auto min-h-0 px-2 sm:px-5 sm:px-6 py-3 sm:py-5 sm:py-6">
          {templates.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-center text-gray-400">
              <FolderOpenIcon className="h-12 w-12 text-gray-500" aria-hidden="true" />
              <p className="text-sm">利用可能なテンプレートがありません。管理者にお問い合わせください。</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
              {templates.map((template) => {
                const defaultContent = template.defaultContent as Record<string, unknown> & {
                  themeKey?: string;
                  accentColor?: string;
                };
                const palette = resolveViewerPalette(defaultContent?.themeKey, defaultContent?.accentColor as string | undefined);
                const accentColor = palette.accent;
                const accentSoft = palette.accentSoft ?? palette.accent;
                const meta = CATEGORY_META[template.category] || {
                  name: template.category,
                  icon: <DocumentTextIcon className={iconClass} aria-hidden="true" />,
                };
                return (
                  <button
                    key={template.id}
                    onClick={() => {
                      onSelectTemplate(template);
                      onClose();
                    }}
                    className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] px-3 sm:px-4 pt-3 sm:pt-4 pb-3 sm:pb-4 text-left transition-all hover:border-blue-400/70 hover:bg-white/[0.05] hover:shadow-[0_20px_45px_-35px_rgba(59,130,246,0.65)]"
                  >
                    <div className="absolute inset-x-0 -top-28 h-32 bg-gradient-to-br from-blue-500/25 via-transparent to-purple-500/25 blur-2xl opacity-0 transition group-hover:opacity-100" />

                    <div className="relative flex items-center justify-between gap-2 sm:gap-3">
                      <span
                        className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg flex-shrink-0"
                        style={{ background: accentSoft, color: palette.text }}
                      >
                        {meta.icon}
                      </span>
                      <span
                        className="rounded-full px-2 sm:px-3 py-0.5 text-[10px] sm:text-[11px] font-medium truncate"
                        style={{
                          border: `1px solid ${accentSoft}`,
                          background: `${accentSoft}`,
                          color: palette.text,
                        }}
                      >
                        {meta.name}
                      </span>
                    </div>

                    <div className="relative mt-2 sm:mt-3 space-y-1">
                      <h3
                        className="text-xs sm:text-sm font-semibold line-clamp-1"
                        style={{ color: accentColor }}
                      >
                        {template.name}
                      </h3>
                      <p className="text-[10px] sm:text-[11px] text-gray-400 leading-relaxed line-clamp-2">
                        {template.description}
                      </p>
                    </div>

                    <div className="relative mt-2 sm:mt-4 flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] font-medium text-blue-300">
                      追加する
                      <svg className="h-3 sm:h-3.5 w-3 sm:w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="relative border-t border-white/10 bg-white/5 px-2 sm:px-5 sm:px-6 py-2 sm:py-3.5 text-center text-[10px] sm:text-[11px] sm:text-xs text-gray-400 flex-shrink-0">
          <span className="font-medium text-white/80">ヒント:</span> <span className="hidden sm:inline">追加後はプロパティパネルで色やコンテンツを自由に編集できます。</span><span className="sm:hidden">追加後に編集できます</span>
        </div>
      </div>
    </div>
  );
}
