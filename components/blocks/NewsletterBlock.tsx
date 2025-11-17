import React from 'react';
import { NewsletterBlockContent } from '@/types/templates';
import { withAlpha } from '@/lib/color';
import { getContrastColor } from '@/lib/color';
import { getBackgroundOverlayStyle, getBlockBackgroundStyle, shouldRenderBackgroundOverlay } from '@/lib/blockBackground';

interface NewsletterBlockProps {
  content: NewsletterBlockContent;
}

export default function NewsletterBlock({ content }: NewsletterBlockProps) {
  const {
    title = 'メールマガジン',
    description = 'ただ今お得なメルマガ配信中です！下記のボタンをクリックして今すぐお使いのメールアドレスをご入力ください',
    buttonText = 'メルマガ購読',
    buttonUrl = '#',
    backgroundColor = '#EFF6FF',
    textColor = '#1E3A8A',
    buttonColor = '#2563EB',
    buttonTextColor = '#FFFFFF',
  } = content;

  const buttonTextFinal = getContrastColor(buttonColor, '#FFFFFF', '#0F172A');

  const backgroundStyle = getBlockBackgroundStyle(content, backgroundColor);
  const showOverlay = shouldRenderBackgroundOverlay(content);
  const overlayStyle = showOverlay ? getBackgroundOverlayStyle(content) : undefined;

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
      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col gap-10 px-6">
        <div className="responsive-stack items-center text-center">
          <h2 className="typo-headline text-pretty font-bold" style={{ color: textColor }}>
            {title}
          </h2>
        </div>

        <div
          className="rounded-card border p-6 text-center shadow-sm"
          style={{
            borderColor: withAlpha(buttonColor, 0.2, buttonColor),
            backgroundColor: withAlpha(buttonColor, 0.06, '#FFFFFF'),
          }}
        >
          <p
            className="typo-body text-pretty"
            style={{ color: withAlpha(textColor, 0.82, textColor) }}
          >
            {description}
          </p>

          <div className="mt-6 flex justify-center">
            <a
              href={buttonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-3 font-semibold typo-body-lg transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                backgroundColor: buttonColor,
                color: buttonTextFinal,
                border: `1px solid ${buttonColor}`,
                outlineColor: withAlpha(buttonColor, 0.5, buttonColor),
              }}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              {buttonText}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
