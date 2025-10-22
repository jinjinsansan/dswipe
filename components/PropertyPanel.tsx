'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowPathIcon,
  BoltIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  CloudArrowUpIcon,
  ExclamationTriangleIcon,
  GiftIcon,
  InboxStackIcon,
  InformationCircleIcon,
  MegaphoneIcon,
  PaintBrushIcon,
  PhotoIcon,
  ShieldCheckIcon,
  SparklesIcon,
  Square2StackIcon,
  TagIcon,
  TrashIcon,
  UsersIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/outline';
import { HexColorPicker } from 'react-colorful';
import { BlockContent } from '@/types/templates';
import { mediaApi } from '@/lib/api';
import { COLOR_THEMES, ColorThemeKey } from '@/lib/templates';
import { DEFAULT_FONT_KEY, FONT_OPTIONS } from '@/lib/fonts';
import MediaLibraryModal from './MediaLibraryModal';

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

export default function PropertyPanel({ block, onUpdateContent, onClose, onGenerateAI }: PropertyPanelProps) {
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
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

  // 色フィールドと表示名のマッピング
  const colorFields = {
    backgroundColor: { label: '背景色', defaultColor: '#FFFFFF' },
    textColor: { label: 'テキスト色', defaultColor: '#000000' },
    buttonColor: { label: 'ボタン色', defaultColor: '#3B82F6' },
    accentColor: { label: 'アクセントカラー', defaultColor: '#ffffff' },
    titleColor: { label: '見出し色', defaultColor: '#111827' },
    descriptionColor: { label: '説明テキスト色', defaultColor: '#666666' },
    iconColor: { label: 'アイコン色', defaultColor: '#3B82F6' },
  } as const;

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const response = await mediaApi.upload(file);
      const imageUrl = response.data.url;
      onUpdateContent('imageUrl', imageUrl);
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
  const supportsThemeSelection = ['hero-aurora', 'features-aurora', 'sticky-cta-1', 'cta-1', 'cta-2', 'cta-3'].includes(block.blockType);
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
    'caption',
    'urgencyText',
    'stats',
    'testimonials',
    'plans',
  ];
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
        {/* テキストコンテンツ */}
        {('tagline' in content) && (
          <div>
            <label className="block text-sm lg:text-sm font-medium text-slate-700 mb-2">
              タグライン
            </label>
            <input
              type="text"
              value={(content as any).tagline || ''}
              onChange={(e) => onUpdateContent('tagline', e.target.value)}
              className="w-full px-3 lg:px-4 py-2.5 lg:py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-base lg:text-sm min-h-[44px] lg:min-h-auto"
              placeholder="タグラインを入力"
            />
          </div>
        )}

        {('title' in content) && (
          <div>
            <label className="block text-sm lg:text-sm font-medium text-slate-700 mb-2">
              タイトル
            </label>
            <input
              type="text"
              value={(content as any).title || ''}
              onChange={(e) => onUpdateContent('title', e.target.value)}
              className="w-full px-3 lg:px-4 py-2.5 lg:py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-base lg:text-sm min-h-[44px] lg:min-h-auto"
              placeholder="タイトルを入力"
            />
          </div>
        )}

        {('subtitle' in content) && (
          <div>
            <label className="block text-sm lg:text-sm font-medium text-slate-700 mb-2">
              サブタイトル
            </label>
            <input
              type="text"
              value={(content as any).subtitle || ''}
              onChange={(e) => onUpdateContent('subtitle', e.target.value)}
              className="w-full px-3 lg:px-4 py-2.5 lg:py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-base lg:text-sm min-h-[44px] lg:min-h-auto"
              placeholder="サブタイトルを入力"
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
          <div>
            <label className="block text-sm lg:text-sm font-medium text-slate-700 mb-2">
              ハイライトテキスト
            </label>
            <input
              type="text"
              value={(content as any).highlightText || ''}
              onChange={(e) => onUpdateContent('highlightText', e.target.value)}
              className="w-full px-3 lg:px-4 py-2.5 lg:py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-base lg:text-sm min-h-[44px] lg:min-h-auto"
              placeholder="ハイライトテキストを入力"
            />
          </div>
        )}

        {('buttonText' in content) && (
          <div>
            <label className="block text-sm lg:text-sm font-medium text-slate-700 mb-2">
              ボタンテキスト
            </label>
            <input
              type="text"
              value={(content as any).buttonText || ''}
              onChange={(e) => onUpdateContent('buttonText', e.target.value)}
              className="w-full px-3 lg:px-4 py-2.5 lg:py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-base lg:text-sm min-h-[44px] lg:min-h-auto"
              placeholder="ボタンテキストを入力"
            />
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
          <div>
            <label className="block text-sm lg:text-sm font-medium text-slate-700 mb-2">
              ボタンURL
            </label>
            <input
              type="text"
              value={(content as any).buttonUrl || ''}
              onChange={(e) => onUpdateContent('buttonUrl', e.target.value)}
              className="w-full px-3 lg:px-4 py-2.5 lg:py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-base lg:text-sm min-h-[44px] lg:min-h-auto"
              placeholder="https://..."
            />
          </div>
        )}

        {('secondaryButtonText' in content) && (
          <div>
            <label className="block text-sm lg:text-sm font-medium text-slate-700 mb-2">
              セカンダリーボタン
            </label>
            <input
              type="text"
              value={(content as any).secondaryButtonText || ''}
              onChange={(e) => onUpdateContent('secondaryButtonText', e.target.value)}
              className="w-full px-3 lg:px-4 py-2.5 lg:py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 mb-2 text-base lg:text-sm min-h-[44px] lg:min-h-auto"
              placeholder="セカンダリーボタンの文言"
            />
            <input
              type="text"
              value={(content as any).secondaryButtonUrl || ''}
              onChange={(e) => onUpdateContent('secondaryButtonUrl', e.target.value)}
              className="w-full px-3 lg:px-4 py-2.5 lg:py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-base lg:text-sm min-h-[44px] lg:min-h-auto"
              placeholder="セカンダリーボタンのURL"
            />
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
                <textarea
                  value={Array.isArray(plan.features) ? plan.features.join('\n') : ''}
                  onChange={(e) => onUpdateContent(`plans.${index}.features`, e.target.value.split('\n').filter(Boolean))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-blue-500 resize-none"
                  rows={3}
                  placeholder="機能リスト（1行につき1項目）"
                />
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
                    onChange={(e) => onUpdateContent(`plans.${index}.buttonUrl`, e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-blue-500"
                    placeholder="ボタンURL"
                  />
                </div>
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
                  testimonials.push({ name: '', text: '', role: '', rating: 5, company: '' });
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
                  value={testimonial.text || ''}
                  onChange={(e) => onUpdateContent(`testimonials.${index}.text`, e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-blue-500 resize-none"
                  rows={3}
                  placeholder="コメント"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={testimonial.company || ''}
                    onChange={(e) => onUpdateContent(`testimonials.${index}.company`, e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-blue-500"
                    placeholder="会社名等（任意）"
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
                <input
                  type="text"
                  value={testimonial.imageUrl || ''}
                  onChange={(e) => onUpdateContent(`testimonials.${index}.imageUrl`, e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="画像URL (任意)"
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

        {Array.isArray((content as any).problems) && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">問題提起リスト</label>
            <textarea
              value={Array.isArray((content as any).problems) ? (content as any).problems.join('\n') : ''}
              onChange={(e) => onUpdateContent('problems', e.target.value.split('\n').filter(Boolean))}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-blue-500 resize-none"
              rows={6}
              placeholder="問題提起を1行につき1つ入力"
            />
          </div>
        )}

        {/* 色フィールドセクション */}
        <div className="border-t border-slate-200 pt-3 mt-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase mb-3">色設定</h4>
          
          {/* 背景色 */}
          {content.backgroundColor !== undefined && renderColorPicker('backgroundColor', content.backgroundColor)}
          
          {/* テキスト色 */}
          {content.textColor !== undefined && renderColorPicker('textColor', content.textColor)}
          
          {/* ボタン色 */}
          {('buttonColor' in content) && renderColorPicker('buttonColor', (content as any).buttonColor)}
          
          {/* アクセントカラー */}
          {('accentColor' in content) && renderColorPicker('accentColor', (content as any).accentColor)}
          
          {/* 見出し色 */}
          {('titleColor' in content) && renderColorPicker('titleColor', (content as any).titleColor)}
          
          {/* 説明テキスト色 */}
          {('descriptionColor' in content) && renderColorPicker('descriptionColor', (content as any).descriptionColor)}
          
          {/* アイコン色 */}
          {('iconColor' in content) && renderColorPicker('iconColor', (content as any).iconColor)}
        </div>

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

        {/* ヒーローブロック設定 */}
        {(block.blockType === 'hero' || block.blockType === 'hero-1' || block.blockType === 'hero-2' || block.blockType === 'hero-3') && (
          <div className="space-y-4 pb-4 border-b border-slate-200">
            <div>
              <SectionHeader icon={PhotoIcon} label="ヒーロー設定" />
              <div className="space-y-4">
                {renderColorPicker('backgroundColor', (content as any).backgroundColor)}
                {renderColorPicker('textColor', (content as any).textColor)}
                {renderColorPicker('buttonColor', (content as any).buttonColor)}
              </div>
            </div>
          </div>
        )}

        {/* テキスト+画像ブロック設定 */}
        {(block.blockType.includes('text-image') || block.blockType.includes('text-img')) && (
          <div className="space-y-4 pb-4 border-b border-slate-200">
            <div>
              <SectionHeader icon={Square2StackIcon} label="テキスト+画像設定" />
              <div className="space-y-4">
                {renderColorPicker('backgroundColor', (content as any).backgroundColor)}
                {renderColorPicker('textColor', (content as any).textColor)}
              </div>
            </div>
          </div>
        )}

        {/* CTAブロック設定 */}
        {block.blockType.includes('cta') && (
          <div className="space-y-4 pb-4 border-b border-slate-200">
            <div>
              <SectionHeader icon={SparklesIcon} label="CTA設定" />
              <div className="space-y-4">
                {renderColorPicker('backgroundColor', (content as any).backgroundColor)}
                {renderColorPicker('textColor', (content as any).textColor)}
                {renderColorPicker('buttonColor', (content as any).buttonColor)}
              </div>
            </div>
          </div>
        )}

        {/* 価格表ブロック設定 */}
        {block.blockType.includes('pricing') && (
          <div className="space-y-4 pb-4 border-b border-slate-200">
            <div>
              <SectionHeader icon={TagIcon} label="価格表設定" />
              <div className="space-y-4">
                {renderColorPicker('backgroundColor', (content as any).backgroundColor)}
                {renderColorPicker('textColor', (content as any).textColor)}
                {renderColorPicker('buttonColor', (content as any).buttonColor)}
              </div>
            </div>
          </div>
        )}

        {/* 特徴ブロック設定 */}
        {block.blockType.includes('features') && !block.blockType.includes('aurora') && (
          <div className="space-y-4 pb-4 border-b border-slate-200">
            <div>
              <SectionHeader icon={BoltIcon} label="特徴設定" />
              <div className="space-y-4">
                {renderColorPicker('backgroundColor', (content as any).backgroundColor)}
                {renderColorPicker('textColor', (content as any).textColor)}
              </div>
            </div>
          </div>
        )}

        {/* FAQブロック設定 */}
        {block.blockType.includes('faq') && (
          <div className="space-y-4 pb-4 border-b border-slate-200">
            <div>
              <SectionHeader icon={InformationCircleIcon} label="FAQ設定" />
              <div className="space-y-4">
                {renderColorPicker('backgroundColor', (content as any).backgroundColor)}
                {renderColorPicker('textColor', (content as any).textColor)}
              </div>
            </div>
          </div>
        )}

        {/* お客様の声ブロック設定 */}
        {block.blockType.includes('testimonial') && (
          <div className="space-y-4 pb-4 border-b border-slate-200">
            <div>
              <SectionHeader icon={UsersIcon} label="お客様の声設定" />
              <div className="space-y-4">
                {renderColorPicker('backgroundColor', (content as any).backgroundColor)}
                {renderColorPicker('textColor', (content as any).textColor)}
                {renderColorPicker('accentColor', (content as any).accentColor)}
              </div>
            </div>
          </div>
        )}

        {/* フォームブロック設定 */}
        {block.blockType.includes('form') && (
          <div className="space-y-4 pb-4 border-b border-slate-200">
            <div>
              <SectionHeader icon={ClipboardDocumentCheckIcon} label="フォーム設定" />
              <div className="space-y-4">
                {renderColorPicker('backgroundColor', (content as any).backgroundColor)}
                {renderColorPicker('textColor', (content as any).textColor)}
                {renderColorPicker('buttonColor', (content as any).buttonColor)}
              </div>
            </div>
          </div>
        )}

        {/* 情報商材特化ブロック設定 */}
        {(block.blockType.includes('countdown') || block.blockType.includes('urgency') || 
          block.blockType.includes('scarcity') || block.blockType.includes('sticky-cta')) && (
          <div className="space-y-4 pb-4 border-b border-slate-200">
            <div>
              <SectionHeader icon={BoltIcon} label="特殊ブロック設定" />
              <div className="space-y-4">
                {renderColorPicker('backgroundColor', (content as any).backgroundColor)}
                {renderColorPicker('textColor', (content as any).textColor)}
                {renderColorPicker('buttonColor', (content as any).buttonColor)}
              </div>
            </div>
          </div>
        )}

        {/* 情報商材その他ブロック設定 */}
        {(block.blockType.includes('special-price') || block.blockType.includes('bonus-list') || 
          block.blockType.includes('guarantee') || block.blockType.includes('problem') || 
          block.blockType.includes('before-after') || block.blockType.includes('author-profile')) && (
          <div className="space-y-4 pb-4 border-b border-slate-200">
            <div>
              <SectionHeader icon={GiftIcon} label="コンテンツブロック設定" />
              <div className="space-y-4">
                {renderColorPicker('backgroundColor', (content as any).backgroundColor)}
                {renderColorPicker('textColor', (content as any).textColor)}
                {renderColorPicker('accentColor', (content as any).accentColor)}
              </div>
            </div>
          </div>
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
        {('imageUrl' in content) && (
          <div>
            <label className="block text-sm lg:text-sm font-medium text-slate-700 mb-2">
              画像
            </label>
            {(content as any).imageUrl ? (
              <div className="space-y-2">
                <div className="relative w-full h-32 bg-slate-100 rounded-lg overflow-hidden border border-slate-300">
                  <img 
                    src={(content as any).imageUrl} 
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
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={() => setShowMediaLibrary(true)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <PhotoIcon className="h-4 w-4" aria-hidden="true" />
                    ライブラリ
                  </button>
                  <button
                    onClick={() => onUpdateContent('imageUrl', '')}
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
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={() => setShowMediaLibrary(true)}
                  className="flex w-full items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <PhotoIcon className="h-4 w-4" aria-hidden="true" />
                  メディアライブラリから選択
                </button>
              </div>
            )}
          </div>
        )}

        {/* レイアウト（Testimonial, FAQ等） */}
        {('layout' in content) && (
          <div>
            <label className="block text-sm lg:text-sm font-medium text-slate-700 mb-2">
              レイアウト
            </label>
            <select
              value={(content as any).layout || 'card'}
              onChange={(e) => onUpdateContent('layout', e.target.value)}
              className="w-full px-3 lg:px-4 py-2.5 lg:py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 text-base lg:text-sm min-h-[44px] lg:min-h-auto"
            >
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
        onClose={() => setShowMediaLibrary(false)}
        onSelect={(url) => onUpdateContent('imageUrl', url)}
      />
    </div>
  );
}
