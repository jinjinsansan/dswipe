'use client';

import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Swiper as SwiperType } from 'swiper';
import { Pagination, Mousewheel, Keyboard, FreeMode, EffectCreative } from 'swiper/modules';
import BlockRenderer from '@/components/blocks/BlockRenderer';
import { BlockType, BlockContent } from '@/types/templates';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/free-mode';
import 'swiper/css/effect-creative';

interface LivePreviewProps {
  blocks: Array<{
    id: string;
    blockType: BlockType;
    content: BlockContent;
    order: number;
  }>;
  deviceSize?: 'mobile' | 'tablet' | 'desktop';
  lpSettings?: {
    fullscreenMedia?: boolean;
    swipeDirection?: 'vertical' | 'horizontal';
  };
  linkedProductId?: string | null;
  onProductPreviewClick?: () => void;
}

const DEVICE_SIZES = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1440, height: 900 },
};

export default function LivePreview({
  blocks,
  deviceSize = 'mobile',
  lpSettings,
  linkedProductId,
  onProductPreviewClick,
}: LivePreviewProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  const direction = lpSettings?.swipeDirection || 'vertical';
  const fullscreenMedia = lpSettings?.fullscreenMedia || false;

  const triggerHapticFeedback = (style: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = { light: 10, medium: 20, heavy: 30 };
      navigator.vibrate(patterns[style]);
    }
  };

  const device = DEVICE_SIZES[deviceSize];

  const handlePreviewProductClick = () => {
    if (onProductPreviewClick) {
      onProductPreviewClick();
    } else {
      alert('公開ページでは商品購入モーダルが開きます。プレビューではリンクのみ確認できます。');
    }
  };

  const productClickHandler = linkedProductId ? handlePreviewProductClick : undefined;

  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-100">
      <div
        className="bg-white shadow-2xl rounded-2xl overflow-hidden relative"
        style={{
          width: deviceSize === 'desktop' ? '100%' : `${device.width}px`,
          height: deviceSize === 'desktop' ? '100%' : `${device.height}px`,
          maxWidth: '100%',
          maxHeight: '100%',
        }}
      >
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-50 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
          {deviceSize === 'mobile' && '📱 Mobile (375px)'}
          {deviceSize === 'tablet' && '📱 Tablet (768px)'}
          {deviceSize === 'desktop' && '💻 Desktop'}
        </div>

        <div className="w-full h-full">
          <Swiper
            direction={direction}
            slidesPerView={1}
            speed={350}
            touchRatio={1.8}
            threshold={3}
            shortSwipes={true}
            longSwipes={true}
            longSwipesRatio={0.25}
            resistance={true}
            resistanceRatio={0.65}
            freeMode={{
              enabled: false,
              momentum: true,
              momentumRatio: 0.8,
              momentumVelocityRatio: 0.8,
              sticky: true,
            }}
            watchSlidesProgress={true}
            effect="creative"
            creativeEffect={{
              prev: {
                translate: direction === 'vertical' ? [0, '-20%', -1] : ['-20%', 0, -1],
                scale: 0.95,
                opacity: 0.8,
              },
              next: {
                translate: direction === 'vertical' ? [0, '100%', 0] : ['100%', 0, 0],
              },
            }}
            mousewheel={{ releaseOnEdges: true, forceToAxis: true, sensitivity: 0.8, thresholdDelta: 10 }}
            keyboard={{ enabled: true, onlyInViewport: true }}
            pagination={{ clickable: true, dynamicBullets: true, dynamicMainBullets: 3 }}
            modules={[Pagination, Mousewheel, Keyboard, FreeMode, EffectCreative]}
            onSwiper={(swiper) => { swiperRef.current = swiper; }}
            onTouchStart={() => triggerHapticFeedback('light')}
            className="h-full"
          >
            {blocks.length === 0 ? (
              <SwiperSlide className="flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="text-center p-8">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-bold text-slate-700 mb-2">ブロックを追加してください</h3>
                  <p className="text-slate-500">左のパネルからブロックを選択して、LPを作成しましょう</p>
                </div>
              </SwiperSlide>
            ) : (
              blocks.map((block) => (
                <SwiperSlide
                  key={block.id}
                  className={fullscreenMedia ? 'relative flex items-center justify-center overflow-hidden' : 'relative overflow-y-auto'}
                >
                  <div className="w-full h-full">
                    <BlockRenderer
                      blockType={block.blockType}
                      content={block.content}
                      isEditing={false}
                      withinEditor={false}
                      productId={linkedProductId ?? undefined}
                      onProductClick={productClickHandler}
                    />
                  </div>
                </SwiperSlide>
              ))
            )}
          </Swiper>
        </div>
      </div>
    </div>
  );
}
