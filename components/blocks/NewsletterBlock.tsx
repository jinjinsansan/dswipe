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
      style={{
        background: `linear-gradient(135deg, ${backgroundColor} 0%, ${backgroundColor}dd 50%, ${backgroundColor}ee 100%)`,
      }}
    >
      {/* 背景装飾 - より華やかなグラデーション + 複数の円 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-48 -right-48 w-[600px] h-[600px] rounded-full blur-3xl opacity-25 animate-pulse"
          style={{
            background: `radial-gradient(circle, ${buttonColor} 0%, transparent 70%)`,
            animationDuration: '5s',
          }}
        />
        <div
          className="absolute top-1/3 -left-48 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 animate-pulse"
          style={{
            background: `radial-gradient(circle, ${buttonColor} 0%, transparent 70%)`,
            animationDuration: '7s',
            animationDelay: '1.5s',
          }}
        />
        <div
          className="absolute -bottom-48 right-1/4 w-[550px] h-[550px] rounded-full blur-3xl opacity-15 animate-pulse"
          style={{
            background: `radial-gradient(circle, ${buttonColor} 0%, transparent 70%)`,
            animationDuration: '6s',
            animationDelay: '0.5s',
          }}
        />
        {/* 装飾的なドット */}
        <div className="absolute top-20 left-20 w-2 h-2 rounded-full opacity-30 animate-pulse" style={{ backgroundColor: buttonColor }} />
        <div className="absolute top-40 right-32 w-3 h-3 rounded-full opacity-20 animate-pulse" style={{ backgroundColor: buttonColor, animationDelay: '1s' }} />
        <div className="absolute bottom-32 left-1/3 w-2 h-2 rounded-full opacity-25 animate-pulse" style={{ backgroundColor: buttonColor, animationDelay: '2s' }} />
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-3xl w-full relative z-10">
        <div className="text-center space-y-12">
          {/* メールアイコン - パルスアニメーション */}
          <div className="flex justify-center">
            <div className="relative">
              {/* 外側のパルスリング */}
              <div
                className="absolute inset-0 rounded-full animate-ping opacity-30"
                style={{
                  backgroundColor: buttonColor,
                  animationDuration: '2s',
                }}
              />
              <div
                className="relative w-28 h-28 rounded-full flex items-center justify-center shadow-2xl transform transition-all duration-700 hover:scale-125 hover:rotate-12"
                style={{
                  backgroundColor: buttonColor,
                  boxShadow: `0 25px 70px -20px ${buttonColor}80, 0 0 0 1px ${buttonColor}30`,
                }}
              >
                <svg
                  className="w-14 h-14"
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
          </div>

          {/* タイトル */}
          {title && (
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight"
              style={{ color: textColor }}
            >
              {title}
            </h2>
          )}

          {/* 説明文 - グラデーションボーダー */}
          <div className="relative">
            {/* グラデーションボーダーのための外側div */}
            <div
              className="absolute inset-0 rounded-[2rem] blur-sm opacity-40"
              style={{
                background: `linear-gradient(135deg, ${buttonColor} 0%, ${buttonColor}40 100%)`,
              }}
            />
            <div
              className="relative bg-white/85 backdrop-blur-lg rounded-[2rem] px-10 py-12 shadow-2xl border-2"
              style={{ 
                borderColor: 'transparent',
                background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.3)) border-box',
              }}
            >
              <p
                className="text-xl md:text-2xl leading-relaxed font-medium"
                style={{ color: textColor }}
              >
                {description}
              </p>
            </div>
          </div>

          {/* ボタン - 光るエフェクト */}
          <div className="pt-8">
            <a
              href={buttonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-4 px-14 py-7 rounded-2xl text-xl md:text-2xl font-bold transform transition-all duration-500 hover:scale-110 hover:-translate-y-2 active:scale-95 relative overflow-hidden"
              style={{
                backgroundColor: buttonColor,
                color: buttonTextColor,
                boxShadow: `0 30px 80px -20px ${buttonColor}90, 0 0 0 1px ${buttonColor}50`,
              }}
            >
              {/* ボタン内の光るエフェクト */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-700"
                style={{
                  background: `linear-gradient(135deg, transparent 0%, white 50%, transparent 100%)`,
                }}
              />
              
              <svg
                className="w-7 h-7 relative z-10 transition-transform duration-500 group-hover:scale-125"
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
              <span className="relative z-10">{buttonText}</span>
            </a>
          </div>

          {/* 補足テキスト - より目立つデザイン */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <div
              className="p-2 rounded-full bg-white/40 backdrop-blur-sm"
              style={{ boxShadow: `0 4px 12px ${buttonColor}20` }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke={textColor}
                strokeWidth="2.5"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <p className="text-sm font-semibold" style={{ color: textColor, opacity: 0.8 }}>
              安全に登録できます・いつでも解除可能
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
