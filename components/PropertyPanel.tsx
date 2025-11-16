'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { ArrowPathIcon, CloudArrowUpIcon, InformationCircleIcon, PaintBrushIcon, PhotoIcon, TrashIcon } from '@heroicons/react/24/outline';
import { HexColorPicker } from 'react-colorful';
import { BlockContent, BlockType } from '@/types/templates';
import { mediaApi } from '@/lib/api';
import { COLOR_THEMES, ColorThemeKey } from '@/lib/templates';
import { DEFAULT_FONT_KEY, FONT_OPTIONS } from '@/lib/fonts';
import { isProductCtaBlock } from '@/lib/productCtaBlocks';

const MediaLibraryModal = dynamic(() => import('./MediaLibraryModal'), {
  loading: () => null,
  ssr: false,
});

const THEME_ENTRIES = Object.entries(COLOR_THEMES) as Array<[
  ColorThemeKey,
  (typeof COLOR_THEMES)[ColorThemeKey]
]>;

interface PropertyPanelProps {
  block: {
    id: string;
    blockType: string;
    content: BlockContent;
  } | null;
  onUpdateContent: (field: string, value: any) => void;
  onClose: () => void;
  onGenerateAI?: (type: 'headline' | 'subtitle' | 'description' | 'cta', field: string) => void;
  linkedProduct?: { id: string; title?: string | null } | null;
  linkedSalon?: { id: string; title?: string | null; public_path?: string | null } | null;
  focusedField?: string | null;
  onFocusedFieldChange?: (field: string | null) => void;
}

type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

