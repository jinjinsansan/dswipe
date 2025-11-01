import Link from 'next/link';
import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { PricingBlockContent } from '@/types/templates';
import { getContrastColor, withAlpha } from '@/lib/color';

interface TopPricingBlockProps {
  content: PricingBlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: any) => void;
  productId?: string;
  onProductClick?: (productId?: string) => void;
  ctaIds?: string[];
  onCtaClick?: (ctaId?: string, variant?: string) => void;
}

export default function TopPricingBlock({ content, isEditing, onEdit, productId, onProductClick, ctaIds, onCtaClick }: TopPricingBlockProps) {
  const title = content?.title ?? 'プランと料金';
  const subtitle = content?.subtitle ?? 'ローンチの規模に合わせて選べる柔軟なプランをご用意しています。';
  const plans = useMemo(() => (
    Array.isArray(content?.plans) && content.plans.length > 0
      ? content.plans
      : [
          {
            name: 'スターター',
            price: '¥29,800',
            period: '/月',
            description: '個人〜小規模チーム向け。月4本までのローンチを高速化。',
            features: ['AIコピー生成', 'テンプレートライブラリ', '公開ホスティング', 'Stripe連携'],
            buttonText: '無料で始める',
          },
          {
            name: 'プロフェッショナル',
            price: '¥79,800',
            period: '/月',
            description: '本格的なローンチ運用に。チームコラボと分析機能を強化。',
            features: ['スタータープランの全機能', 'チーム編集・コメント', 'アクセス分析ダッシュボード', '優先サポート'],
            buttonText: '7日間トライアル',
            highlighted: true,
          },
        ]
  ), [content?.plans]);

  const columnLayoutClass = useMemo(() => {
    const count = plans.length;
    if (count <= 1) {
      return 'grid-cols-1 place-items-center max-w-3xl mx-auto';
    }
    if (count === 2) {
      return 'grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto';
    }
    if (count === 3) {
      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto';
    }
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  }, [plans.length]);

  const singlePlan = plans.length === 1;

  const backgroundColor = content?.backgroundColor ?? '#F8FAFC';
  const textColor = content?.textColor ?? '#0F172A';
  const accentColor = content?.accentColor ?? '#2563EB';
  const buttonColor = content?.buttonColor ?? accentColor;

  const updatePlanField = (index: number, field: keyof (typeof plans)[number]) =>
    (event: React.FocusEvent<HTMLDivElement>) => {
      const next = [...plans];
      next[index] = {
        ...next[index],
        [field]: event.currentTarget.textContent ?? '',
      };
      onEdit?.('plans', next);
    };

  const toggleHighlight = (index: number) => {
    const next = plans.map((plan, i) => ({ ...plan, highlighted: i === index }));
    onEdit?.('plans', next);
  };

  return (
    <section className="relative w-full py-16 sm:py-20" style={{ backgroundColor, color: textColor }}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6">
        {isEditing ? (
          <div className="grid gap-3 rounded-xl bg-white p-4 text-sm text-slate-700 shadow-sm">
            <input
              className="w-full rounded-md border border-slate-200 px-3 py-2"
              value={title}
              onChange={(e) => onEdit?.('title', e.target.value)}
              placeholder="タイトル"
            />
            <textarea
              className="min-h-[80px] w-full rounded-md border border-slate-200 px-3 py-2"
              value={subtitle}
              onChange={(e) => onEdit?.('subtitle', e.target.value)}
              placeholder="サブタイトル"
            />
          </div>
        ) : null}

        <div className="text-center">
          <h2 className="text-3xl font-bold sm:text-4xl" style={{ color: textColor }}>
            {title}
          </h2>
          <p
            className="mt-3 text-base sm:text-lg"
            style={{ color: withAlpha(textColor, 0.7, textColor) }}
          >
            {subtitle}
          </p>
        </div>

        <div className={`grid gap-6 ${columnLayoutClass}`}>
          {plans.map((plan, index) => {
            const isHighlighted = plan.highlighted ?? false;
            const cardStyle: CSSProperties = {
              borderColor: isHighlighted ? accentColor : withAlpha(textColor, 0.12, textColor),
              backgroundColor: isHighlighted ? withAlpha(accentColor, 0.08, '#FFFFFF') : '#FFFFFF',
              color: textColor,
              boxShadow: isHighlighted
                ? `0 24px 50px -28px ${withAlpha(accentColor, 0.45, accentColor)}`
                : undefined,
            };

            const buttonStyle: CSSProperties = isHighlighted
              ? {
                  backgroundColor: buttonColor,
                  color: getContrastColor(buttonColor),
                  border: `1px solid ${buttonColor}`,
                }
              : {
                  backgroundColor: withAlpha(buttonColor, 0.12, buttonColor),
                  color: buttonColor,
                  border: `1px solid ${withAlpha(buttonColor, 0.35, buttonColor)}`,
                };

            const mappedCtaId = ctaIds?.[index];

            const isSingle = singlePlan;
            return (
              <div
                key={index}
                className={`flex h-full flex-col rounded-2xl border transition ${isSingle ? 'w-full p-8 sm:p-10 gap-6 shadow-xl border-2' : 'p-6 gap-5'}`}
                style={cardStyle}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`font-medium uppercase tracking-wide ${isSingle ? 'text-base' : 'text-sm'}`}
                    style={{ color: accentColor }}
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    onBlur={updatePlanField(index, 'name')}
                  >
                    {plan.name}
                  </div>
                  {isEditing ? (
                    <button
                      type="button"
                      onClick={() => toggleHighlight(index)}
                      className="rounded-full border px-3 py-1 text-xs font-semibold"
                      style={{
                        borderColor: isHighlighted ? accentColor : withAlpha(textColor, 0.25, textColor),
                        color: isHighlighted ? accentColor : withAlpha(textColor, 0.6, textColor),
                      }}
                    >
                      注目
                    </button>
                  ) : null}
                </div>

                <div className="flex items-baseline gap-2">
                  <span
                    className={`${isSingle ? 'text-4xl sm:text-5xl' : 'text-3xl'} font-bold`}
                    style={{ color: textColor }}
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    onBlur={updatePlanField(index, 'price')}
                  >
                    {plan.price}
                  </span>
                  <span
                    className="text-sm"
                    style={{ color: withAlpha(textColor, 0.6, textColor) }}
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    onBlur={updatePlanField(index, 'period')}
                  >
                    {plan.period ?? ''}
                  </span>
                </div>

                <p
                  className={`${isSingle ? 'text-base leading-relaxed' : 'text-sm'}`}
                  style={{ color: withAlpha(textColor, 0.7, textColor) }}
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={updatePlanField(index, 'description')}
                >
                  {plan.description ?? ''}
                </p>

                <ul className={`flex flex-1 flex-col ${isSingle ? 'gap-3 text-base' : 'gap-2 text-sm'}`} style={{ color: withAlpha(textColor, 0.75, textColor) }}>
                  {(plan.features ?? []).map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <span
                        className={`${isSingle ? 'mt-1.5 h-2 w-2' : 'mt-1 h-1.5 w-1.5'} inline-block flex-shrink-0 rounded-full`}
                        style={{ backgroundColor: accentColor }}
                      />
                      <div
                        className="flex-1"
                        contentEditable={isEditing}
                        suppressContentEditableWarning
                        onBlur={(event) => {
                          const next = [...plans];
                          const currentFeatures = [...(plan.features ?? [])];
                          currentFeatures[featureIndex] = event.currentTarget.textContent ?? '';
                          next[index] = { ...next[index], features: currentFeatures };
                          onEdit?.('plans', next);
                        }}
                      >
                        {feature}
                      </div>
                    </li>
                  ))}
                </ul>

                {onProductClick && productId ? (
                  <button
                    className={`w-full rounded-lg font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${isSingle ? 'py-3 text-base' : 'py-2 text-sm'}`}
                    type="button"
                    style={{
                      ...buttonStyle,
                      outlineColor: withAlpha(accentColor, 0.45, accentColor),
                    }}
                    onClick={() => {
                      onCtaClick?.(mappedCtaId, `plan-${index}`);
                      onProductClick(productId);
                    }}
                  >
                    <span
                      contentEditable={isEditing}
                      suppressContentEditableWarning
                      onBlur={(event) => {
                        const next = [...plans];
                        next[index] = { ...next[index], buttonText: event.currentTarget.textContent ?? '' };
                        onEdit?.('plans', next);
                      }}
                    >
                      {plan.buttonText}
                    </span>
                  </button>
                ) : plan.buttonUrl ? (
                  <Link
                    href={plan.buttonUrl}
                    onClick={() => onCtaClick?.(mappedCtaId, `plan-${index}`)}
                    className={`w-full rounded-lg font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 text-center ${isSingle ? 'py-3 text-base' : 'py-2 text-sm'}`}
                    style={{
                      ...buttonStyle,
                      outlineColor: withAlpha(accentColor, 0.45, accentColor),
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span
                      contentEditable={isEditing}
                      suppressContentEditableWarning
                      onBlur={(event) => {
                        const next = [...plans];
                        next[index] = { ...next[index], buttonText: event.currentTarget.textContent ?? '' };
                        onEdit?.('plans', next);
                      }}
                    >
                      {plan.buttonText}
                    </span>
                  </Link>
                ) : (
                  <button
                    className={`w-full rounded-lg font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${isSingle ? 'py-3 text-base' : 'py-2 text-sm'}`}
                    type="button"
                    style={{
                      ...buttonStyle,
                      outlineColor: withAlpha(accentColor, 0.45, accentColor),
                    }}
                    onClick={() => onCtaClick?.(mappedCtaId, `plan-${index}`)}
                  >
                    <span
                      contentEditable={isEditing}
                      suppressContentEditableWarning
                      onBlur={(event) => {
                        const next = [...plans];
                        next[index] = { ...next[index], buttonText: event.currentTarget.textContent ?? '' };
                        onEdit?.('plans', next);
                      }}
                    >
                      {plan.buttonText}
                    </span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
