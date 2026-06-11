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
  const backgroundColor = content?.backgroundColor ?? '#0B1F3A';
  const textColor = content?.textColor ?? '#F8FAFC';
  const accentColor = content?.accentColor ?? '#22D3EE';
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
          <div className="grid gap-3 rounded-xl bg-white/10 p-4 text-sm text-gray-800">
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

        {/* mock: editor.css .sc-faq — Qマーク=シアン、各Q&Aは独立カード */}
        <div className="responsive-stack items-center text-center">
          <h2
            className="typo-headline text-pretty font-extrabold"
            style={{ color: textColor, letterSpacing: '-0.02em' }}
            onClick={focusField<HTMLHeadingElement>('faq.title')}
          >
            {title}
          </h2>
          <p
            className="typo-body text-pretty"
            style={{ color: withAlpha(textColor, 0.72, textColor), lineHeight: 1.7 }}
            onClick={focusField<HTMLParagraphElement>('faq.subtitle')}
          >
            {subtitle}
          </p>
        </div>

        <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="group rounded-[11px] px-5 py-4"
              style={{
                border: `1px solid ${withAlpha(textColor, 0.12, textColor)}`,
                backgroundColor: withAlpha(textColor, 0.08, textColor),
              }}
            >
              <button
                className="flex w-full items-start gap-2 text-left font-bold typo-body-lg"
                style={{ color: textColor }}
                type="button"
                onClick={focusField<HTMLButtonElement>(`faq.items.${index}.question`)}
              >
                <span className="font-extrabold" style={{ color: accentColor }} aria-hidden="true">
                  Q
                </span>
                <span
                  className="flex-1"
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={updateItem(index, 'question')}
                  onClick={focusField<HTMLSpanElement>(`faq.items.${index}.question`)}
                >
                  {item.question}
                </span>
              </button>
              <div
                className="mt-2 pl-6 typo-body"
                style={{ color: withAlpha(textColor, 0.82, textColor), lineHeight: 1.6 }}
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