function SectionHeader({ icon: Icon, label }: { icon: IconComponent; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
      <Icon className="h-4 w-4 text-slate-500" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export default function PropertyPanel({ block, onUpdateContent, onClose, onGenerateAI, linkedProduct, linkedSalon, focusedField, onFocusedFieldChange }: PropertyPanelProps) {
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [activeImageField, setActiveImageField] = useState<string | null>(null);
  const [copiedColorField, setCopiedColorField] = useState<string | null>(null);
  const copyResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyResetTimeoutRef.current) {
        clearTimeout(copyResetTimeoutRef.current);
      }
    };
  }, []);

  const handleCopyColor = async (fieldName: string, colorValue: string) => {
    try {
      if (!navigator?.clipboard) {
        alert('お使いのブラウザではクリップボードコピーがサポートされていません');
        return;
      }
      await navigator.clipboard.writeText(colorValue);
      setCopiedColorField(fieldName);
      if (copyResetTimeoutRef.current) {
        clearTimeout(copyResetTimeoutRef.current);
      }
      copyResetTimeoutRef.current = setTimeout(() => {
        setCopiedColorField(null);
      }, 1500);
    } catch (error) {
      console.error('カラーコードのコピーに失敗しました:', error);
      alert('カラーコードのコピーに失敗しました');
    }
  };

  const blockType = block?.blockType as BlockType | undefined;

  const FIELD_ID_MAP: Partial<Record<BlockType, Record<string, string>>> = {
    'top-hero-1': {
      tagline: 'hero.tagline',
      highlightText: 'hero.highlightText',
      title: 'hero.title',
      subtitle: 'hero.subtitle',
      buttonText: 'hero.buttonText',
      buttonUrl: 'hero.buttonText',
      secondaryButtonText: 'hero.secondaryButtonText',
      secondaryButtonUrl: 'hero.secondaryButtonText',
      badgeText: 'hero.badgeText',
    },
    'top-inline-cta-1': {
      eyebrow: 'inlineCTA.eyebrow',
      title: 'inlineCTA.title',
      subtitle: 'inlineCTA.subtitle',
      buttonText: 'inlineCTA.buttonText',
      buttonUrl: 'inlineCTA.buttonText',
    },
    'top-faq-1': {
      title: 'faq.title',
      subtitle: 'faq.subtitle',
    },
    'top-guarantee-1': {
      badgeText: 'guarantee.badgeText',
      title: 'guarantee.title',
      subtitle: 'guarantee.subtitle',
      guaranteeDetails: 'guarantee.guaranteeDetails',
    },
  };

  const resolveFieldId = (field: string) => {
    if (!blockType) return field;
    const mapping = FIELD_ID_MAP[blockType];
    return mapping?.[field] ?? field;
  };

  const focusRingClass = (active: boolean) =>
    active ? 'ring-2 ring-blue-400/60 ring-offset-2 ring-offset-white shadow-sm' : '';

  const isFocusedField = (field: string) => focusedField === field;

  const handleFocusChange = (field: string | null) => {
    onFocusedFieldChange?.(field);
  };

  // 色フィールドと表示名のマッピング
  const colorFields = {
    backgroundColor: { label: '背景色', defaultColor: '#FFFFFF' },
    textColor: { label: 'テキスト色', defaultColor: '#0F172A' },
    accentColor: { label: 'アクセントカラー', defaultColor: '#38BDF8' },
    buttonColor: { label: 'ボタン色', defaultColor: '#2563EB' },
    secondaryButtonColor: { label: 'セカンダリーボタン色', defaultColor: '#64748B' },
    surfaceColor: { label: 'カード背景色', defaultColor: '#10233F' },
    overlayColor: { label: 'オーバーレイ色', defaultColor: '#0B1120' },
    titleColor: { label: '見出し色', defaultColor: '#111827' },
    descriptionColor: { label: '説明テキスト色', defaultColor: '#666666' },
    iconColor: { label: 'アイコン色', defaultColor: '#3B82F6' },
  } as const;

  const COLOR_FIELD_MAP: Partial<Record<BlockType, Array<keyof typeof colorFields>>> = {
    'top-hero-1': ['backgroundColor', 'overlayColor', 'textColor', 'accentColor', 'buttonColor', 'secondaryButtonColor'],
    'top-hero-image-1': ['backgroundColor', 'overlayColor', 'textColor', 'accentColor', 'buttonColor', 'secondaryButtonColor'],
    'top-highlights-1': ['backgroundColor', 'textColor', 'accentColor'],
    'top-cta-1': ['backgroundColor', 'textColor', 'accentColor', 'buttonColor', 'secondaryButtonColor', 'surfaceColor'],
    'top-testimonials-1': ['backgroundColor', 'textColor', 'accentColor'],
    'top-faq-1': ['backgroundColor', 'textColor', 'accentColor'],
    'top-pricing-1': ['backgroundColor', 'textColor', 'accentColor', 'buttonColor'],
    'top-before-after-1': ['backgroundColor', 'textColor', 'accentColor'],
    'top-problem-1': ['backgroundColor', 'textColor', 'accentColor'],
    'top-bonus-1': ['backgroundColor', 'textColor', 'accentColor'],
    'top-guarantee-1': ['backgroundColor', 'textColor', 'accentColor'],
    'top-countdown-1': ['backgroundColor', 'textColor', 'accentColor'],
    'top-inline-cta-1': ['backgroundColor', 'textColor', 'accentColor', 'buttonColor'],
    'top-flex-1': ['backgroundColor', 'textColor', 'accentColor'],
    'top-media-spotlight-1': ['backgroundColor', 'textColor', 'accentColor', 'buttonColor'],
    'top-newsletter-1': ['backgroundColor', 'textColor', 'buttonColor'],
    'top-contact-1': ['backgroundColor', 'textColor', 'buttonColor'],
    'top-tokusho-1': ['backgroundColor', 'textColor'],
  };

  // 色ピッカーのレンダリング関数（DRY原則）
  const renderColorPicker = (fieldName: keyof typeof colorFields, contentValue: any) => {
    const config = colorFields[fieldName];
    const value = contentValue || config.defaultColor;
    const pickerId = fieldName;

    return (
      <div>
        <label className="block text-sm lg:text-sm font-medium text-gray-300 mb-2">
          {config.label}
        </label>
        <div className="relative flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => setShowColorPicker(showColorPicker === pickerId ? null : pickerId)}
              className="w-full px-3 lg:px-4 py-2.5 lg:py-2 bg-white border border-slate-300 rounded-lg text-slate-900 flex items-center justify-between hover:border-slate-400 text-base lg:text-sm min-h-[44px] lg:min-h-auto"
            >
              <span>{value}</span>
              <div
                className="w-8 h-8 rounded border-2 border-slate-300"
                style={{ backgroundColor: value }}
              />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                handleCopyColor(pickerId, value);
              }}
              className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-200 transition-colors min-w-[90px]"
              title="カラーコードをコピー"
            >
              {copiedColorField === pickerId ? 'コピー済み' : 'コピー'}
            </button>
          </div>
          <input
            type="text"
            value={value}
            onChange={(e) => onUpdateContent(fieldName, e.target.value)}
            onFocus={(e) => e.target.select()}
            className="px-3 lg:px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-blue-500"
            placeholder="#000000"
            spellCheck={false}
          />
          {showColorPicker === pickerId && (
            <div className="absolute top-full left-0 mt-2 z-50 bg-white p-3 rounded-lg shadow-2xl border border-slate-200">
              <HexColorPicker
                color={value}
                onChange={(color) => onUpdateContent(fieldName, color)}
              />
              <button
                onClick={() => setShowColorPicker(null)}
                className="w-full mt-2 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                完了
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderColorSection = () => {
    if (!blockType) return null;

    const fields = COLOR_FIELD_MAP[blockType];
    if (!fields || fields.length === 0) {
      return null;
    }

    return (
      <div className="space-y-4 pb-4 border-b border-slate-200">
        <div>
          <SectionHeader icon={PaintBrushIcon} label="カラー設定" />
          <div className="space-y-4">
            {fields.map((field) => renderColorPicker(field, (content as any)[field]))}
          </div>
          {blockType === 'top-cta-1' ? (
            <div className="mt-4 space-y-2">
              <label className="block text-sm lg:text-sm font-medium text-slate-700">
                背景グラデーション
              </label>
              <input
                type="text"
                value={(content as any).backgroundGradient || ''}
                onChange={(e) => onUpdateContent('backgroundGradient', e.target.value)}
                className="w-full px-3 lg:px-4 py-2.5 lg:py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-base lg:text-sm min-h-[44px] lg:min-h-auto"
                placeholder="linear-gradient(...)"
              />
              <p className="text-xs text-slate-500">
                CSSの linear-gradient 形式で指定できます。空欄にするとグラデーションなしになります。
              </p>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  const handleImageUpload = (fieldName: string) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const response = await mediaApi.upload(file);
      const imageUrl = response.data.url;
      onUpdateContent(fieldName, imageUrl);
    } catch (error) {
      console.error('画像アップロードエラー:', error);
      alert('画像のアップロードに失敗しました');
    } finally {
      setIsUploading(false);
    }
  };

  if (!block) {
    return null;
  }

  const content = block.content;
  const baseFaqItems = Array.isArray((content as any).items) ? [...((content as any).items as Array<{ question: string; answer: string }>)] : [];
  const faqItems = baseFaqItems.length > 0 ? baseFaqItems : [
    { question: '質問内容を入力', answer: '回答内容を入力' },
  ];
  const guaranteeBullets = Array.isArray((content as any).bulletPoints)
    ? [...((content as any).bulletPoints as string[])]
    : ['保証の詳細を入力'];
  const problemItems = Array.isArray((content as any).problems)
    ? [...((content as any).problems as string[])]
    : null;
  const supportsProductLink = isProductCtaBlock(blockType);
  const isProductLinked = Boolean(linkedProduct?.id) && supportsProductLink;
  const isSalonLinked = Boolean(linkedSalon?.id) && supportsProductLink;
  const rawUseLinkedProduct = (content as any).useLinkedProduct;
  const useLinkedProduct = supportsProductLink
    ? typeof rawUseLinkedProduct === 'boolean'
      ? rawUseLinkedProduct
      : Boolean(isProductLinked || isSalonLinked)
    : false;
  const isPrimaryLinkLocked = supportsProductLink && useLinkedProduct && (isProductLinked || isSalonLinked);
  const supportsThemeSelection = false;
  const currentThemeKey = (content as any).themeKey as ColorThemeKey | undefined;
  const textFieldCandidates = [
    'tagline',
    'title',
    'subtitle',
    'text',
    'highlightText',
    'buttonText',
    'secondaryButtonText',
    'subText',
    'topHeading',
    'body',
    'bottomHeading',
    'caption',
    'urgencyText',
    'stats',
    'testimonials',
    'plans',
  ];
  const linkedTargetLabel = isSalonLinked
    ? linkedSalon?.title || (linkedSalon?.id ? `サロンID: ${linkedSalon.id}` : '選択中のサロン')
    : linkedProduct?.title || (linkedProduct?.id ? `商品ID: ${linkedProduct.id}` : '選択中の商品');
  const linkedTargetKind = isSalonLinked ? 'オンラインサロン' : '商品';
  const hasEditableText = textFieldCandidates.some((key) => key in content);
  const currentFontKey = (content as any).fontFamily || DEFAULT_FONT_KEY;

  return (
    <div className="h-full flex flex-col">
      {/* ヘッダー */}
      <div className="flex items-center justify-between p-3 lg:p-4 border-b border-slate-200 flex-shrink-0">
        <div>
          <h3 className="text-slate-900 text-sm lg:text-sm font-light">プロパティ</h3>
          <p className="text-slate-500 text-xs mt-0.5">{block.blockType}</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-900 transition-colors text-xl lg:text-sm"
        >
          ×
        </button>
      </div>

      {/* プロパティ */}
      <div className="p-3 lg:p-4 space-y-4 overflow-y-auto flex-1">
        {isPrimaryLinkLocked && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-3 text-xs leading-relaxed text-blue-800">
            <p className="font-semibold text-blue-900">
              {isSalonLinked ? 'オンラインサロン導線として設定されています' : '商品と連動しています'}
            </p>
            <p className="mt-1">
              公開ページではこのブロックの一次CTAを押すと、
              「{linkedTargetLabel}」の
              {isSalonLinked ? '公開ページに遷移します。' : '購入モーダルが開きます。'}
            </p>
            <p className="mt-1">
              プレビューではリンク先を表示していますが、公開時は{linkedTargetKind}への導線が優先されます。
            </p>
          </div>
        )}

        {/* テキストコンテンツ */}
        {('tagline' in content) && (
          <div className={`-m-1 p-1 rounded-lg ${focusRingClass(isFocusedField(resolveFieldId('tagline')))}`}>
            <label className="block text-sm lg:text-sm font-medium text-slate-700 mb-2">
              タグライン
            </label>
            <input
              type="text"
              value={(content as any).tagline || ''}
              onChange={(e) => onUpdateContent('tagline', e.target.value)}
              onFocus={() => handleFocusChange(resolveFieldId('tagline'))}
              className="w-full px-3 lg:px-4 py-2.5 lg:py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-base lg:text-sm min-h-[44px] lg:min-h-auto"
              placeholder="タグラインを入力"
            />
          </div>
        )}

        {('badgeText' in content) && (
          <div className={`-m-1 p-1 rounded-lg ${focusRingClass(isFocusedField(resolveFieldId('badgeText')))}`}>
            <label className="block text-sm lg:text-sm font-medium text-slate-700 mb-2">
              バッジテキスト
            </label>
            <input
              type="text"
              value={(content as any).badgeText || ''}
              onChange={(e) => onUpdateContent('badgeText', e.target.value)}
              onFocus={() => handleFocusChange(resolveFieldId('badgeText'))}
              className="w-full px-3 lg:px-4 py-2.5 lg:py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-base lg:text-sm min-h-[44px] lg:min-h-auto"
              placeholder="バッジテキストを入力"
            />
          </div>
        )}

        {('eyebrow' in content) && (
          <div className={`-m-1 p-1 rounded-lg ${focusRingClass(isFocusedField(resolveFieldId('eyebrow')))}`}>
            <label className="block text-sm lg:text-sm font-medium text-slate-700 mb-2">
              {blockType === 'top-inline-cta-1' ? 'タグライン（上部テキスト）' : 'アイキャッチテキスト'}
            </label>
            <input
              type="text"
              value={(content as any).eyebrow || ''}
              onChange={(e) => onUpdateContent('eyebrow', e.target.value)}
              onFocus={() => handleFocusChange(resolveFieldId('eyebrow'))}
              className="w-full px-3 lg:px-4 py-2.5 lg:py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-base lg:text-sm min-h-[44px] lg:min-h-auto"
              placeholder="上部の小見出しを入力"
            />
          </div>
        )}

        {('title' in content) && (
          <div className={`-m-1 p-1 rounded-lg ${focusRingClass(isFocusedField(resolveFieldId('title')))}`}>
            <label className="block text-sm lg:text-sm font-medium text-slate-700 mb-2">
              タイトル
            </label>
            <input
              type="text"
              value={(content as any).title || ''}
              onChange={(e) => onUpdateContent('title', e.target.value)}
              onFocus={() => handleFocusChange(resolveFieldId('title'))}
              className="w-full px-3 lg:px-4 py-2.5 lg:py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-base lg:text-sm min-h-[44px] lg:min-h-auto"
              placeholder="タイトルを入力"
            />
          </div>
        )}

        {('subtitle' in content) && (
          <div className={`-m-1 p-1 rounded-lg ${focusRingClass(isFocusedField(resolveFieldId('subtitle')))}`}>
            <label className="block text-sm lg:text-sm font-medium text-slate-700 mb-2">
              サブタイトル
            </label>
            <input
              type="text"
              value={(content as any).subtitle || ''}
              onChange={(e) => onUpdateContent('subtitle', e.target.value)}
              onFocus={() => handleFocusChange(resolveFieldId('subtitle'))}
              className="w-full px-3 lg:px-4 py-2.5 lg:py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-base lg:text-sm min-h-[44px] lg:min-h-auto"
              placeholder="サブタイトルを入力"
            />
          </div>
        )}

        {('topHeading' in content) && (
          <div className={`-m-1 p-1 rounded-lg ${focusRingClass(isFocusedField(resolveFieldId('topHeading')))}`}>
            <label className="block text-sm lg:text-sm font-medium text-slate-700 mb-2">
              上部見出し
            </label>
            <input
              type="text"
              value={(content as any).topHeading ?? ''}
              onChange={(e) => onUpdateContent('topHeading', e.target.value)}
              onFocus={() => handleFocusChange(resolveFieldId('topHeading'))}
              className="w-full px-3 lg:px-4 py-2.5 lg:py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-base lg:text-sm min-h-[44px] lg:min-h-auto"
              placeholder="見出し（空欄で非表示）"
            />
          </div>
        )}

        {('body' in content) && (
          <div className={`-m-1 p-1 rounded-lg ${focusRingClass(isFocusedField(resolveFieldId('body')))}`}>
            <label className="block text-sm lg:text-sm font-medium text-slate-700 mb-2">
              説明文
            </label>
            <textarea
              value={(content as any).body ?? ''}
              onChange={(e) => onUpdateContent('body', e.target.value)}
              onFocus={() => handleFocusChange(resolveFieldId('body'))}
              rows={4}
              className="w-full px-3 lg:px-4 py-2.5 lg:py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-base lg:text-sm resize-none"
              placeholder="説明文（空欄で非表示）"
            />
          </div>
        )}

        {('bottomHeading' in content) && (
          <div className={`-m-1 p-1 rounded-lg ${focusRingClass(isFocusedField(resolveFieldId('bottomHeading')))}`}>
            <label className="block text-sm lg:text-sm font-medium text-slate-700 mb-2">
              下部見出し
            </label>
            <input
              type="text"
              value={(content as any).bottomHeading ?? ''}
              onChange={(e) => onUpdateContent('bottomHeading', e.target.value)}
              onFocus={() => handleFocusChange(resolveFieldId('bottomHeading'))}
              className="w-full px-3 lg:px-4 py-2.5 lg:py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-base lg:text-sm min-h-[44px] lg:min-h-auto"
              placeholder="見出し（空欄で非表示）"
            />
          </div>
        )}

        {('totalValue' in content) && (
          <div className={`-m-1 p-1 rounded-lg ${focusRingClass(isFocusedField(resolveFieldId('totalValue')))}`}>
            <label className="block text-sm lg:text-sm font-medium text-slate-700 mb-2">
              合計価値バッジ
            </label>
            <input
              type="text"
              value={(content as any).totalValue || ''}
              onChange={(e) => onUpdateContent('totalValue', e.target.value)}
              onFocus={() => handleFocusChange(resolveFieldId('totalValue'))}
              className="w-full px-3 lg:px-4 py-2.5 lg:py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-base lg:text-sm min-h-[44px] lg:min-h-auto"
              placeholder="例：合計109,800円相当"
            />
          </div>
        )}

        {('text' in content) && (
          <div>
            <label className="block text-sm lg:text-sm font-medium text-slate-700 mb-2">
              説明文
            </label>
            <textarea
              value={(content as any).text || ''}
              onChange={(e) => onUpdateContent('text', e.target.value)}
              rows={4}
              className="w-full px-3 lg:px-4 py-2.5 lg:py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none text-base lg:text-sm min-h-[44px] lg:min-h-auto"
              placeholder="説明文を入力"
            />
          </div>
        )}

        {('highlightText' in content) && (
          <div className={`-m-1 p-1 rounded-lg ${focusRingClass(isFocusedField(resolveFieldId('highlightText')))}`}>
            <label className="block text-sm lg:text-sm font-medium text-slate-700 mb-2">
              ハイライトテキスト
            </label>
            <input
              type="text"
              value={(content as any).highlightText || ''}
              onChange={(e) => onUpdateContent('highlightText', e.target.value)}
              onFocus={() => handleFocusChange(resolveFieldId('highlightText'))}
              className="w-full px-3 lg:px-4 py-2.5 lg:py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-base lg:text-sm min-h-[44px] lg:min-h-auto"
              placeholder="ハイライトテキストを入力"
            />
          </div>
        )}

        {('description' in content && blockType === 'top-newsletter-1') && (
          <div>
            <label className="block text-sm lg:text-sm font-medium text-slate-700 mb-2">
              説明文
            </label>
            <textarea
              value={(content as any).description || ''}
              onChange={(e) => onUpdateContent('description', e.target.value)}
              rows={4}
              className="w-full px-3 lg:px-4 py-2.5 lg:py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none text-base lg:text-sm"
              placeholder="メルマガの説明文を入力"
            />
          </div>
        )}

        {('description' in content && blockType === 'top-contact-1') && (
          <div>
            <label className="block text-sm lg:text-sm font-medium text-slate-700 mb-2">
              説明文
            </label>
            <textarea
              value={(content as any).description || ''}
              onChange={(e) => onUpdateContent('description', e.target.value)}
              rows={3}
              className="w-full px-3 lg:px-4 py-2.5 lg:py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none text-base lg:text-sm"
              placeholder="お問い合わせの説明文を入力"
            />
          </div>
        )}

        {('buttonText' in content) && (
          <div className={`-m-1 p-1 rounded-lg ${focusRingClass(isFocusedField(resolveFieldId('buttonText')))}`}>
            <label className="block text-sm lg:text-sm font-medium text-slate-700 mb-2">
              ボタンテキスト
            </label>
            <input
              type="text"
              value={(content as any).buttonText || ''}
              onChange={(e) => onUpdateContent('buttonText', e.target.value)}
              onFocus={() => handleFocusChange(resolveFieldId('buttonText'))}
              className="w-full px-3 lg:px-4 py-2.5 lg:py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-base lg:text-sm min-h-[44px] lg:min-h-auto"
              placeholder="ボタンテキストを入力"
            />
          </div>
        )}
        {/* 特定商取引法ブロックの項目編集 */}
        {blockType === 'top-tokusho-1' && 'items' in content && Array.isArray((content as any).items) && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-700">特商法項目</h4>
              <span className="text-xs text-slate-500">{(content as any).items.length}項目</span>
            </div>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {(content as any).items.map((item: any, index: number) => (
                <div key={index} className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">項目 {index + 1}</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.show !== false}
                        onChange={(e) => {
                          const newItems = [...(content as any).items];
                          newItems[index] = { ...newItems[index], show: e.target.checked };
                          onUpdateContent('items', newItems);
                        }}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs text-slate-600">表示</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={item.label || ''}
                    onChange={(e) => {
                      const newItems = [...(content as any).items];
                      newItems[index] = { ...newItems[index], label: e.target.value };
                      onUpdateContent('items', newItems);
                    }}
                    placeholder="項目名（例：販売業者名）"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                  <textarea
                    value={item.value || ''}
                    onChange={(e) => {
                      const newItems = [...(content as any).items];
                      newItems[index] = { ...newItems[index], value: e.target.value };
                      onUpdateContent('items', newItems);
                    }}
                    placeholder="内容（例：株式会社〇〇）"
                    rows={2}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-sm text-slate-900 focus:outline-none focus:border-blue-500 resize-none"
                  />
                  <select
                    value={item.icon || 'document'}
                    onChange={(e) => {
                      const newItems = [...(content as any).items];
                      newItems[index] = { ...newItems[index], icon: e.target.value };
                      onUpdateContent('items', newItems);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="building">🏢 建物（販売業者名）</option>
                    <option value="user">👤 人物（代表者名）</option>
                    <option value="map">📍 地図（所在地）</option>
                    <option value="phone">📞 電話</option>
                    <option value="email">✉️ メール</option>
                    <option value="yen">💴 価格</option>
                    <option value="card">💳 カード</option>
                    <option value="banknotes">💵 支払方法</option>
                    <option value="clock">⏰ 時間</option>
                    <option value="truck">🚚 配送</option>
                    <option value="refresh">🔄 返品</option>
                    <option value="document">📄 書類</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasEditableText && (
          <div>
            <label className="block text-sm lg:text-sm font-medium text-slate-700 mb-2">フォントスタイル</label>
            <div className="space-y-2">
              <select
                value={currentFontKey}
                onChange={(e) => onUpdateContent('fontFamily', e.target.value)}
                className="w-full px-3 lg:px-4 py-2.5 lg:py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 text-base lg:text-sm min-h-[44px] lg:min-h-auto"
              >
                {FONT_OPTIONS.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs lg:text-[11px] text-slate-500">
                ブロック内の全テキストに適用されます。選択後は他のブロックにもコピーして貼り付け可能です。
              </p>
            </div>
          </div>
        )}

        {('buttonUrl' in content) && (
          <div className={`-m-1 p-1 rounded-lg ${focusRingClass(isFocusedField(resolveFieldId('buttonUrl')))} ${isPrimaryLinkLocked ? 'opacity-90' : ''}`}>
            <label className="block text-sm lg:text-sm font-medium text-slate-700 mb-2">
              ボタンURL
            </label>
            <input
              type="text"
              value={(content as any).buttonUrl || ''}
              onChange={(e) => {
                if (isPrimaryLinkLocked) return;
                onUpdateContent('buttonUrl', e.target.value);
              }}
              readOnly={isPrimaryLinkLocked}
              onFocus={() => handleFocusChange(resolveFieldId('buttonUrl'))}
              className={`w-full px-3 lg:px-4 py-2.5 lg:py-2 bg-white border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-base lg:text-sm min-h-[44px] lg:min-h-auto ${isPrimaryLinkLocked ? 'border-blue-200 bg-blue-100/70 text-slate-500 cursor-not-allowed' : 'border-slate-300'}`}
              placeholder="https://"
              aria-disabled={isPrimaryLinkLocked}
            />
            {isPrimaryLinkLocked && (
              <p className="mt-2 text-xs text-blue-600">
                {isSalonLinked ? 'サロンに連動しているため、公開時はサロン公開ページへ遷移します。' : '商品に連動しているため、公開時はこのURLではなく購入モーダルが開きます。'}
              </p>
            )}
            {supportsProductLink && (
              <label className="mt-3 flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  checked={useLinkedProduct}
                  onChange={(event) => onUpdateContent('useLinkedProduct', event.target.checked)}
                />
                <span className="leading-relaxed">
                  商品・サロン連携のCTAとして使用する
                  <span className="block text-[11px] text-slate-500">
                    有効にすると公開時に商品モーダルまたはサロンページが優先されます。
                  </span>
                </span>
              </label>
            )}
            {supportsProductLink && useLinkedProduct && !(isProductLinked || isSalonLinked) && (
              <p className="mt-2 text-xs text-orange-600">
                商品またはサロンを連携すると公開時に自動で誘導されます（現在は設定したURLが利用されます）。
              </p>
            )}
          </div>
        )}

        {('secondaryButtonText' in content) && (
          <div className={`-m-1 p-1 rounded-lg ${focusRingClass(isFocusedField(resolveFieldId('secondaryButtonText')))}`}>
            <label className="block text-sm lg:text-sm font-medium text-slate-700 mb-2">
              セカンダリーボタン
            </label>
            <input
              type="text"
              value={(content as any).secondaryButtonText || ''}
              onChange={(e) => onUpdateContent('secondaryButtonText', e.target.value)}
              onFocus={() => handleFocusChange(resolveFieldId('secondaryButtonText'))}
              className="w-full px-3 lg:px-4 py-2.5 lg:py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 mb-2 text-base lg:text-sm min-h-[44px] lg:min-h-auto"
              placeholder="セカンダリーボタンの文言"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={(content as any).secondaryButtonUrl || ''}
                onChange={(e) => onUpdateContent('secondaryButtonUrl', e.target.value)}
                onFocus={() => handleFocusChange(resolveFieldId('secondaryButtonText'))}
                className="w-full px-3 lg:px-4 py-2.5 lg:py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-base lg:text-sm min-h-[44px] lg:min-h-auto"
                placeholder="https://"
              />
              <button
                type="button"
                onClick={() => {
                  onUpdateContent('secondaryButtonText', '');
                  onUpdateContent('secondaryButtonUrl', '');
                  handleFocusChange(null);
                }}
                className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100"
              >
                非表示
              </button>
            </div>
          </div>
        )}

        {renderColorSection()}

        {blockType === 'top-faq-1' && (
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <SectionHeader icon={InformationCircleIcon} label="FAQ項目" />
            {faqItems.map((item, index) => {
              const questionFieldId = `faq.items.${index}.question`;
              const answerFieldId = `faq.items.${index}.answer`;
              return (
              <div key={index} className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Q{index + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = [...faqItems];
                      next.splice(index, 1);
                      onUpdateContent('items', next);
                    }}
                    className="text-xs text-red-500 hover:text-red-600"
                    disabled={faqItems.length <= 1}
                  >
                    削除
                  </button>
                </div>
                <div className={`-m-1 p-1 rounded-lg ${focusRingClass(isFocusedField(questionFieldId))}`}>
                  <input
                    type="text"
                    value={item.question}
                    onChange={(e) => {
                      const next = [...faqItems];
                      next[index] = { ...next[index], question: e.target.value };
                      onUpdateContent('items', next);
                    }}
                    onFocus={() => handleFocusChange(questionFieldId)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                    placeholder="質問文を入力"
                  />
                </div>
                <div className={`-m-1 p-1 rounded-lg ${focusRingClass(isFocusedField(answerFieldId))}`}>
                  <textarea
                    value={item.answer}
                    onChange={(e) => {
                      const next = [...faqItems];
                      next[index] = { ...next[index], answer: e.target.value };
                      onUpdateContent('items', next);
                    }}
                    onFocus={() => handleFocusChange(answerFieldId)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm resize-none"
                    rows={3}
                    placeholder="回答文を入力"
                  />
                </div>
              </div>
            );})}
            <button
              type="button"
              onClick={() => onUpdateContent('items', [...faqItems, { question: '', answer: '' }])}
              className="w-full rounded-lg border border-dashed border-slate-300 py-2 text-sm text-slate-600 hover:bg-slate-100"
            >
              FAQを追加
            </button>
          </div>
        )}

        {blockType === 'top-guarantee-1' && (
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <SectionHeader icon={InformationCircleIcon} label="保証コンテンツ" />
            <div className={`space-y-2 -m-1 p-1 rounded-lg ${focusRingClass(isFocusedField('guarantee.guaranteeDetails'))}`}>
              <label className="text-sm font-medium text-slate-700">保証詳細</label>
              <textarea
                value={(content as any).guaranteeDetails || ''}
                onChange={(e) => onUpdateContent('guaranteeDetails', e.target.value)}
                rows={4}
                onFocus={() => handleFocusChange('guarantee.guaranteeDetails')}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                placeholder="保証内容を入力"
              />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700">保証項目</label>
              {guaranteeBullets.map((point, index) => {
                const bulletFieldId = `guarantee.bulletPoints.${index}`;
                return (
                  <div
                    key={index}
                    className={`flex gap-2 -m-1 p-1 rounded-lg ${focusRingClass(isFocusedField(bulletFieldId))}`}
                  >
                    <input
                      type="text"
                      value={point}
                      onChange={(e) => {
                        const next = [...guaranteeBullets];
                        next[index] = e.target.value;
                        onUpdateContent('bulletPoints', next);
                      }}
                      onFocus={() => handleFocusChange(bulletFieldId)}
                      className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                      placeholder="保証項目を入力"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = [...guaranteeBullets];
                        next.splice(index, 1);
                        onUpdateContent('bulletPoints', next.length ? next : ['']);
                        handleFocusChange(null);
                      }}
                      className="px-3 py-2 text-xs text-red-500 hover:text-red-600"
                      disabled={guaranteeBullets.length <= 1}
                    >
                      削除
                    </button>
                  </div>
                );
              })}
              <button
                type="button"
                onClick={() => onUpdateContent('bulletPoints', [...guaranteeBullets, ''])}
                className="w-full rounded-lg border border-dashed border-slate-300 py-2 text-sm text-slate-600 hover:bg-slate-100"
              >
                保証項目を追加
              </button>
            </div>
          </div>
        )}

        {('subText' in content) && (
          <div>
            <label className="block text-sm lg:text-sm font-medium text-slate-700 mb-2">
              サブテキスト
            </label>
            <textarea
              value={(content as any).subText || ''}
              onChange={(e) => onUpdateContent('subText', e.target.value)}
              rows={3}
              className="w-full px-3 lg:px-4 py-2.5 lg:py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none text-base lg:text-sm min-h-[44px] lg:min-h-auto"
              placeholder="CTAの補足説明"
            />
          </div>
        )}

        {('caption' in content) && (
          <div>
            <label className="block text-sm lg:text-sm font-medium text-slate-700 mb-2">
              キャプション
            </label>
            <input
              type="text"
              value={(content as any).caption || ''}
              onChange={(e) => onUpdateContent('caption', e.target.value)}
              className="w-full px-3 lg:px-4 py-2.5 lg:py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-base lg:text-sm min-h-[44px] lg:min-h-auto"
              placeholder="画像下に表示するテキスト"
            />
          </div>
        )}

        {('urgencyText' in content) && (
          <div>
            <label className="block text-sm lg:text-sm font-medium text-slate-700 mb-2">
              緊急性テキスト
            </label>
            <input
              type="text"
              value={(content as any).urgencyText || ''}
              onChange={(e) => onUpdateContent('urgencyText', e.target.value)}
              className="w-full px-3 lg:px-4 py-2.5 lg:py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-base lg:text-sm min-h-[44px] lg:min-h-auto"
              placeholder="緊急性テキストを入力"
            />
          </div>
        )}

        {('targetDate' in content) && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm lg:text-sm font-medium text-slate-700 mb-2">
                カウントダウン締切日時
              </label>
              <input
                type="datetime-local"
                value={(() => {
                  const targetDate = (content as any).targetDate;
                  
                  // targetDateが無い場合は7日後をデフォルト表示
                  if (!targetDate) {
                    const defaultDate = new Date();
                    defaultDate.setDate(defaultDate.getDate() + 7);
                    return defaultDate.toISOString().slice(0, 16);
                  }
                  
                  const date = new Date(targetDate);
                  const now = new Date();
                  
                  // 過去の日付の場合は7日後に自動置き換え（ユーザーが見落とさないように）
                  if (date < now) {
                    const futureDate = new Date();
                    futureDate.setDate(futureDate.getDate() + 7);
                    return futureDate.toISOString().slice(0, 16);
                  }
                  
                  return date.toISOString().slice(0, 16);
                })()}
                onChange={(e) => {
                  if (e.target.value) {
                    // datetime-localの値をISO 8601形式に変換
                    const isoString = new Date(e.target.value).toISOString();
                    onUpdateContent('targetDate', isoString);
                  }
                }}
                className="w-full px-3 lg:px-4 py-2.5 lg:py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 text-base lg:text-sm min-h-[44px] lg:min-h-auto"
              />
              <p className="text-xs text-slate-500 mt-1">
                カウントダウンの締切日時を設定します
              </p>
              {(() => {
                const targetDate = (content as any).targetDate;
                if (targetDate) {
                  const date = new Date(targetDate);
                  const now = new Date();
                  if (date < now) {
                    return (
                      <p className="text-xs text-amber-600 mt-1 font-semibold">
                        ⚠️ 過去の日付が設定されていたため、7日後の日付に自動変更されました。必要に応じて調整してください。
                      </p>
                    );
                  }
                }
                return null;
              })()}
            </div>

            <div>
              <label className="block text-sm lg:text-sm font-medium text-slate-700 mb-2">
                表示項目
              </label>
              <div className="space-y-2">
                {('showDays' in content) && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(content as any).showDays !== false}
                      onChange={(e) => onUpdateContent('showDays', e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">日数を表示</span>
                  </label>
                )}
                {('showHours' in content) && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(content as any).showHours !== false}
                      onChange={(e) => onUpdateContent('showHours', e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">時間を表示</span>
                  </label>
                )}
                {('showMinutes' in content) && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(content as any).showMinutes !== false}
                      onChange={(e) => onUpdateContent('showMinutes', e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">分を表示</span>
                  </label>
                )}
                {('showSeconds' in content) && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(content as any).showSeconds === true}
                      onChange={(e) => onUpdateContent('showSeconds', e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">秒を表示</span>
                  </label>
                )}
              </div>
            </div>
          </div>
        )}

        {('position' in content) && (
          <div>
            <label className="block text-sm lg:text-sm font-medium text-slate-700 mb-2">
              表示位置
            </label>
            <select
              value={(content as any).position || 'bottom'}
              onChange={(e) => onUpdateContent('position', e.target.value)}
              className="w-full px-3 lg:px-4 py-2.5 lg:py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 text-base lg:text-sm min-h-[44px] lg:min-h-auto"
            >
              <option value="top">上部固定</option>
              <option value="bottom">下部固定</option>
            </select>
          </div>
        )}

        {/* AI生成セクション */}
        {onGenerateAI && (
          <div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">AI生成</h4>
                <p className="text-xs text-slate-500">選択した項目の文面をAIで提案します</p>
              </div>
            </div>
            <div className="space-y-2">
              {('title' in content) && (
                <button
                  onClick={() => onGenerateAI('headline', 'title')}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100/70 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  タイトルを生成
                </button>
              )}
              {('subtitle' in content) && (
                <button
                  onClick={() => onGenerateAI('subtitle', 'subtitle')}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100/70 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  サブタイトルを生成
                </button>
              )}
              {('text' in content) && (
                <button
                  onClick={() => onGenerateAI('description', 'text')}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100/70 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  説明文を生成
                </button>
              )}
              {('buttonText' in content) && (
                <button
                  onClick={() => onGenerateAI('cta', 'buttonText')}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100/70 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  ボタン文言を生成
                </button>
              )}
            </div>
          </div>
        )}

        {(supportsThemeSelection || currentThemeKey) && (
          <div>
            <label className="block text-sm lg:text-sm font-medium text-slate-700 mb-2">カラーテーマ</label>
            <select
              value={currentThemeKey ?? ''}
              onChange={(e) => onUpdateContent('themeKey', e.target.value as ColorThemeKey)}
              className="w-full px-3 lg:px-4 py-2.5 lg:py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 text-base lg:text-sm min-h-[44px] lg:min-h-auto"
            >
              <option value="">デフォルト</option>
              {THEME_ENTRIES.map(([key, value]) => (
                <option key={key} value={key}>{value.name}</option>
              ))}
            </select>
          </div>
        )}

        {Array.isArray((content as any).stats) && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-300">実績・統計</label>
              <button
                type="button"
                onClick={() => {
                  const stats = Array.isArray((content as any).stats) ? [...(content as any).stats] : [];
                  stats.push({ value: '', label: '' });
                  onUpdateContent('stats', stats);
                }}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                + 追加
              </button>
            </div>
            {((content as any).stats as Array<{ value: string; label: string }>).map((stat, index) => (
              <div key={index} className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>項目 {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const stats = [...((content as any).stats as Array<{ value: string; label: string }>)]
                        .filter((_, idx) => idx !== index);
                      onUpdateContent('stats', stats);
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    削除
                  </button>
                </div>
                <input
                  type="text"
                  value={stat.value || ''}
                  onChange={(e) => onUpdateContent(`stats.${index}.value`, e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="表示値 (例: 87%)"
                />
                <input
                  type="text"
                  value={stat.label || ''}
                  onChange={(e) => onUpdateContent(`stats.${index}.label`, e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="ラベル (例: CVR改善率)"
                />
              </div>
            ))}
          </div>
        )}

        {Array.isArray((content as any).features) && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-300">特徴カード</label>
              <button
                type="button"
                onClick={() => {
                  const features = Array.isArray((content as any).features) ? [...(content as any).features] : [];
                  features.push({ icon: '', title: '', description: '' });
                  onUpdateContent('features', features);
                }}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                + 追加
              </button>
            </div>
            {((content as any).features as Array<{ icon?: string; title: string; description: string }>).map((feature, index) => (
              <div key={index} className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>カード {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const features = [...((content as any).features as Array<{ icon?: string; title: string; description: string }>)]
                        .filter((_, idx) => idx !== index);
                      onUpdateContent('features', features);
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    削除
                  </button>
                </div>
                <input
                  type="text"
                  value={feature.icon || ''}
                  onChange={(e) => onUpdateContent(`features.${index}.icon`, e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="アイコン (例: ⚡️)"
                />
                <input
                  type="text"
                  value={feature.title || ''}
                  onChange={(e) => onUpdateContent(`features.${index}.title`, e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="特徴タイトル"
                />
                <textarea
                  value={feature.description || ''}
                  onChange={(e) => onUpdateContent(`features.${index}.description`, e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-blue-500 resize-none"
                  rows={3}
                  placeholder="詳細説明"
                />
              </div>
            ))}
          </div>
        )}

        {Array.isArray((content as any).plans) && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-300">価格プラン</label>
              <button
                type="button"
                onClick={() => {
                  const plans = Array.isArray((content as any).plans) ? [...(content as any).plans] : [];
                  plans.push({ name: '', price: '', period: '', description: '', features: [] });
                  onUpdateContent('plans', plans);
                }}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                + プラン追加
              </button>
            </div>
            {((content as any).plans as Array<Record<string, any>>).map((plan, index) => (
              <div key={index} className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>プラン {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const plans = [...((content as any).plans as Array<Record<string, any>>)].filter((_, idx) => idx !== index);
                      onUpdateContent('plans', plans);
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    削除
                  </button>
                </div>
                <input
                  type="text"
                  value={plan.name || ''}
                  onChange={(e) => onUpdateContent(`plans.${index}.name`, e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="プラン名"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={plan.price || ''}
                    onChange={(e) => onUpdateContent(`plans.${index}.price`, e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-blue-500"
                    placeholder="価格"
                  />
                  <input
                    type="text"
                    value={plan.period || ''}
                    onChange={(e) => onUpdateContent(`plans.${index}.period`, e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-blue-500"
                    placeholder="期間 / バッジ"
                  />
                </div>
                <textarea
                  value={plan.description || ''}
                  onChange={(e) => onUpdateContent(`plans.${index}.description`, e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-blue-500 resize-none"
                  rows={2}
                  placeholder="説明"
                />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600">機能リスト</span>
                    <button
                      type="button"
                      onClick={() => {
                        const features = Array.isArray(plan.features) ? [...plan.features] : [];
                        features.push('');
                        onUpdateContent(`plans.${index}.features`, features);
                      }}
                      className="text-xs text-blue-500 hover:text-blue-400"
                    >
                      + 追加
                    </button>
                  </div>
                  {(Array.isArray(plan.features) && plan.features.length > 0 ? plan.features : ['']).map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => {
                          const features = Array.isArray(plan.features) ? [...plan.features] : [];
                          if (features.length === 0) {
                            features.push('');
                          }
                          features[featureIndex] = e.target.value;
                          onUpdateContent(`plans.${index}.features`, features);
                        }}
                        className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-blue-500"
                        placeholder={`項目 ${featureIndex + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const features = Array.isArray(plan.features) ? [...plan.features] : [];
                          if (features.length <= 1) {
                            onUpdateContent(`plans.${index}.features`, ['']);
                            return;
                          }
                          const next = features.filter((_, idx) => idx !== featureIndex);
                          onUpdateContent(`plans.${index}.features`, next);
                        }}
                        className="px-2 py-1 text-xs text-slate-600 hover:text-red-500"
                      >
                        削除
                      </button>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={plan.buttonText || ''}
                    onChange={(e) => onUpdateContent(`plans.${index}.buttonText`, e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-blue-500"
                    placeholder="ボタン文言"
                  />
                  <input
                    type="text"
                    value={plan.buttonUrl || ''}
                    onChange={(e) => {
                      if (isPrimaryLinkLocked) return;
                      onUpdateContent(`plans.${index}.buttonUrl`, e.target.value);
                    }}
                    readOnly={isPrimaryLinkLocked}
                    className={`w-full px-3 py-2 bg-white border rounded text-slate-900 text-sm focus:outline-none focus:border-blue-500 placeholder-slate-400 ${isPrimaryLinkLocked ? 'border-blue-200 bg-blue-100/70 text-slate-500 cursor-not-allowed' : 'border-slate-300'}`}
                    placeholder="https://"
                    aria-disabled={isPrimaryLinkLocked}
                  />
                </div>
                {isPrimaryLinkLocked && (
                  <p className="text-xs text-blue-600">
                    {isSalonLinked
                      ? 'サロン連携中は公開ページでサロンページへ遷移するため、プランごとのURL設定は無視されます。'
                      : '商品連携中は公開ページでモーダルが表示され、プランごとのURL設定は無視されます。'}
                  </p>
                )}
                <label className="flex items-center justify-between gap-3 bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-700">
                  <span>おすすめ表示（ハイライト）</span>
                  <input
                    type="checkbox"
                    className="h-5 w-5 lg:h-4 lg:w-4 rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500"
                    checked={Boolean(plan.highlighted)}
                    onChange={(e) => onUpdateContent(`plans.${index}.highlighted`, e.target.checked)}
                  />
                </label>
              </div>
            ))}
          </div>
        )}

        {Array.isArray((content as any).faqs) && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-300">よくある質問</label>
              <button
                type="button"
                onClick={() => {
                  const faqs = Array.isArray((content as any).faqs) ? [...(content as any).faqs] : [];
                  faqs.push({ question: '', answer: '' });
                  onUpdateContent('faqs', faqs);
                }}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                + 追加
              </button>
            </div>
            {((content as any).faqs as Array<Record<string, any>>).map((faq, index) => (
              <div key={index} className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>FAQ {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const faqs = [...((content as any).faqs as Array<Record<string, any>>)].filter((_, idx) => idx !== index);
                      onUpdateContent('faqs', faqs);
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    削除
                  </button>
                </div>
                <input
                  type="text"
                  value={faq.question || ''}
                  onChange={(e) => onUpdateContent(`faqs.${index}.question`, e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="質問"
                />
                <textarea
                  value={faq.answer || ''}
                  onChange={(e) => onUpdateContent(`faqs.${index}.answer`, e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-blue-500 resize-none"
                  rows={3}
                  placeholder="回答"
                />
              </div>
            ))}
          </div>
        )}

        {Array.isArray((content as any).testimonials) && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-300">導入事例・お客様の声</label>
              <button
                type="button"
                onClick={() => {
                  const testimonials = Array.isArray((content as any).testimonials) ? [...(content as any).testimonials] : [];
                  testimonials.push({ name: '', quote: '', role: '', rating: 5 });
                  onUpdateContent('testimonials', testimonials);
                }}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                + 追加
              </button>
            </div>
            {((content as any).testimonials as Array<Record<string, any>>).map((testimonial, index) => (
              <div key={index} className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>事例 {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const testimonials = [...((content as any).testimonials as Array<Record<string, any>>)].filter((_, idx) => idx !== index);
                      onUpdateContent('testimonials', testimonials);
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    削除
                  </button>
                </div>
                <input
                  type="text"
                  value={testimonial.name || ''}
                  onChange={(e) => onUpdateContent(`testimonials.${index}.name`, e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="氏名 / 社名等"
                />
                <input
                  type="text"
                  value={testimonial.role || ''}
                  onChange={(e) => onUpdateContent(`testimonials.${index}.role`, e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="肩書き"
                />
                <textarea
                  value={testimonial.quote || ''}
                  onChange={(e) => onUpdateContent(`testimonials.${index}.quote`, e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-blue-500 resize-none"
                  rows={3}
                  placeholder="コメント"
                />
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={testimonial.rating ?? 5}
                  onChange={(e) => onUpdateContent(`testimonials.${index}.rating`, Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="評価 (1-5)"
                />
              </div>
            ))}
          </div>
        )}

        {Array.isArray((content as any).bonuses) && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-300">特典リスト</label>
              <button
                type="button"
                onClick={() => {
                  const bonuses = Array.isArray((content as any).bonuses) ? [...(content as any).bonuses] : [];
                  bonuses.push({ title: '', description: '', value: '', icon: '' });
                  onUpdateContent('bonuses', bonuses);
                }}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                + 追加
              </button>
            </div>
            {((content as any).bonuses as Array<Record<string, any>>).map((bonus, index) => (
              <div key={index} className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>特典 {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const bonuses = [...((content as any).bonuses as Array<Record<string, any>>)].filter((_, idx) => idx !== index);
                      onUpdateContent('bonuses', bonuses);
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    削除
                  </button>
                </div>
                <input
                  type="text"
                  value={bonus.title || ''}
                  onChange={(e) => onUpdateContent(`bonuses.${index}.title`, e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="特典タイトル"
                />
                <input
                  type="text"
                  value={bonus.value || ''}
                  onChange={(e) => onUpdateContent(`bonuses.${index}.value`, e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="金額・価値など"
                />
                <textarea
                  value={bonus.description || ''}
                  onChange={(e) => onUpdateContent(`bonuses.${index}.description`, e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-blue-500 resize-none"
                  rows={2}
                  placeholder="詳細説明"
                />
                <input
                  type="text"
                  value={bonus.icon || ''}
                  onChange={(e) => onUpdateContent(`bonuses.${index}.icon`, e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="アイコン / 絵文字"
                />
              </div>
            ))}
          </div>
        )}

        {problemItems && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">問題提起リスト</label>
            <div className="space-y-2">
              {problemItems.map((problem, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={problem}
                    onChange={(e) => {
                      const next = [...problemItems];
                      next[index] = e.target.value;
                      onUpdateContent('problems', next);
                    }}
                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-blue-500"
                    placeholder={`問題提起 ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (problemItems.length <= 1) {
                        onUpdateContent('problems', ['問題を入力']);
                        return;
                      }
                      const next = problemItems.filter((_, itemIndex) => itemIndex !== index);
                      onUpdateContent('problems', next);
                    }}
                    className="px-2 py-1 text-xs text-slate-600 hover:text-red-500"
                  >
                    削除
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const next = [...problemItems, '問題を入力'];
                  onUpdateContent('problems', next);
                }}
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <span>＋ 問題提起を追加</span>
              </button>
            </div>
          </div>
        )}

        {/* パディング */}
        {content.padding !== undefined && (
          <div>
            <label className="block text-sm lg:text-sm font-medium text-slate-700 mb-2">
              パディング
            </label>
            <input
              type="text"
              value={content.padding || ''}
              onChange={(e) => onUpdateContent('padding', e.target.value)}
              placeholder="例: 16px または 1rem"
              className="w-full px-3 lg:px-4 py-2.5 lg:py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-base lg:text-sm min-h-[44px] lg:min-h-auto"
            />
          </div>
        )}

        {('borderRadius' in content) && (
          <div>
            <label className="block text-sm lg:text-sm font-medium text-slate-700 mb-2">
              角丸
            </label>
            <input
              type="text"
              value={(content as any).borderRadius || ''}
              onChange={(e) => onUpdateContent('borderRadius', e.target.value)}
              placeholder="例: 20px"
              className="w-full px-3 lg:px-4 py-2.5 lg:py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-base lg:text-sm min-h-[44px] lg:min-h-auto"
            />
          </div>
        )}

        {('maxWidth' in content) && (
          <div>
            <label className="block text-sm lg:text-sm font-medium text-slate-700 mb-2">
              最大幅
            </label>
            <input
              type="text"
              value={(content as any).maxWidth || ''}
              onChange={(e) => onUpdateContent('maxWidth', e.target.value)}
              placeholder="例: 960px"
              className="w-full px-3 lg:px-4 py-2.5 lg:py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-base lg:text-sm min-h-[44px] lg:min-h-auto"
            />
          </div>
        )}

        {('shadow' in content) && (
          <label className="flex items-center justify-between gap-3 bg-white border border-slate-300 rounded-lg px-4 py-3">
            <div>
              <p className="text-sm text-slate-700">シャドウを表示</p>
              <p className="text-xs text-slate-500">画像の立体感を強調します</p>
            </div>
            <input
              type="checkbox"
              className="h-5 w-5 lg:h-4 lg:w-4 rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500"
              checked={Boolean((content as any).shadow)}
              onChange={(e) => onUpdateContent('shadow', e.target.checked)}
            />
          </label>
        )}

        {/* 配置（ヒーローブロック等） */}
        {('alignment' in content) && (
          <div>
            <label className="block text-sm lg:text-sm font-medium text-slate-700 mb-2">
              配置
            </label>
            <select
              value={(content as any).alignment || 'center'}
              onChange={(e) => onUpdateContent('alignment', e.target.value)}
              className="w-full px-3 lg:px-4 py-2.5 lg:py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 text-base lg:text-sm min-h-[44px] lg:min-h-auto"
            >
              <option value="left">左寄せ</option>
              <option value="center">中央</option>
              <option value="right">右寄せ</option>
            </select>
          </div>
        )}

        {/* カラム数（Features, Pricing等） */}
        {('columns' in content) && (
          <div>
            <label className="block text-sm lg:text-sm font-medium text-slate-700 mb-2">
              カラム数
            </label>
            <select
              value={(content as any).columns || 3}
              onChange={(e) => onUpdateContent('columns', parseInt(e.target.value))}
              className="w-full px-3 lg:px-4 py-2.5 lg:py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 text-base lg:text-sm min-h-[44px] lg:min-h-auto"
            >
              <option value="2">2カラム</option>
              <option value="3">3カラム</option>
              <option value="4">4カラム</option>
            </select>
          </div>
        )}

        {/* 画像アップロード */}
        {('imageUrl' in content || 'backgroundImageUrl' in content) && (() => {
          const imageField = 'backgroundImageUrl' in content ? 'backgroundImageUrl' : 'imageUrl';
          const currentImage = ((content as any)[imageField] as string) || '';
          const label = imageField === 'backgroundImageUrl' ? '背景画像' : '画像';

          const openMediaLibrary = () => {
            setActiveImageField(imageField);
            setShowMediaLibrary(true);
          };

          return (
            <div>
              <label className="block text-sm lg:text-sm font-medium text-slate-700 mb-2">
                {label}
              </label>
              {currentImage ? (
                <div className="space-y-2">
                  <div className="relative w-full h-32 bg-slate-100 rounded-lg overflow-hidden border border-slate-300">
                    <img
                      src={currentImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium text-center cursor-pointer">
                      <span className="inline-flex items-center justify-center gap-2">
                        {isUploading ? (
                          <>
                            <CloudArrowUpIcon className="h-4 w-4" aria-hidden="true" />
                            アップロード中...
                          </>
                        ) : (
                          <>
                            <ArrowPathIcon className="h-4 w-4" aria-hidden="true" />
                            変更
                          </>
                        )}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload(imageField)}
                        disabled={isUploading}
                        className="hidden"
                      />
                    </label>
                    <button
                      onClick={openMediaLibrary}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <PhotoIcon className="h-4 w-4" aria-hidden="true" />
                      ライブラリ
                    </button>
                    <button
                      onClick={() => onUpdateContent(imageField, '')}
                      className="col-span-2 inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      <TrashIcon className="h-4 w-4" aria-hidden="true" />
                      削除
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block w-full px-4 py-8 bg-white border-2 border-dashed border-slate-300 rounded-lg hover:border-slate-400 transition-colors cursor-pointer text-center">
                    <div className="mx-auto mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                      <PhotoIcon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <div className="text-slate-600 text-sm mb-1">
                      {isUploading ? 'アップロード中...' : 'クリックして画像をアップロード'}
                    </div>
                    <div className="text-slate-500 text-xs">
                      PNG, JPG, GIF (最大5MB)
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload(imageField)}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={openMediaLibrary}
                    className="flex w-full items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <PhotoIcon className="h-4 w-4" aria-hidden="true" />
                    メディアライブラリから選択
                  </button>
                </div>
              )}
            </div>
          );
        })()}

        {/* レイアウト（Testimonial, FAQ等） */}
        {('layout' in content) && (
          <div>
            <label className="block text-sm lg:text-sm font-medium text-slate-700 mb-2">
              レイアウト
            </label>
            {(() => {
              const rawLayout = (content as any).layout;
              const defaultLayout = block.blockType === 'top-flex-1' ? 'center' : 'card';
              const layoutValue = rawLayout || defaultLayout;

              return (
                <select
                  value={layoutValue}
                  onChange={(e) => onUpdateContent('layout', e.target.value)}
                  className="w-full px-3 lg:px-4 py-2.5 lg:py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 text-base lg:text-sm min-h-[44px] lg:min-h-auto"
                >
                  {block.blockType === 'top-flex-1' && (
                    <>
                      <option value="center">中央揃え</option>
                      <option value="left">左寄せ</option>
                    </>
                  )}
                  {block.blockType.includes('testimonial') && (
                    <>
                      <option value="card">カード</option>
                      <option value="slider">スライダー</option>
                      <option value="grid">グリッド</option>
                    </>
                  )}
                  {block.blockType.includes('faq') && (
                    <>
                      <option value="accordion">アコーディオン</option>
                      <option value="grid">グリッド</option>
                    </>
                  )}
                  {block.blockType.includes('gallery') && (
                    <>
                      <option value="grid">グリッド</option>
                      <option value="masonry">マソンリー</option>
                    </>
                  )}
                </select>
              );
            })()}
          </div>
        )}
      </div>

      {/* フッター */}
      <div className="p-3 lg:p-4 border-t border-slate-200 bg-slate-50 flex-shrink-0">
        <p className="flex items-center justify-center gap-2 text-slate-500 text-xs text-center">
          <InformationCircleIcon className="h-4 w-4" aria-hidden="true" />
          テキストをクリックすると直接編集できます
        </p>
      </div>

      {/* メディアライブラリモーダル */}
      <MediaLibraryModal
        isOpen={showMediaLibrary}
        onClose={() => {
          setShowMediaLibrary(false);
          setActiveImageField(null);
        }}
        onSelect={(url) => {
          if (activeImageField) {
            onUpdateContent(activeImageField, url);
          }
          setShowMediaLibrary(false);
          setActiveImageField(null);
        }}
      />
    </div>
  );
}
