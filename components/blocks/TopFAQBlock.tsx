import { FAQBlockContent } from '@/types/templates';
import { withAlpha } from '@/lib/color';
import { getBackgroundOverlayStyle, getBlockBackgroundStyle, shouldRenderBackgroundOverlay } from '@/lib/blockBackground';

interface TopFAQBlockProps {
  content: FAQBlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: any) => void;
  onFieldFocus?: (field: string) => void;
}

export default function TopFAQBlock({ content, isEditing, onEdit, onFieldFocus }: TopFAQBlockProps) {
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
  const backgroundColor = content?.backgroundColor ?? '#0F172A';
  const textColor = content?.textColor ?? '#F8FAFC';
  const accentColor = content?.accentColor ?? '#38BDF8';
  const backgroundStyle = getBlockBackgroundStyle(content, backgroundColor);
  const showOverlay = shouldRenderBackgroundOverlay(content);
  const overlayStyle = showOverlay ? getBackgroundOverlayStyle(content) : undefined;

  const focusField = <T extends HTMLElement>(field: string) => (event: React.MouseEvent<T>) => {
    if (!onFieldFocus) return;
    event.preventDefault();
    event.stopPropagation();
    onFieldFocus(field);
  };

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
      className="relative w-full py-section-sm sm:py-section"
      style={{
        ...backgroundStyle,
        color: textColor,
      }}
    >
      {showOverlay ? (
        <div className="pointer-events-none absolute inset-0" style={overlayStyle} />
      ) : null}
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-10 px-6">
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

        <div className="responsive-stack items-center text-center">
          <h2
            className="typo-headline text-pretty font-bold"
            style={{ color: textColor }}
            onClick={focusField<HTMLHeadingElement>('faq.title')}
          >
            {title}
          </h2>
          <p
            className="typo-body text-pretty"
            style={{ color: withAlpha(textColor, 0.72, textColor) }}
            onClick={focusField<HTMLParagraphElement>('faq.subtitle')}
          >
            {subtitle}
          </p>
        </div>

        <div
          className="flex flex-col overflow-hidden rounded-card border backdrop-blur"
          style={{
            borderColor: withAlpha(textColor, 0.16, textColor),
            backgroundColor: withAlpha(textColor, 0.05, textColor),
          }}
        >
          {items.map((item, index) => (
            <div key={index} className="group">
              <button
                className="flex w-full items-start justify-between gap-4 px-5 py-6 text-left font-medium typo-body-lg"
                style={{ color: textColor }}
                type="button"
                onClick={focusField<HTMLButtonElement>(`faq.items.${index}.question`)}
              >
                <span
                  className="flex-1"
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={updateItem(index, 'question')}
                  onClick={focusField<HTMLSpanElement>(`faq.items.${index}.question`)}
                >
                  {item.question}
                </span>
                <span
                  className="text-lg"
                  style={{ color: accentColor }}
                >
                  ＋
                </span>
              </button>
              <div
                className="px-5 pb-6 typo-body"
                style={{ color: withAlpha(textColor, 0.78, textColor) }}
              >
                <div
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={updateItem(index, 'answer')}
                  onClick={focusField<HTMLDivElement>(`faq.items.${index}.answer`)}
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
