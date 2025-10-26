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
      style={{
        background: `linear-gradient(135deg, ${backgroundColor} 0%, ${backgroundColor}ee 100%)`,
      }}
    >
      {/* 背景装飾 - より華やかなグラデーション */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 animate-pulse"
          style={{
            background: `radial-gradient(circle, ${buttonColor} 0%, transparent 70%)`,
            animationDuration: '4s',
          }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 animate-pulse"
          style={{
            background: `radial-gradient(circle, ${buttonColor} 0%, transparent 70%)`,
            animationDuration: '6s',
            animationDelay: '1s',
          }}
        />
        {/* Wave装飾 */}
        <div className="absolute bottom-0 left-0 right-0 opacity-5">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-32">
            <path
              d="M0,0 C150,80 350,80 600,60 C850,40 1050,40 1200,80 L1200,120 L0,120 Z"
              fill={buttonColor}
            />
          </svg>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-2xl w-full relative z-10">
        <div className="text-center space-y-10">
          {/* タイトルエリア */}
          <div className="space-y-5">
            {subtitle && (
              <div className="inline-block px-4 py-2 rounded-full bg-white/30 backdrop-blur-sm">
                <p
                  className="text-xs font-bold tracking-widest uppercase"
                  style={{ color: buttonColor }}
                >
                  {subtitle}
                </p>
              </div>
            )}
            <h2
              className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
              style={{ color: textColor }}
            >
              {title}
            </h2>
          </div>

          {/* 説明文 - グラデーションボーダー */}
          <div className="relative">
            <div
              className="absolute inset-0 rounded-3xl blur-sm opacity-30"
              style={{
                background: `linear-gradient(135deg, ${buttonColor} 0%, ${buttonColor}60 100%)`,
              }}
            />
            <div
              className="relative bg-white/80 backdrop-blur-md rounded-3xl p-10 shadow-2xl border-2"
              style={{ 
                borderColor: 'transparent',
                background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.2)) border-box',
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
          <div className="pt-6">
            <a
              href={buttonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-4 px-14 py-7 rounded-2xl text-xl md:text-2xl font-bold transform transition-all duration-500 hover:scale-110 hover:-translate-y-2 active:scale-95 relative overflow-hidden"
              style={{
                backgroundColor: buttonColor,
                color: buttonTextColor,
                boxShadow: `0 25px 70px -20px ${buttonColor}90, 0 0 0 1px ${buttonColor}40`,
              }}
            >
              {/* ボタン内の光るエフェクト */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(135deg, transparent 0%, white 50%, transparent 100%)`,
                }}
              />
              
              {/* LINEアイコン */}
              <svg
                className="w-8 h-8 relative z-10 transition-transform duration-500 group-hover:rotate-12"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
              </svg>
              <span className="relative z-10">{buttonText}</span>
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
