import { FAQBlockContent } from '@/types/templates';

interface TopFAQBlockProps {
  content: FAQBlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: any) => void;
}

export default function TopFAQBlock({ content, isEditing, onEdit }: TopFAQBlockProps) {
  const title = content?.title ?? 'よくある質問';
  const subtitle = content?.subtitle ?? '導入前によくいただく質問をまとめました。';
  const items = Array.isArray(content?.items) && content.items.length > 0
    ? content.items
    : [
        {
          question: '本当に最短5分でLPを公開できますか？',
          answer: 'AIヒアリングに回答すると構成とコピーが自動生成され、そのまま公開まで行えます。ドメイン設定や決済もワンクリックで完了します。',
        },
        {
          question: '決済や会員サイトは連携できますか？',
          answer: 'Stripe・メール配信・会員サイトへのWebhook連携を標準装備。APIキーを登録するだけで即日稼働できます。',
        },
      ];

  const updateItem = (index: number, field: 'question' | 'answer') =>
    (event: React.FocusEvent<HTMLDivElement | HTMLTextAreaElement>) => {
      const target = event.currentTarget;
      const nextValue = target instanceof HTMLTextAreaElement ? target.value : target.textContent ?? '';
      const next = [...items];
      next[index] = {
        ...next[index],
        [field]: nextValue,
      };
      onEdit?.('items', next);
    };

  return (
    <section
      className="relative w-full bg-slate-900 py-16 text-slate-100 sm:py-20"
      style={{ backgroundColor: content?.backgroundColor, color: content?.textColor }}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6">
        {isEditing ? (
          <div className="grid gap-3 rounded-xl bg-white/10 p-4 text-sm text-slate-200">
            <input
              className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2"
              value={title}
              onChange={(e) => onEdit?.('title', e.target.value)}
              placeholder="タイトル"
            />
            <textarea
              className="min-h-[80px] w-full rounded-md border border-white/20 bg-white/10 px-3 py-2"
              value={subtitle}
              onChange={(e) => onEdit?.('subtitle', e.target.value)}
              placeholder="サブタイトル"
            />
          </div>
        ) : null}

        <div className="text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">{title}</h2>
          <p className="mt-3 text-base text-slate-300 sm:text-lg" style={{ color: content?.textColor ? `${content.textColor}cc` : undefined }}>
            {subtitle}
          </p>
        </div>

        <div className="flex flex-col divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur">
          {items.map((item, index) => (
            <div key={index} className="group">
              <button
                className="flex w-full items-start justify-between gap-4 px-5 py-6 text-left text-base font-medium text-slate-100"
                type="button"
              >
                <span
                  className="flex-1"
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={updateItem(index, 'question')}
                >
                  {item.question}
                </span>
                <span className="text-lg text-slate-400">＋</span>
              </button>
              <div className="px-5 pb-6 text-sm leading-relaxed text-slate-300">
                <div
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={updateItem(index, 'answer')}
                >
                  {item.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
