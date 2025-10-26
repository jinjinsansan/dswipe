import React from 'react';
import { NewsletterBlockContent } from '@/types/templates';
import { withAlpha } from '@/lib/color';
import { getContrastColor } from '@/lib/color';

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

  return (
    <section
      className="relative w-full py-16 sm:py-20"
      style={{ backgroundColor, color: textColor }}
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold sm:text-4xl" style={{ color: textColor }}>
            {title}
          </h2>
        </div>

        <div
          className="rounded-2xl border p-6 shadow-sm text-center"
          style={{
            borderColor: withAlpha(buttonColor, 0.2, buttonColor),
            backgroundColor: withAlpha(buttonColor, 0.06, '#FFFFFF'),
          }}
        >
          <p
            className="text-base leading-relaxed"
            style={{ color: withAlpha(textColor, 0.82, textColor) }}
          >
            {description}
          </p>

          <div className="mt-6 flex justify-center">
            <a
              href={buttonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-3 text-base font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                backgroundColor: buttonColor,
                color: buttonTextFinal,
                border: `1px solid ${buttonColor}`,
                outlineColor: withAlpha(buttonColor, 0.5, buttonColor),
              }}
            >
              <svg
                className="w-5 h-5"
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
