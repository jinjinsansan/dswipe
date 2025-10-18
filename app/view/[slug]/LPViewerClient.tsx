'use client';

import { useEffect, useState, useRef, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Swiper as SwiperType } from 'swiper';
import { Pagination, Mousewheel, Keyboard } from 'swiper/modules';
import { publicApi, productApi, pointsApi } from '@/lib/api';
import { LPDetail, CTA, RequiredActionsStatus } from '@/types';
import BlockRenderer from '@/components/blocks/BlockRenderer';
import { useAuthStore } from '@/store/authStore';

import 'swiper/css';
import 'swiper/css/pagination';

interface LPViewerClientProps {
  slug: string;
}

export default function LPViewerClient({ slug }: LPViewerClientProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [lp, setLp] = useState<LPDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sessionId] = useState(`session-${Date.now()}-${Math.random()}`);
  const [requiredActions, setRequiredActions] = useState<RequiredActionsStatus | null>(null);
  const [showEmailGate, setShowEmailGate] = useState(false);
  const [email, setEmail] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [pointBalance, setPointBalance] = useState(0);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [fixedCta, setFixedCta] = useState<any>(null);
  const [stickyCtaStep, setStickyCtaStep] = useState<any>(null);
  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    fetchLP();
    checkRequiredActions();
    if (isAuthenticated) {
      fetchPointBalance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, isAuthenticated]);

  const fetchLP = async () => {
    try {
      const response = await publicApi.getLP(slug);
      const steps = Array.isArray(response.data.steps) ? response.data.steps : [];
      const sortedSteps = [...steps].sort((a, b) => a.step_order - b.step_order);
      
      // 第1層フィルタ：有効なコンテンツを持つステップのみ
      const validSteps = sortedSteps.filter((step) => {
        const hasValidBlockType = typeof step.block_type === 'string' && step.block_type.trim().length > 0;
        const hasValidImageUrl = typeof step.image_url === 'string' && step.image_url.trim().length > 0;
        return hasValidBlockType || hasValidImageUrl;
      });
      
      console.log('📊 ステップフィルタリング:', {
        初期: sortedSteps.length,
        有効: validSteps.length,
        除外: sortedSteps.length - validSteps.length,
      });

      const shouldUseFloating = Boolean(response.data.floating_cta);
      const stickySteps = shouldUseFloating
        ? validSteps.filter((step) => step.block_type === 'sticky-cta-1')
        : [];
      setStickyCtaStep(stickySteps.length > 0 ? stickySteps[stickySteps.length - 1] : null);

      const ctaBlock = [...validSteps]
        .reverse()
        .find((step: any) =>
          step.block_type &&
          step.block_type !== 'sticky-cta-1' &&
          (step.block_type.startsWith('cta') || step.block_type === 'form')
        );

      const displaySteps = validSteps
        .filter((step) => (shouldUseFloating ? step.block_type !== 'sticky-cta-1' : true))
        .filter((step) => (ctaBlock ? step.id !== ctaBlock.id : true));

      console.log('🔍 ステップ詳細:', {
        validStepsCount: validSteps.length,
        displayStepsCount: displaySteps.length,
        ctaBlockFound: !!ctaBlock,
        ctaBlockType: ctaBlock?.block_type,
        shouldUseFloating,
        displayStepIds: displaySteps.map((s: any) => ({ id: s.id, blockType: s.block_type })),
      });

      if (ctaBlock) {
        setFixedCta({
          blockType: ctaBlock.block_type,
          content: ctaBlock.content_data,
          productId: response.data.product_id,
        });
      } else {
        setFixedCta(null);
      }

      const newLp = {
        ...response.data,
        steps: displaySteps,
      };
      
      console.log('📝 setLp 実行前:', {
        displayStepsLength: displaySteps.length,
        newLpStepsLength: newLp.steps.length,
        displayStepIds: displaySteps.map((s: any) => s.block_type),
      });
      
      setLp(newLp);
      
      console.log('✅ setLp 実行完了');

      if (response.data.id) {
        fetchProducts(response.data.id);
      }
    } catch (err: any) {
      console.error('❌ Failed to fetch LP:', err);
      setError('LPが見つかりませんでした');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async (lpId: string) => {
    try {
      console.log('📦 Fetching products for LP:', lpId);
      const response = await productApi.list({ lp_id: lpId });
      const productsData = Array.isArray(response.data?.data) 
        ? response.data.data 
        : Array.isArray(response.data) 
        ? response.data 
        : [];
      const availableProducts = productsData.filter((p: any) => p.is_available);
      console.log('✅ Found products:', availableProducts.length, availableProducts);
      setProducts(availableProducts);
    } catch (error) {
      console.error('❌ Failed to fetch products:', error);
    }
  };

  const fetchPointBalance = async () => {
    try {
      console.log('💰 Fetching point balance...');
      const response = await pointsApi.getBalance();
      const balance = response.data.point_balance || 0;
      console.log('✅ Point balance:', balance);
      setPointBalance(balance);
    } catch (error) {
      console.error('❌ Failed to fetch point balance:', error);
    }
  };

  const handleOpenPurchaseModal = (product: any) => {
    console.log('🛍️ Opening purchase modal for product:', product);
    
    if (!isAuthenticated) {
      console.log('⚠️ User not authenticated, redirecting to login');
      if (confirm('商品を購入するにはログインが必要です。ログインページに移動しますか？')) {
        router.push('/login');
      }
      return;
    }
    
    console.log('✅ User authenticated, showing modal');
    console.log('Current point balance:', pointBalance);
    console.log('Product price:', product.price_in_points);
    
    setSelectedProduct(product);
    setPurchaseQuantity(1);
    setShowPurchaseModal(true);
  };

  const handleProductButtonClick = (productId?: string) => {
    const resolvedProductId = productId ?? (products[0] ? String(products[0].id) : undefined);

    if (!resolvedProductId) {
      console.warn('⚠️ Product button clicked but no product is linked to this LP.');
      return;
    }

    const matchedProduct = products.find((product) => String(product.id) === String(resolvedProductId));

    if (matchedProduct) {
      handleOpenPurchaseModal(matchedProduct);
      return;
    }

    console.warn('⚠️ Product not found for CTA click. Falling back to points purchase page.', {
      productId: resolvedProductId,
      availableProducts: products.map((p) => p.id),
    });

    router.push(`/points/purchase?product_id=${resolvedProductId}`);
  };

  const handlePurchase = async () => {
    if (!selectedProduct) return;

    console.log('🛒 Starting purchase:', {
      productId: selectedProduct.id,
      quantity: purchaseQuantity,
      totalPoints: selectedProduct.price_in_points * purchaseQuantity,
      currentBalance: pointBalance,
    });

    setIsPurchasing(true);
    try {
      const response = await productApi.purchase(selectedProduct.id, { quantity: purchaseQuantity });
      console.log('✅ Purchase success:', response.data);
      
      setShowPurchaseModal(false);
      
      const payload = response.data || {};
      const nested = payload.data || {};

      const redirectTarget =
        payload.redirect_url ||
        payload.post_purchase_redirect_url ||
        payload.postPurchaseRedirectUrl ||
        payload.thanks_lp_url ||
        payload.thanksLpUrl ||
        nested.redirect_url ||
        nested.post_purchase_redirect_url ||
        nested.postPurchaseRedirectUrl ||
        nested.thanks_lp_url ||
        nested.thanksLpUrl;

      const thanksSlug =
        payload.thanks_lp_slug ||
        payload.thanksLpSlug ||
        nested.thanks_lp_slug ||
        nested.thanksLpSlug ||
        payload.thanks_lp_id ||
        payload.thanksLpId ||
        nested.thanks_lp_id ||
        nested.thanksLpId;

      if (redirectTarget) {
        alert('購入が完了しました！\nサンクスページに移動します。');
        window.location.href = redirectTarget;
      } else if (thanksSlug) {
        alert('購入が完了しました！\nサンクスページに移動します。');
        router.push(`/view/${thanksSlug}`);
      } else {
        alert('購入が完了しました！\nありがとうございます。');
      }
      
      await fetchPointBalance();
      if (lp?.id) {
        await fetchProducts(lp.id);
      }
    } catch (error: any) {
      console.error('❌ Purchase error:', error);
      console.error('Error details:', {
        response: error.response?.data,
        status: error.response?.status,
        message: error.message,
      });
      
      const errorMessage = error.response?.data?.detail 
        || error.message 
        || '購入に失敗しました。もう一度お試しください。';
      alert(errorMessage);
    } finally {
      setIsPurchasing(false);
    }
  };

  const checkRequiredActions = async () => {
    try {
      const response = await publicApi.getRequiredActions(slug, sessionId);
      setRequiredActions(response.data);
      
      if (!response.data.all_completed) {
        const emailAction = response.data.required_actions.find(
          (a: any) => a.action_type === 'email' && !response.data.completed_actions.includes(a.id)
        );
        if (emailAction) {
          setShowEmailGate(true);
        }
      }
    } catch (err) {
      console.error('Failed to check required actions:', err);
    }
  };

  const handleSlideChange = async (swiper: SwiperType) => {
    if (!lp) return;
    
    const currentStep = lp.steps[swiper.activeIndex];
    if (currentStep) {
      try {
        await publicApi.recordStepView(slug, {
          step_id: currentStep.id,
          session_id: sessionId,
        });
      } catch (err) {
        console.error('Failed to record step view:', err);
      }
    }

    if (swiper.previousIndex !== swiper.activeIndex && swiper.previousIndex < lp.steps.length) {
      const previousStep = lp.steps[swiper.previousIndex];
      if (previousStep) {
        try {
          await publicApi.recordStepExit(slug, {
            step_id: previousStep.id,
            session_id: sessionId,
          });
        } catch (err) {
          console.error('Failed to record step exit:', err);
        }
      }
    }
  };

  const handleCtaClick = async (cta: CTA) => {
    try {
      await publicApi.recordCtaClick(slug, {
        cta_id: cta.id,
        session_id: sessionId,
      });

      if (cta.cta_type === 'link' && cta.link_url) {
        window.open(cta.link_url, '_blank');
      }
    } catch (err) {
      console.error('Failed to record CTA click:', err);
    }
  };

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      await publicApi.submitEmail(slug, {
        email,
        session_id: sessionId,
      });
      
      setShowEmailGate(false);
      await checkRequiredActions();
      alert('メールアドレスが登録されました！');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'メールアドレスの登録に失敗しました');
    }
  };

  const getCurrentStepCtas = (stepIndex: number): CTA[] => {
    if (!lp) return [];
    const currentStep = lp.steps[stepIndex];
    if (!currentStep) return [];
    
    return lp.ctas.filter(cta => !cta.step_id || cta.step_id === currentStep.id);
  };

  const getStepBackgroundStyle = (step: any) => {
    if (!step?.content_data || typeof step.content_data !== 'object') {
      return undefined;
    }

    const content = step.content_data as Record<string, any>;
    const candidates = [
      content.background,
      content.backgroundColor,
      content.background_color,
      content.bgColor,
      content.sectionBackgroundColor,
      content.sectionBgColor,
      content.blockBackgroundColor,
      typeof content.background === 'object' ? content.background?.color : undefined,
      typeof content.background === 'object' ? content.background?.gradient : undefined,
    ];

    return candidates.find(
      (value): value is string => typeof value === 'string' && value.trim().length > 0,
    );
  };

  const getFixedCtaDecoration = () => {
    if (!fixedCta?.content) {
      return {
        accent: '#3B82F6',
        background: 'linear-gradient(135deg, rgba(15,23,42,0.96), rgba(8,14,35,0.94))',
      };
    }

    const content = fixedCta.content as Record<string, any>;
    const baseBackground = typeof content.backgroundColor === 'string' && content.backgroundColor.trim().length > 0
      ? content.backgroundColor
      : 'rgba(15,23,42,0.96)';
    const accent = typeof content.buttonColor === 'string' && content.buttonColor.trim().length > 0
      ? content.buttonColor
      : '#F97316';

    return {
      accent,
      background: `linear-gradient(135deg, ${baseBackground}, rgba(8,14,35,0.94))`,
    };
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    );
  }

  if (error || !lp) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">{error || 'LPが見つかりませんでした'}</div>
      </div>
    );
  }

  const hasFloatingCta = Boolean(lp.floating_cta && stickyCtaStep);
  const hasBottomOverlay = Boolean(fixedCta || hasFloatingCta);
  const shouldShowProductCards = products.length > 0 && !fixedCta && !hasFloatingCta;

  return (
    <>
      {showEmailGate && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center px-4">
          <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-4">続きを見るには</h2>
            <p className="text-gray-400 mb-6">メールアドレスを登録してください</p>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg shadow-blue-500/50"
              >
                登録して続きを見る
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="h-screen w-full flex flex-col overflow-hidden">
        <Swiper
          direction={lp.swipe_direction === 'vertical' ? 'vertical' : 'horizontal'}
          slidesPerView={1}
          mousewheel={{ releaseOnEdges: true, forceToAxis: true }}
          keyboard={true}
          pagination={{ clickable: true }}
          modules={[Pagination, Mousewheel, Keyboard]}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            handleSlideChange(swiper);
          }}
          onSlideChange={handleSlideChange}
          className={`flex-1 min-h-0 ${hasBottomOverlay ? 'pb-16 sm:pb-14 md:pb-12' : 'pb-6 sm:pb-5 md:pb-4'}`}
        >
          {lp.steps.length > 0 && (() => {
            console.log(`🎬 Swiper: ${lp.steps.length} 個の SwiperSlide をレンダリング`);
            return null;
          })()}
          {lp.steps.map((step, index) => {
              const stepCtas = getCurrentStepCtas(index);
              const slideBackground = getStepBackgroundStyle(step);
              const slideClass = lp.fullscreen_media
                ? 'relative flex items-center justify-center overflow-hidden no-scrollbar'
                : 'relative overflow-y-auto no-scrollbar';
              
              // デバッグログ：ステップの内容を確認
              const hasBlockType = typeof step.block_type === 'string' && step.block_type.trim().length > 0;
              const hasImageUrl = typeof step.image_url === 'string' && step.image_url.trim().length > 0;
              const hasContentData = step.content_data && Object.keys(step.content_data).length > 0;
              
              if (!hasBlockType && !hasImageUrl) {
                console.warn('⚠️ 警告：空のステップが検出されました', {
                  stepId: step.id,
                  index,
                  blockType: step.block_type,
                  imageUrl: step.image_url,
                  contentData: step.content_data,
                });
              } else {
                console.log(`✅ スライド ${index + 1}: blockType=${step.block_type || 'なし'}, hasImage=${hasImageUrl}`);
              }
            
            return (
              <SwiperSlide
                key={step.id}
                className={slideClass}
                style={slideBackground ? { background: slideBackground } : undefined}
              >
                {(() => {
                  const renderBlock = () => {
                    if (step.block_type && step.content_data) {
                      return (
                        <div className="lp-viewer-block w-full">
                          <BlockRenderer
                            blockType={step.block_type}
                            content={step.content_data}
                            isEditing={false}
                            productId={lp.product_id}
                          onProductClick={handleProductButtonClick}
                          />
                        </div>
                      );
                    }

                    if (step.image_url) {
                      return (
                        <div
                          className="absolute inset-0 bg-cover bg-center"
                          style={{ backgroundImage: `url(${step.image_url})` }}
                        />
                      );
                    }

                    return (
                      <div className="min-h-full bg-gray-900 flex items-center justify-center">
                        <p className="text-gray-500 text-lg">コンテンツがありません</p>
                      </div>
                    );
                  };

                  if (lp.fullscreen_media) {
                    return (
                      <div className="w-full h-full flex items-center justify-center">
                        {renderBlock()}
                      </div>
                    );
                  }

                  return renderBlock();
                })()}
                
                {stepCtas.length > 0 && (
                  <div className="absolute inset-0 flex flex-col justify-end p-6 z-10 pointer-events-none">
                    <div className="space-y-4 pointer-events-auto">
                      {stepCtas.map((cta) => (
                        <button
                          key={cta.id}
                          onClick={() => handleCtaClick(cta)}
                          className={`block w-full ${
                            cta.button_position === 'floating'
                              ? 'fixed bottom-6 left-1/2 -translate-x-1/2 max-w-sm'
                              : ''
                          }`}
                        >
                          <img
                            src={cta.button_image_url}
                            alt="CTA"
                            className="w-full h-auto rounded-lg shadow-2xl hover:scale-105 transition-transform"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {index === 0 && lp.show_swipe_hint && (
                  <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center text-white/80 gap-1 animate-bounce z-20">
                    <span className="text-4xl">
                      {lp.swipe_direction === 'vertical' ? '👇' : '👉'}
                    </span>
                    <span className="text-sm tracking-wide">
                      {lp.swipe_direction === 'vertical' ? '下にスワイプ' : '横にスワイプ'}
                    </span>
                  </div>
                )}
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      {fixedCta && (
        <div className="fixed bottom-0 left-0 right-0 z-40 w-full border-t border-white/10">
          <BlockRenderer
            blockType={fixedCta.blockType}
            content={fixedCta.content}
            isEditing={false}
            productId={fixedCta.productId}
            fullWidth
          onProductClick={handleProductButtonClick}
          />
        </div>
      )}

      {lp.floating_cta && stickyCtaStep && (
        <div className="fixed inset-x-0 bottom-0 z-50">
          <BlockRenderer
            blockType={stickyCtaStep.block_type}
            content={stickyCtaStep.content_data}
            isEditing={false}
            productId={lp.product_id}
            fullWidth
            onProductClick={handleProductButtonClick}
          />
        </div>
      )}

      {shouldShowProductCards && (
        <div className="fixed bottom-6 right-6 z-50 space-y-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-2xl border-2 border-blue-500 p-6 max-w-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900">{product.title}</h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                  {product.price_in_points.toLocaleString()} P
                </span>
              </div>
              {product.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
              )}
              {product.stock_quantity !== null && (
                <p className="text-gray-500 text-xs mb-3">残り {product.stock_quantity}個</p>
              )}
              <button
                onClick={() => handleOpenPurchaseModal(product)}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg"
              >
                今すぐ購入
              </button>
            </div>
          ))}
          {isAuthenticated && (
            <div className="bg-gray-900/90 backdrop-blur-sm text-white rounded-lg px-4 py-2 text-sm text-center">
              残高: {pointBalance.toLocaleString()} P
            </div>
          )}
        </div>
      )}

      {showPurchaseModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center px-4 animate-in fade-in duration-200">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]" />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white">商品購入</h2>
                  </div>
                  <button
                    onClick={() => setShowPurchaseModal(false)}
                    disabled={isPurchasing}
                    className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors flex items-center justify-center text-white disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center gap-2 text-blue-100">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">ポイント決済</span>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-6">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
                      {selectedProduct.title}
                    </h3>
                    {selectedProduct.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{selectedProduct.description}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Purchase Details */}
              <div className="space-y-3 mb-6">
                {/* Price */}
                <div className="bg-gradient-to-r from-gray-50 to-white rounded-lg p-4 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span className="font-medium">単価</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {selectedProduct.price_in_points.toLocaleString()}
                      <span className="text-sm text-blue-600 ml-1">P</span>
                    </span>
                  </div>
                </div>

                {/* Quantity */}
                <div className="bg-gradient-to-r from-gray-50 to-white rounded-lg p-4 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                      <span className="font-medium">数量</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPurchaseQuantity(Math.max(1, purchaseQuantity - 1))}
                        className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center text-gray-700 font-bold"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={selectedProduct.stock_quantity || 999}
                        value={purchaseQuantity}
                        onChange={(e) => setPurchaseQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 px-3 py-2 border-2 border-gray-200 rounded-lg text-center font-bold text-gray-900 focus:border-blue-500 focus:outline-none"
                      />
                      <button
                        onClick={() => setPurchaseQuantity(Math.min(selectedProduct.stock_quantity || 999, purchaseQuantity + 1))}
                        className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center text-gray-700 font-bold"
                      >
                        ＋
                      </button>
                    </div>
                  </div>
                </div>

                {/* Total */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-900">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span className="font-bold text-lg">合計金額</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">
                      {(selectedProduct.price_in_points * purchaseQuantity).toLocaleString()}
                      <span className="text-base ml-1">P</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Balance Info */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-5 mb-6 text-white shadow-lg">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                      </svg>
                      現在の残高
                    </span>
                    <span className="font-bold text-lg">{pointBalance.toLocaleString()} P</span>
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                      </svg>
                      購入後の残高
                    </span>
                    <span className={`font-bold text-lg ${
                      pointBalance - (selectedProduct.price_in_points * purchaseQuantity) < 0 
                        ? 'text-red-400' 
                        : 'text-green-400'
                    }`}>
                      {(pointBalance - (selectedProduct.price_in_points * purchaseQuantity)).toLocaleString()} P
                    </span>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {pointBalance < (selectedProduct.price_in_points * purchaseQuantity) && (
                <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-red-900 font-semibold">ポイントが不足しています</p>
                      <p className="text-red-700 text-sm mt-1">
                        不足: {((selectedProduct.price_in_points * purchaseQuantity) - pointBalance).toLocaleString()} P
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handlePurchase}
                  disabled={
                    isPurchasing || 
                    pointBalance < (selectedProduct.price_in_points * purchaseQuantity)
                  }
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
                >
                  {isPurchasing ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      処理中...
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      購入を確定する
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowPurchaseModal(false)}
                  disabled={isPurchasing}
                  className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
