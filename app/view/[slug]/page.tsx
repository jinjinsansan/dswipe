'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Swiper as SwiperType } from 'swiper';
import { Pagination, Mousewheel, Keyboard } from 'swiper/modules';
import { publicApi, productApi, pointsApi } from '@/lib/api';
import { LPDetail, CTA, RequiredActionsStatus } from '@/types';
import BlockRenderer from '@/components/blocks/BlockRenderer';
import { useAuthStore } from '@/store/authStore';

import 'swiper/css';
import 'swiper/css/pagination';

export default function LPViewerPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
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
  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    fetchLP();
    checkRequiredActions();
    if (isAuthenticated) {
      fetchPointBalance();
    }
  }, [slug, isAuthenticated]);

  const fetchLP = async () => {
    try {
      const response = await publicApi.getLP(slug);
      setLp(response.data);
      // LPに紐付いた商品を取得
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
      alert('購入が完了しました！');
      setShowPurchaseModal(false);
      // ポイント残高を再取得
      await fetchPointBalance();
      // 商品情報を再取得（在庫更新のため）
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
      
      // メールゲートが必要かチェック
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
      // ステップ閲覧記録
      try {
        await publicApi.recordStepView(slug, {
          step_id: currentStep.id,
          session_id: sessionId,
        });
      } catch (err) {
        console.error('Failed to record step view:', err);
      }
    }

    // 前のステップの離脱記録
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

  const handleEmailSubmit = async (e: React.FormEvent) => {
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

  return (
    <>
      {/* メールゲート */}
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

      {/* LP Viewer */}
      <div className={`h-screen ${lp.is_fullscreen ? '' : 'container mx-auto'}`}>
        <Swiper
          direction={lp.swipe_direction === 'vertical' ? 'vertical' : 'horizontal'}
          slidesPerView={1}
          mousewheel={true}
          keyboard={true}
          pagination={{ clickable: true }}
          modules={[Pagination, Mousewheel, Keyboard]}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            handleSlideChange(swiper);
          }}
          onSlideChange={handleSlideChange}
          className="h-full"
        >
          {lp.steps.sort((a, b) => a.step_order - b.step_order).map((step, index) => {
            const stepCtas = getCurrentStepCtas(index);
            
            return (
              <SwiperSlide key={step.id} className="relative bg-white overflow-y-auto">
                {/* ブロックレンダリング */}
                {step.block_type && step.content_data ? (
                  <BlockRenderer
                    blockType={step.block_type}
                    content={step.content_data}
                    isEditing={false}
                  />
                ) : (
                  <>
                    {/* 旧式の画像ベース */}
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${step.image_url})` }}
                    />
                  </>
                )}
                
                {/* CTAボタン */}
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

                {/* スワイプヒント */}
                {index === 0 && (
                  <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-gray-700 text-center animate-bounce z-20">
                    <div className="text-3xl mb-2">
                      {lp.swipe_direction === 'vertical' ? '↓' : '→'}
                    </div>
                    <div className="text-sm">スワイプして続きを見る</div>
                  </div>
                )}
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      {/* 商品購入セクション */}
      {products.length > 0 && (
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

      {/* 購入モーダル */}
      {showPurchaseModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center px-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">商品購入</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {selectedProduct.title}
              </h3>
              {selectedProduct.description && (
                <p className="text-gray-600 text-sm mb-4">{selectedProduct.description}</p>
              )}
              
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-600">単価</span>
                  <span className="font-semibold">{selectedProduct.price_in_points.toLocaleString()} P</span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-600">数量</span>
                  <input
                    type="number"
                    min="1"
                    max={selectedProduct.stock_quantity || 999}
                    value={purchaseQuantity}
                    onChange={(e) => setPurchaseQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 px-3 py-1 border border-gray-300 rounded text-center"
                  />
                </div>
                
                <div className="flex items-center justify-between py-2 text-lg font-bold">
                  <span>合計</span>
                  <span className="text-blue-600">
                    {(selectedProduct.price_in_points * purchaseQuantity).toLocaleString()} P
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-2 text-sm bg-gray-100 px-3 rounded">
                  <span className="text-gray-600">現在の残高</span>
                  <span className="font-semibold">{pointBalance.toLocaleString()} P</span>
                </div>
                
                <div className="flex items-center justify-between py-2 text-sm bg-blue-50 px-3 rounded">
                  <span className="text-gray-600">購入後の残高</span>
                  <span className={`font-semibold ${
                    pointBalance - (selectedProduct.price_in_points * purchaseQuantity) < 0 
                      ? 'text-red-600' 
                      : 'text-green-600'
                  }`}>
                    {(pointBalance - (selectedProduct.price_in_points * purchaseQuantity)).toLocaleString()} P
                  </span>
                </div>
              </div>
            </div>

            {pointBalance < (selectedProduct.price_in_points * purchaseQuantity) && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">
                  ポイントが不足しています
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handlePurchase}
                disabled={
                  isPurchasing || 
                  pointBalance < (selectedProduct.price_in_points * purchaseQuantity)
                }
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPurchasing ? '処理中...' : '購入する'}
              </button>
              <button
                onClick={() => setShowPurchaseModal(false)}
                disabled={isPurchasing}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
