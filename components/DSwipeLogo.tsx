'use client';

interface DSwipeLogoProps {
  size?: 'small' | 'medium' | 'large';
  showFullName?: boolean;
}

export default function DSwipeLogo({ 
  size = 'medium',
  showFullName = true 
}: DSwipeLogoProps) {
  const sizeClasses = {
    small: 'text-lg',
    medium: 'text-xl',
    large: 'text-2xl'
  };

  return (
    <div className="flex items-center space-x-1">
      {/* D Logo */}
      <span 
        className={`${sizeClasses[size]} font-black text-[#c0c0c0]`}
        style={{
          filter: 'drop-shadow(0 0 12px rgba(192, 192, 192, 0.6))',
          textShadow: '0 0 20px rgba(192, 192, 192, 0.4)',
          fontWeight: 900,
          lineHeight: '1',
          userSelect: 'none',
        }}
      >
        D
      </span>
      
      {/* -swipe text */}
      {showFullName && (
        <span className={`${sizeClasses[size]} font-light text-white`}>
          -swipe
        </span>
      )}
    </div>
  );
}
