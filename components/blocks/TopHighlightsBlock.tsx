import { useMemo } from 'react';
import { FeaturesBlockContent } from '@/types/templates';
import { withAlpha } from '@/lib/color';
import { GRAD_BRAND } from '@/lib/momentum';
import { getBackgroundOverlayStyle, getBlockBackgroundStyle, shouldRenderBackgroundOverlay } from '@/lib/blockBackground';
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
  const accentColor = content?.accentColor ?? '#0284C7';
  const backgroundColor = content?.backgroundColor ?? '#F1F5F9';
  const textColor = content?.textColor ?? '#0B1F3A';
  const backgroundStyle = getBlockBackgroundStyle(content, backgroundColor);
  const showOverlay = shouldRenderBackgroundOverlay(content);
  const overlayStyle = showOverlay ? getBackgroundOverlayStyle(content) : undefined;
  const isListLayout = content?.layout === 'list';
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
        ]
  ), [content?.features]);

  const gridColumnsClass = useMemo(() => {
    if (isListLayout) {
      return 'grid-cols-1';
    }

    const count = features.length;

    if (count <= 1) {
      return 'grid-cols-1 max-w-2xl mx-auto';
    }

    if (count === 2) {
      return 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto';
    }

    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  }, [features.length, isListLayout]);

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
        ...backgroundStyle,
        color: textColor,
        minHeight: '100%',
      }}
    >
      {showOverlay ? (
        <div className="pointer-events-none absolute inset-0" style={overlayStyle} />
      ) : null}
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 sm:px-6">
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

        {/* mock: editor.css .sc-benefit — アイブロー＋800見出し＋グラデアイコンタイルのカード */}
        <div className="responsive-stack items-center text-center">
          <p
            className="font-bold uppercase typo-eyebrow"
            style={{ color: accentColor, letterSpacing: '0.14em' }}
          >
            {tagline}
          </p>
          <h2
            className="typo-headline text-pretty font-extrabold"
            style={{ color: textColor, letterSpacing: '-0.02em', lineHeight: 1.3 }}
          >
            {title}
          </h2>
        </div>
        <div className={`grid gap-4 ${gridColumnsClass}`}>
          {features.map((feature, index) => {
            const IconComponent = resolveIcon(feature.icon);
            return (
              <div
                key={index}
                className="flex h-full flex-row flex-wrap items-start gap-4 rounded-[12px] p-4 sm:flex-col sm:flex-nowrap sm:items-center sm:text-center sm:p-5 sm:gap-3 md:p-6 md:gap-4"
                style={{
                  border: `1px solid ${withAlpha(textColor, 0.12, textColor)}`,
                  backgroundColor: withAlpha(textColor, 0.08, '#FFFFFF'),
                  color: textColor,
                }}
              >
                <div
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[10px] shadow-[0_10px_26px_-8px_rgba(6,182,212,.45)] sm:h-12 sm:w-12"
                  style={{ background: GRAD_BRAND, color: '#FFFFFF' }}
                >
                  {IconComponent ? (
                    <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" />
                  ) : (
                    <span className="font-semibold typo-body text-pretty sm:text-base">
                      {getFallbackLabel(feature.icon)}
                    </span>
                  )}
                </div>

                <div className="flex-1 sm:flex-none sm:w-full">
                  <h3
                    className="font-bold typo-subheadline text-pretty"
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
                    style={{ color: withAlpha(textColor, 0.82, textColor), lineHeight: 1.6 }}
                  >
                    {feature.description}
                  </p>
                </div>

                {isEditing ? (
                  <div className="basis-full">
                    <div className="hidden w-full sm:block">
                      <input
                        className="mt-4 w-full rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 focus:border-sky-500 focus:outline-none"
                        value={feature.icon ?? ''}
                        onChange={handleIconChange(index)}
                        placeholder="icon"
                      />
                    </div>
                    <div className="mt-3 w-full sm:hidden">
                      <input
                        className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 focus:border-sky-500 focus:outline-none"
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
