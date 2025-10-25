import { FeaturesBlockContent } from '@/types/templates';

interface TopHighlightsBlockProps {
  content: FeaturesBlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: any) => void;
}

export default function TopHighlightsBlock({ content, isEditing, onEdit }: TopHighlightsBlockProps) {
  const title = content?.title ?? 'こんな課題、ありませんか？';
  const tagline = content?.tagline ?? 'Pain Points';
  const accentColor = content?.accentColor ?? '#2563EB';
  const features = Array.isArray(content?.features) && content.features.length > 0 ? content.features : [
    {
      icon: '🎨',
      title: 'デザイン設計に時間を奪われる',
      description: 'ゼロから構成やビジュアルを整えるのは非効率で差別化も難しい。',
    },
    {
      icon: '🌐',
      title: 'ドメイン・サーバー整備が面倒',
      description: '取得・SSL対応まで段取りに追われ、初動が遅れる。',
    },
    {
      icon: '💳',
      title: '決済機能の実装ハードル',
      description: '安全な決済フローの準備には高い技術とセキュリティ知識が必要。',
    },
  ];

  const handleFeatureChange = (index: number, field: 'icon' | 'title' | 'description') => (e: React.FocusEvent<HTMLDivElement>) => {
    const next = [...features];
    next[index] = { ...next[index], [field]: e.currentTarget.textContent ?? '' };
    onEdit?.('features', next);
  };

  return (
    <section
      className="relative w-full py-16"
      style={{
        backgroundColor: content?.backgroundColor ?? '#F1F5F9',
        color: content?.textColor,
      }}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6">
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

        <div className="text-center">
          <p
            className="text-xs font-semibold uppercase tracking-[0.35em]"
            style={{ color: accentColor }}
          >
            {tagline}
          </p>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl" style={{ color: content?.textColor ?? '#0F172A' }}>
            {title}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div key={index} className="flex h-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div
                className="text-3xl"
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={handleFeatureChange(index, 'icon')}
                style={{ color: accentColor }}
              >
                {feature.icon}
              </div>
              <h3
                className="text-lg font-semibold"
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={handleFeatureChange(index, 'title')}
              >
                {feature.title}
              </h3>
              <p
                className="text-sm text-slate-600"
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={handleFeatureChange(index, 'description')}
                style={{ color: content?.textColor ? `${content.textColor}B3` : undefined }}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
