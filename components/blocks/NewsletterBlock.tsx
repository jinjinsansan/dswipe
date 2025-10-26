import React from 'react';
import { NewsletterBlockContent } from '@/types/templates';

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

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-6 py-16 relative overflow-hidden"
      style={{ backgroundColor }}
    >
      {/* 背景装飾 - グラデーション円 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10"
          style={{
            background: `radial-gradient(circle, ${buttonColor} 0%, transparent 70%)`,
          }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-10"
          style={{
            background: `radial-gradient(circle, ${buttonColor} 0%, transparent 70%)`,
          }}
        />
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-3xl w-full relative z-10">
        <div className="text-center space-y-10">
          {/* メールアイコン */}
          <div className="flex justify-center">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transform transition-transform duration-500 hover:scale-110"
              style={{
                backgroundColor: buttonColor,
                boxShadow: `0 20px 60px -15px ${buttonColor}60`,
              }}
            >
              <svg
                className="w-12 h-12"
                fill="none"
                stroke={buttonTextColor}
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
            </div>
          </div>

          {/* タイトル */}
          {title && (
            <h2
              className="text-2xl md:text-3xl font-bold tracking-tight"
              style={{ color: textColor }}
            >
              {title}
            </h2>
          )}

          {/* 説明文 */}
          <div
            className="bg-white/70 backdrop-blur-sm rounded-3xl px-8 py-10 shadow-xl border border-white/40"
            style={{ borderColor: `${textColor}15` }}
          >
            <p
              className="text-lg md:text-xl leading-relaxed font-medium"
              style={{ color: textColor }}
            >
              {description}
            </p>
          </div>

          {/* ボタン */}
          <div className="pt-6">
            <a
              href={buttonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 px-12 py-6 rounded-2xl text-xl font-bold shadow-2xl transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-95"
              style={{
                backgroundColor: buttonColor,
                color: buttonTextColor,
                boxShadow: `0 20px 60px -15px ${buttonColor}80`,
              }}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{buttonText}</span>
            </a>
          </div>

          {/* 補足テキスト */}
          <div className="flex items-center justify-center gap-2 opacity-70">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke={textColor}
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <p className="text-sm font-medium" style={{ color: textColor }}>
              安全に登録できます・いつでも解除可能
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
