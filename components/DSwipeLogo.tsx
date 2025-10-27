'use client';

interface DSwipeLogoProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  showFullName?: boolean;
  textColor?: string;
}

export default function DSwipeLogo({ 
  size = 'medium',
  showFullName = true,
  textColor = 'text-slate-900'
}: DSwipeLogoProps) {
  const dimensions = {
    small: { circle: 28, text: 'text-sm', spacing: 'space-x-1.5' },
    medium: { circle: 40, text: 'text-lg', spacing: 'space-x-2' },
    large: { circle: 52, text: 'text-2xl', spacing: 'space-x-2.5' },
    xlarge: { circle: 64, text: 'text-3xl', spacing: 'space-x-3' }
  };

  const dim = dimensions[size];

  return (
    <div className={`flex items-center ${dim.spacing}`}>
      {/* D Logo - Blue Rounded Square with White D */}
      <div 
        className="rounded-xl flex items-center justify-center font-black shadow-md"
        style={{
          width: `${dim.circle}px`,
          height: `${dim.circle}px`,
          backgroundColor: '#3B82F6', // Blue
          color: '#FFFFFF', // White
          fontSize: dim.circle * 0.6 + 'px',
          lineHeight: '1',
          userSelect: 'none',
        }}
      >
        D
      </div>
      
      {/* swipe text - bold and cool */}
      {showFullName && (
        <span className={`${dim.text} font-bold tracking-tight ${textColor}`} style={{ letterSpacing: '-0.02em' }}>
          Swipe
        </span>
      )}
    </div>
  );
}
