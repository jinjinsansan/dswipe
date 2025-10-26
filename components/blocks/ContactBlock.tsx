import React from 'react';
import { ContactBlockContent } from '@/types/templates';

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

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-6 py-16 relative overflow-hidden"
      style={{ backgroundColor }}
    >
      {/* 背景装飾 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-5"
          style={{
            background: `radial-gradient(circle, ${buttonColor} 0%, transparent 70%)`,
          }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full opacity-5"
          style={{
            background: `radial-gradient(circle, ${buttonColor} 0%, transparent 70%)`,
          }}
        />
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-2xl w-full relative z-10">
        <div className="text-center space-y-8">
          {/* タイトルエリア */}
          <div className="space-y-4">
            {subtitle && (
              <p
                className="text-sm font-semibold tracking-wider uppercase opacity-70"
                style={{ color: textColor }}
              >
                {subtitle}
              </p>
            )}
            <h2
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
              style={{ color: textColor }}
            >
              {title}
            </h2>
          </div>

          {/* 説明文 */}
          <div
            className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20"
            style={{ borderColor: `${textColor}15` }}
          >
            <p
              className="text-lg md:text-xl leading-relaxed"
              style={{ color: textColor, opacity: 0.8 }}
            >
              {description}
            </p>
          </div>

          {/* ボタン */}
          <div className="pt-4">
            <a
              href={buttonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl text-lg md:text-xl font-bold shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl active:scale-95"
              style={{
                backgroundColor: buttonColor,
                color: buttonTextColor,
                boxShadow: `0 20px 60px -15px ${buttonColor}80`,
              }}
            >
              {/* LINEアイコン風の装飾 */}
              <svg
                className="w-7 h-7"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
              </svg>
              <span>{buttonText}</span>
            </a>
          </div>

          {/* 補足テキスト */}
          <p
            className="text-sm opacity-60 mt-6"
            style={{ color: textColor }}
          >
            ボタンをタップすると外部サイトに移動します
          </p>
        </div>
      </div>
    </div>
  );
}
