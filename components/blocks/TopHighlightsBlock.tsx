import { useMemo } from 'react';
import { FeaturesBlockContent } from '@/types/templates';
import { withAlpha } from '@/lib/color';
import {
  AcademicCapIcon,
  ArrowTrendingUpIcon,
  BoltIcon,
  BookOpenIcon,
  ChartBarIcon,
  ClockIcon,
  CreditCardIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  LightBulbIcon,
  MagnifyingGlassIcon,
  PaintBrushIcon,
  PuzzlePieceIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import type { ComponentType, SVGProps } from 'react';

interface TopHighlightsBlockProps {
  content: FeaturesBlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: any) => void;
}

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const ICON_MAP: Record<string, IconComponent> = {
  rocket: RocketLaunchIcon,
  launch: RocketLaunchIcon,
  speed: RocketLaunchIcon,
  '🚀': RocketLaunchIcon,
  design: PaintBrushIcon,
  creative: PaintBrushIcon,
  branding: PaintBrushIcon,
  '🎨': PaintBrushIcon,
  global: GlobeAltIcon,
  world: GlobeAltIcon,
  network: GlobeAltIcon,
  '🌐': GlobeAltIcon,
  payment: CreditCardIcon,
  billing: CreditCardIcon,
  checkout: CreditCardIcon,
  '💳': CreditCardIcon,
  secure: ShieldCheckIcon,
  shield: ShieldCheckIcon,
  protection: ShieldCheckIcon,
  analytics: ChartBarIcon,
  data: ChartBarIcon,
  '📊': ChartBarIcon,
  growth: ArrowTrendingUpIcon,
  scale: ArrowTrendingUpIcon,
  '📈': ArrowTrendingUpIcon,
  navigation: ArrowTrendingUpIcon,
  '🧭': ArrowTrendingUpIcon,
  partnership: UserGroupIcon,
  team: UserGroupIcon,
  '🤝': UserGroupIcon,
  insight: LightBulbIcon,
  innovation: LightBulbIcon,
  '🧠': LightBulbIcon,
  momentum: BoltIcon,
  leverage: BoltIcon,
  '🪜': BoltIcon,
  discovery: MagnifyingGlassIcon,
  search: MagnifyingGlassIcon,
  '🔍': MagnifyingGlassIcon,
  time: ClockIcon,
  schedule: ClockIcon,
  '🕒': ClockIcon,
  documentation: DocumentTextIcon,
  workflow: DocumentTextIcon,
  compliance: DocumentTextIcon,
  '🧾': DocumentTextIcon,
  puzzle: PuzzlePieceIcon,
  flexibility: PuzzlePieceIcon,
  modular: PuzzlePieceIcon,
  '🧩': PuzzlePieceIcon,
  knowledge: BookOpenIcon,
  library: BookOpenIcon,
  '📚': BookOpenIcon,
  wellness: SparklesIcon,
  balance: SparklesIcon,
  '🧘‍♀️': SparklesIcon,
  nature: SparklesIcon,
  sustainable: SparklesIcon,
  leaf: SparklesIcon,
  '🌿': SparklesIcon,
};

const resolveIcon = (value?: string): IconComponent | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  const lower = trimmed.toLowerCase();
  return ICON_MAP[lower] ?? ICON_MAP[trimmed];
};

const getFallbackLabel = (value?: string) => {
  if (!value) return '★';
  const text = value.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim();
  const fallbackSource = text.length > 0 ? text : value;
  return fallbackSource.slice(0, 2).toUpperCase() || '★';
};

