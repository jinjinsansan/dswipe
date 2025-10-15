'use client';

import React from 'react';
import { getAllTemplates } from '@/lib/templates';
import type { TemplateBlock } from '@/types/templates';

interface TemplateSelectorProps {
  onSelectTemplate: (template: TemplateBlock) => void;
  onClose: () => void;
}

const iconClass = 'h-5 w-5';

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
    <div className="fixed inset-0 bg-black/75 backdrop-blur-2xl z-50 flex items-center justify-center p-6">
      <div className="relative w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-3xl border border-white/10 bg-[#0a0f1d]/95 shadow-[0_48px_140px_-60px_rgba(56,189,248,0.65)]">
        <div className="pointer-events-none absolute -top-32 -left-24 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-36 -right-20 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl" />

        <div className="relative flex items-center justify-between px-8 py-6 border-b border-white/10">
          <div>
            <p className="text-[11px] uppercase tracking-[0.45em] text-blue-300/70 mb-2">Template Library</p>
            <h2 className="text-2xl font-semibold text-white">テンプレートを選択</h2>
            <p className="text-sm text-gray-400 mt-1">用途に合わせたブロックをすばやく追加できます。</p>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        <div className="relative flex-1 overflow-y-auto px-8 py-8 space-y-6">
          {templates.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-center text-gray-400">
              <span className="text-4xl">🗂️</span>
              <p className="text-sm">利用可能なテンプレートがありません。管理者にお問い合わせください。</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => {
                const meta = CATEGORY_META[template.category] || { name: template.category, icon: '📄' };
                return (
                  <button
                    key={template.id}
                    onClick={() => {
                      onSelectTemplate(template);
                      onClose();
                    }}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] px-5 pt-6 pb-7 text-left transition-all hover:border-blue-400/70 hover:bg-white/[0.06] hover:shadow-[0_28px_60px_-35px_rgba(59,130,246,0.75)]"
                  >
                    <div className="absolute inset-x-0 -top-36 h-40 bg-gradient-to-br from-blue-500/25 via-transparent to-purple-500/25 blur-2xl opacity-0 transition group-hover:opacity-100" />

                    <div className="relative flex items-center justify-between gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/20 text-2xl">
                        {meta.icon}
                      </span>
                      <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-blue-100/80">
                        {meta.name}
                      </span>
                    </div>

                    <div className="relative mt-5 space-y-3">
                      <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                      <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">
                        {template.description}
                      </p>
                    </div>

                    <div className="relative mt-6 flex items-center gap-2 text-sm font-medium text-blue-300">
                      追加する
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="relative border-t border-white/10 bg-white/5 px-8 py-5 text-center text-sm text-gray-400">
          <span className="font-medium text-white/80">ヒント:</span> 追加後はプロパティパネルで色やコンテンツを自由に編集できます。
        </div>
      </div>
    </div>
  );
}
