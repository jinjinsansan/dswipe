'use client';

interface DSwipeLogoProps {
  size?: 'small' | 'medium' | 'large';
  showFullName?: boolean;
}

export default function DSwipeLogo({ 
  size = 'medium',
  showFullName = true 
}: DSwipeLogoProps) {
  const dimensions = {
    small: { circle: 24, text: 'text-sm' },
    medium: { circle: 32, text: 'text-base' },
    large: { circle: 48, text: 'text-xl' }
  };

  const textSize = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-xl'
  };

  const dim = dimensions[size];

  return (
    <div className="flex items-center space-x-2">
      {/* D Logo - Yellow Circle with Black D */}
      <div 
        className="rounded-full flex items-center justify-center font-black"
        style={{
          width: `${dim.circle}px`,
          height: `${dim.circle}px`,
          backgroundColor: '#FDB91A', // Yellow/Gold
          color: '#000000', // Black
          fontSize: dim.circle * 0.55 + 'px',
          lineHeight: '1',
          userSelect: 'none',
        }}
      >
        D
      </div>
      
      {/* -swipe text */}
      {showFullName && (
        <span className={`${textSize[size]} font-light text-white`}>
          -swipe
        </span>
      )}
    </div>
  );
}
