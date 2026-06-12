'use client';

/* Momentum 正規ロゴ — mock §9:
   「D」のネイビー角丸＋右向き二重シェブロン(スワイプの暗喩)＋ワードマーク。
   薄い白リングはネイビー背景(サイドバー等)でも輪郭が出るようにするため。 */

interface DSwipeLogoProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  showFullName?: boolean;
  textColor?: string;
}

export default function DSwipeLogo({
  size = 'medium',
  showFullName = true,
  textColor = 'text-navy-900',
}: DSwipeLogoProps) {
  const dimensions = {
    small: { mark: 28, text: 'text-sm', spacing: 'space-x-1.5' },
    medium: { mark: 40, text: 'text-lg', spacing: 'space-x-2' },
    large: { mark: 52, text: 'text-2xl', spacing: 'space-x-2.5' },
    xlarge: { mark: 64, text: 'text-3xl', spacing: 'space-x-3' },
  };

  const dim = dimensions[size];

  return (
    <div className={`flex items-center ${dim.spacing}`}>
      <svg
        width={dim.mark}
        height={dim.mark}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0 drop-shadow-sm"
      >
        <defs>
          <linearGradient id="dswipe-logo-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0ea5e9" />
            <stop offset="1" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="38" height="38" rx="11" fill="#0b1f3a" stroke="rgba(255,255,255,0.2)" />
        <path
          d="M11 13h6c4 0 7 2.8 7 7s-3 7-7 7h-6z"
          fill="none"
          stroke="url(#dswipe-logo-grad)"
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
        <path
          d="M25 20l6-5m-6 5l6 5"
          stroke="url(#dswipe-logo-grad)"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {showFullName && (
        <span className={`${dim.text} font-bold tracking-tight ${textColor}`} style={{ letterSpacing: '-0.02em' }}>
          Swipe
        </span>
      )}
    </div>
  );
}
