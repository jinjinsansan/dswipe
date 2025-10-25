import { PricingBlockContent } from '@/types/templates';

interface TopPricingBlockProps {
  content: PricingBlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: any) => void;
}

export default function TopPricingBlock({ content, isEditing, onEdit }: TopPricingBlockProps) {
  const title = content?.title ?? 'プランと料金';
  const subtitle = content?.subtitle ?? 'ローンチの規模に合わせて選べる柔軟なプランをご用意しています。';
  const plans = Array.isArray(content?.plans) && content.plans.length > 0
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
      ];

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
    <section
      className="relative w-full bg-slate-50 py-16 text-slate-900 sm:py-20"
      style={{ backgroundColor: content?.backgroundColor, color: content?.textColor }}
    >
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
          <h2 className="text-3xl font-bold sm:text-4xl">{title}</h2>
          <p className="mt-3 text-base text-slate-600 sm:text-lg" style={{ color: content?.textColor ? `${content.textColor}cc` : undefined }}>
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {plans.map((plan, index) => {
            const isHighlighted = plan.highlighted ?? false;
            return (
              <div
                key={index}
                className={`flex h-full flex-col gap-5 rounded-2xl border p-6 transition ${
                  isHighlighted
                    ? 'border-blue-400 bg-white shadow-lg shadow-blue-100'
                    : 'border-slate-200 bg-white/90 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="text-sm font-medium uppercase tracking-wide text-blue-500"
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
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                        isHighlighted ? 'border-blue-500 text-blue-500' : 'border-slate-300 text-slate-400'
                      }`}
                    >
                      注目
                    </button>
                  ) : null}
                </div>

                <div className="flex items-baseline gap-2">
                  <span
                    className="text-3xl font-bold"
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    onBlur={updatePlanField(index, 'price')}
                  >
                    {plan.price}
                  </span>
                  <span
                    className="text-sm text-slate-500"
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    onBlur={updatePlanField(index, 'period')}
                  >
                    {plan.period ?? ''}
                  </span>
                </div>

                <p
                  className="text-sm text-slate-600"
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={updatePlanField(index, 'description')}
                >
                  {plan.description ?? ''}
                </p>

                <ul className="flex flex-1 flex-col gap-2 text-sm text-slate-600">
                  {(plan.features ?? []).map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <span className="mt-1 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400" />
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

                <button className="w-full rounded-lg bg-slate-900 py-2 text-sm font-semibold text-white transition hover:bg-slate-800" type="button">
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
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
