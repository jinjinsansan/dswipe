'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Swiper as SwiperType } from 'swiper';
import { Pagination, Mousewheel, Keyboard } from 'swiper/modules';
import { publicApi } from '@/lib/api';
import { LPDetail, CTA, RequiredActionsStatus } from '@/types';

import 'swiper/css';
import 'swiper/css/pagination';

export default function LPViewerPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [lp, setLp] = useState<LPDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sessionId] = useState(`session-${Date.now()}-${Math.random()}`);
  const [requiredActions, setRequiredActions] = useState<RequiredActionsStatus | null>(null);
  const [showEmailGate, setShowEmailGate] = useState(false);
  const [email, setEmail] = useState('');
  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    fetchLP();
    checkRequiredActions();
  }, [slug]);

  const fetchLP = async () => {
    try {
      const response = await publicApi.getLP(slug);
      setLp(response.data);
    } catch (err) {
      setError('LPが見つかりませんでした');
    } finally {
      setIsLoading(false);
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
              <SwiperSlide key={step.id} className="relative">
                {/* 背景画像 */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${step.image_url})` }}
                />
                
                {/* CTAボタン */}
                {stepCtas.length > 0 && (
                  <div className="absolute inset-0 flex flex-col justify-end p-6 z-10">
                    <div className="space-y-4">
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
                  <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/70 text-center animate-bounce">
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
    </>
  );
}
