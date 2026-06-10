'use client';

import React from 'react';
import { getAllTemplates } from '@/lib/templates';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4" style={{ background: 'rgba(11,31,58,.45)' }}>
      <div className="card relative flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden p-0 sm:h-auto sm:max-h-[88vh]">
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b px-4 py-4 sm:px-6 sm:py-5" style={{ borderColor: 'var(--line)' }}>
          <div className="min-w-0">
            <p className="mb-1 text-[10px] uppercase tracking-[0.32em]" style={{ color: 'var(--brand)' }}>Template Library</p>
            <h2 className="truncate text-lg font-bold sm:text-xl" style={{ color: 'var(--ink)' }}>テンプレートを選択</h2>
            <p className="mt-1 hidden text-xs sm:block" style={{ color: 'var(--muted)' }}>追加したいブロックを選び、瞬時にLPへ反映できます。</p>
          </div>
          <button
            onClick={onClose}
            className="ml-2 inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-lg transition hover:bg-slate-200"
            style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-6">
          {templates.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-center" style={{ color: 'var(--muted)' }}>
              <span className="text-4xl">🗂️</span>
              <p className="text-sm">利用可能なテンプレートがありません。管理者にお問い合わせください。</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {templates.map((template) => {
                const meta = CATEGORY_META[template.category] || { name: template.category, icon: '📄' };
                return (
                  <button
                    key={template.id}
                    onClick={() => {
                      onSelectTemplate(template);
                      onClose();
                    }}
                    className="card card-hover group px-4 pb-4 pt-4 text-left"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--surface-tint)', color: 'var(--brand)' }}>
                        {meta.icon}
                      </span>
                      <span className="truncate rounded-full border px-3 py-0.5 text-[11px] font-medium" style={{ background: 'var(--surface-tint)', borderColor: 'var(--tint-border)', color: 'var(--brand)' }}>
                        {meta.name}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1">
                      <h3 className="line-clamp-1 text-sm font-bold" style={{ color: 'var(--ink)' }}>{template.name}</h3>
                      <p className="line-clamp-2 text-[11px] leading-relaxed" style={{ color: 'var(--muted)' }}>
                        {template.description}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: 'var(--brand)' }}>
                      追加する
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
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
        <div className="flex-shrink-0 border-t px-4 py-3 text-center text-[11px] sm:px-6" style={{ borderColor: 'var(--line)', background: 'var(--surface-2)', color: 'var(--muted)' }}>
          <span className="font-semibold" style={{ color: 'var(--ink)' }}>ヒント:</span> <span className="hidden sm:inline">追加後はプロパティパネルで色やコンテンツを自由に編集できます。</span><span className="sm:hidden">追加後に編集できます</span>
        </div>
      </div>
    </div>
  );
}
