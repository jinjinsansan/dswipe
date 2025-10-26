import React from 'react';
import { ContactBlockContent } from '@/types/templates';
import { withAlpha } from '@/lib/color';
import { getContrastColor } from '@/lib/color';

interface ContactBlockProps {
  content: ContactBlockContent;
}

export default function ContactBlock({ content }: ContactBlockProps) {
  const {
    title = 'お問い合わせはこちら',
    subtitle,
    description = '営業時間は平日10:00-18:00です。お気軽にご連絡ください。',
    buttonText = 'LINEで問い合わせる',
    buttonUrl = '#',
    backgroundColor = '#F8FAFC',
    textColor = '#0F172A',
    buttonColor = '#06C755',
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
          {subtitle && (
            <span
              className="text-xs font-semibold uppercase tracking-[0.35em]"
              style={{ color: buttonColor }}
            >
              {subtitle}
            </span>
          )}
          <h2 className="text-3xl font-bold sm:text-4xl mt-3" style={{ color: textColor }}>
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
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
              </svg>
              {buttonText}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