export default function TopHighlightsBlock({ content, isEditing, onEdit }: TopHighlightsBlockProps) {
  const title = content?.title ?? 'こんな課題、ありませんか？';
  const tagline = content?.tagline ?? 'Pain Points';
  const accentColor = content?.accentColor ?? '#2563EB';
  const backgroundColor = content?.backgroundColor ?? '#F1F5F9';
  const textColor = content?.textColor ?? '#0F172A';
  const features = useMemo(() => (
    Array.isArray(content?.features) && content.features.length > 0
      ? content.features
      : [
          {
            icon: 'rocket',
            title: 'デザイン設計に時間を奪われる',
            description: 'ゼロから構成やビジュアルを整えるのは非効率で差別化も難しい。',
          },
          {
            icon: 'global',
            title: 'ドメイン・サーバー整備が面倒',
            description: '取得・SSL対応まで段取りに追われ、初動が遅れる。',
          },
          {
            icon: 'payment',
            title: '決済機能の実装ハードル',
            description: '安全な決済フローの準備には高い技術とセキュリティ知識が必要。',
          },
        ]
  ), [content?.features]);

  const updateFeature = (index: number, value: Record<string, string>) => {
    const next = [...features];
    next[index] = { ...next[index], ...value };
    onEdit?.('features', next);
  };

  const handleFeatureBlur = (index: number, field: 'title' | 'description') => (e: React.FocusEvent<HTMLDivElement>) => {
    updateFeature(index, { [field]: e.currentTarget.textContent ?? '' });
  };

  const handleIconChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFeature(index, { icon: e.target.value });
  };

  return (
    <section
      className="relative flex w-full py-section-sm sm:py-section"
      style={{
        backgroundColor,
        color: textColor,
        minHeight: '100%',
      }}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 sm:px-6">
        {isEditing ? (
          <div className="grid gap-3 rounded-xl bg-white/70 p-4 text-sm text-slate-700">
            <input
              className="w-full rounded-md border border-slate-200 px-3 py-2"
              value={tagline}
              onChange={(e) => onEdit?.('tagline', e.target.value)}
              placeholder="タグライン"
            />
            <input
              className="w-full rounded-md border border-slate-200 px-3 py-2"
              value={title}
              onChange={(e) => onEdit?.('title', e.target.value)}
              placeholder="タイトル"
            />
          </div>
        ) : null}

        <div className="responsive-stack items-center text-center">
          <p
            className="font-semibold typo-eyebrow"
            style={{ color: accentColor }}
          >
            {tagline}
          </p>
          <h2 className="typo-headline text-pretty font-bold" style={{ color: content?.textColor ?? '#0F172A' }}>
            {title}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const IconComponent = resolveIcon(feature.icon);
            return (
              <div
                key={index}
                className="flex h-full flex-row flex-wrap items-start gap-4 rounded-card border p-4 shadow-sm sm:flex-col sm:flex-nowrap sm:items-center sm:text-center sm:p-5 sm:gap-3 md:p-6 md:gap-4"
                style={{
                  borderColor: withAlpha(accentColor, 0.2, accentColor),
                  backgroundColor: withAlpha(accentColor, 0.06, '#FFFFFF'),
                  color: content?.textColor ?? '#0F172A',
                }}
              >
                <div
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/80 shadow-sm sm:h-14 sm:w-14"
                  style={{ color: accentColor }}
                >
                  {IconComponent ? (
                    <IconComponent className="h-6 w-6 sm:h-7 sm:w-7" />
                  ) : (
                    <span className="font-semibold typo-body text-pretty sm:text-base">
                      {getFallbackLabel(feature.icon)}
                    </span>
                  )}
                </div>

                <div className="flex-1 sm:flex-none sm:w-full">
                  <h3
                    className="font-semibold typo-subheadline text-pretty"
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    onBlur={handleFeatureBlur(index, 'title')}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className="mt-1 typo-body text-pretty"
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    onBlur={handleFeatureBlur(index, 'description')}
                    style={{ color: content?.textColor ? `${content.textColor}B3` : withAlpha('#0F172A', 0.75, '#0F172A') }}
                  >
                    {feature.description}
                  </p>
                </div>

                {isEditing ? (
                  <div className="basis-full">
                    <div className="hidden w-full sm:block">
                      <input
                        className="mt-4 w-full rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 focus:border-blue-500 focus:outline-none"
                        value={feature.icon ?? ''}
                        onChange={handleIconChange(index)}
                        placeholder="icon"
                      />
                    </div>
                    <div className="mt-3 w-full sm:hidden">
                      <input
                        className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 focus:border-blue-500 focus:outline-none"
                        value={feature.icon ?? ''}
                        onChange={handleIconChange(index)}
                        placeholder="icon"
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
