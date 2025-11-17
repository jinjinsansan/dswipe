'use client';

import { PageLoader } from '@/components/LoadingSpinner';

import { useEffect, useState, useRef, useMemo, FormEvent } from 'react';
import { ArrowDownIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/free-mode';
import 'swiper/css/effect-creative';
import {
  fetchLandingPage,
  fetchLandingPageByShareToken,
  fetchRequiredActions,
  fetchPointsBalance,
  fetchPublicProducts,
  purchaseProduct,
  recordCtaClick,
  recordStepExit,
  recordStepView,
  submitEmailCapture,
} from '@/lib/publicClient';
import { LPDetail, RequiredActionsStatus, CTA, Product, type FooterCTAConfig } from '@/types';
import ViewerBlockRenderer from '@/components/viewer/ViewerBlockRenderer';
import { useAuthStore } from '@/store/authStore';
import { redirectToLogin } from '@/lib/navigation';

import type { Swiper as SwiperType } from 'swiper';
import type { SwiperModule } from 'swiper/types';

type SwiperComponentType = typeof import('swiper/react').Swiper;
type SwiperSlideComponentType = typeof import('swiper/react').SwiperSlide;

interface LPViewerClientProps {
  slug?: string;
  shareToken?: string | null;
  initialLp?: LPDetail | null;
  initialProducts?: Product[];
}

const HEX_COLOR_PATTERN = /^#([0-9A-Fa-f]{3}){1,2}$/;

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const trimmed = hex.trim();
  if (!HEX_COLOR_PATTERN.test(trimmed)) {
    return null;
  }
  let normalized = trimmed.replace('#', '');
  if (normalized.length === 3) {
    normalized = normalized
      .split('')
      .map((char) => char + char)
      .join('');
  }
  const numeric = Number.parseInt(normalized, 16);
  if (Number.isNaN(numeric)) {
    return null;
  }
  return {
    r: (numeric >> 16) & 255,
    g: (numeric >> 8) & 255,
    b: numeric & 255,
  };
}

function toRgbaColor(input: string | undefined, alpha: number, fallback: string): string {
  const candidate = typeof input === 'string' ? input : undefined;
  const rgb = (candidate && hexToRgb(candidate)) || hexToRgb(fallback);
  if (!rgb) {
    return `rgba(15, 23, 42, ${alpha})`;
  }
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}
export default function LPViewerClient({
  slug: initialSlug = '',
  shareToken = null,
  initialLp = null,
  initialProducts = [],
}: LPViewerClientProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const initialResolvedSlug = initialSlug || initialLp?.slug || '';
  const [slug, setSlug] = useState(initialResolvedSlug);
  const slugRef = useRef(initialResolvedSlug);
  const shareTokenRef = useRef<string | null>(shareToken ?? null);
  const [lp, setLp] = useState<LPDetail | null>(initialLp);
  const [isLoading, setIsLoading] = useState(!initialLp);
  const [error, setError] = useState('');
  const [sessionId] = useState(`session-${Date.now()}-${Math.random()}`);
  const viewTrackedRef = useRef(false);
  const viewedStepsRef = useRef<Set<string>>(new Set());
  const [requiredActions, setRequiredActions] = useState<RequiredActionsStatus | null>(null);
  const [showEmailGate, setShowEmailGate] = useState(false);
  const [email, setEmail] = useState('');
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [pointBalance, setPointBalance] = useState(0);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseMethod, setPurchaseMethod] = useState<'points' | 'yen'>('points');
  const swiperRef = useRef<SwiperType | null>(null);
  const [swiperModules, setSwiperModules] = useState<SwiperModule[] | null>(null);
  const [swiperComponents, setSwiperComponents] = useState<{
    Swiper: SwiperComponentType;
    SwiperSlide: SwiperSlideComponentType;
  } | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [showFooterCta, setShowFooterCta] = useState(false);

  const selectedIsPoints = purchaseMethod === 'points';
  const selectedProductPricePoints = selectedProduct?.price_in_points ?? 0;
  const selectedProductPriceYen = selectedProduct?.price_jpy ?? 0;
  const totalPointsCost = selectedProductPricePoints * purchaseQuantity;
  const totalYenCost = selectedProductPriceYen * purchaseQuantity;
  const showPointsOption = !!selectedProduct?.allow_point_purchase;
  const showYenOption = !!selectedProduct?.allow_jpy_purchase;
  const canUsePoints = !!selectedProduct?.allow_point_purchase;
  const canUseYen = !!selectedProduct?.allow_jpy_purchase && selectedProductPriceYen > 0;
  const insufficientPoints = selectedIsPoints && selectedProduct ? pointBalance < totalPointsCost : false;
  const stockLimit = selectedProduct?.stock_quantity ?? null;
  const isTaxInclusive = selectedProduct?.tax_inclusive ?? true;

  const ctasByStep = useMemo(() => {
    if (!lp?.ctas || !Array.isArray(lp.ctas)) {
      return {} as Record<string, CTA[]>;
    }
    const map: Record<string, CTA[]> = {};
    for (const cta of lp.ctas) {
      if (!cta?.step_id) continue;
      if (!map[cta.step_id]) {
        map[cta.step_id] = [];
      }
      map[cta.step_id].push(cta);
    }
    return map;
  }, [lp?.ctas]);
  const primaryTargetId = useMemo(() => {
    if (lp?.linked_salon?.id) {
      return lp.linked_salon.id;
    }
    if (lp?.product_id) {
      return lp.product_id;
    }
    if (products.length > 0) {
      return String(products[0].id);
    }
    return undefined;
  }, [lp?.linked_salon?.id, lp?.product_id, products]);

  const footerCtaConfig = useMemo<FooterCTAConfig | null>(() => {
    if (!lp?.footer_cta_config) {
      return null;
    }
    return lp.footer_cta_config as FooterCTAConfig;
  }, [lp?.footer_cta_config]);

  const footerCtaColors = useMemo(() => {
    const background = footerCtaConfig?.backgroundColor || '#0F172A';
    const buttonBackground = footerCtaConfig?.buttonBackgroundColor || '#2563EB';
    return {
      background,
      text: footerCtaConfig?.textColor || '#FFFFFF',
      buttonBackground,
      buttonText: footerCtaConfig?.buttonTextColor || '#FFFFFF',
      ghostBackground: toRgbaColor(background, 0.65, '#0F172A'),
      ghostButtonBackground: toRgbaColor(buttonBackground, 0.9, '#2563EB'),
    };
  }, [
    footerCtaConfig?.backgroundColor,
    footerCtaConfig?.buttonBackgroundColor,
    footerCtaConfig?.buttonTextColor,
    footerCtaConfig?.textColor,
  ]);

  const finalSlideIndex = useMemo(() => {
    if (!lp?.steps || lp.steps.length === 0) {
      return -1;
    }
    return lp.steps.length - 1;
  }, [lp?.steps]);

  const shouldShowHeroCta = Boolean(footerCtaConfig?.showOnHero) && activeSlideIndex === 0 && !showFooterCta;

  // ハプティックフィードバック（振動）
  const triggerHapticFeedback = (style: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 20,
        heavy: 30,
      };
      navigator.vibrate(patterns[style]);
    }
    // iOS用のハプティックフィードバック（iOS 13+）
    if ('ontouchstart' in window && (window as any).Taptic) {
      try {
        (window as any).Taptic.impact(style);
      } catch (e) {
        // Taptic APIが利用できない場合は無視
      }
    }
  };

  const renderFooterCta = (variant: 'solid' | 'ghost') => {
    if (!footerCtaConfig) {
      return null;
    }

    const isVisible = variant === 'solid' ? showFooterCta : shouldShowHeroCta;
    const containerZIndex = variant === 'solid' ? 'z-40' : 'z-30';
    const backgroundColor =
      variant === 'solid' ? footerCtaColors.background : footerCtaColors.ghostBackground;
    const buttonBackground =
      variant === 'solid'
        ? footerCtaColors.buttonBackground
        : footerCtaColors.ghostButtonBackground;
    const buttonShadow =
      variant === 'solid'
        ? '0 10px 30px -12px rgba(15, 23, 42, 0.45)'
        : '0 14px 32px -18px rgba(15, 23, 42, 0.65)';
    const subtitleOpacity = variant === 'ghost' ? 0.82 : 0.78;

    return (
      <div
        className={`pointer-events-none fixed inset-x-0 bottom-0 ${containerZIndex} transition-transform duration-300 ease-out`}
        style={{ transform: isVisible ? 'translateY(0%)' : 'translateY(105%)' }}
      >
        <div
          className="pointer-events-auto w-full"
          style={{
            backgroundColor,
            color: footerCtaColors.text,
            paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
            backdropFilter: variant === 'ghost' ? 'blur(14px)' : undefined,
            borderTop: variant === 'ghost' ? '1px solid rgba(255,255,255,0.24)' : undefined,
          }}
        >
          <div className="mx-auto flex w-full max-w-screen-xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-8">
            <div className="flex-1 space-y-1">
              {footerCtaConfig.title ? (
                <h3 className="text-base font-semibold leading-tight sm:text-lg">
                  {footerCtaConfig.title}
                </h3>
              ) : null}
              {footerCtaConfig.subtitle ? (
                <p className="text-sm leading-snug" style={{ opacity: subtitleOpacity }}>
                  {footerCtaConfig.subtitle}
                </p>
              ) : null}
            </div>
            {footerCtaConfig.buttonLabel && footerCtaConfig.buttonUrl ? (
              <a
                href={footerCtaConfig.buttonUrl}
                className="inline-flex w-full items-center justify-center rounded-md px-5 py-3 text-sm font-semibold transition-transform hover:scale-[1.015] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:w-auto"
                style={{
                  backgroundColor: buttonBackground,
                  color: footerCtaColors.buttonText,
                  boxShadow: buttonShadow,
                  opacity: variant === 'ghost' ? 0.94 : 1,
                }}
                onClick={() => triggerHapticFeedback('medium')}
              >
                {footerCtaConfig.buttonLabel}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    let mounted = true;

    const loadSwiperCore = async () => {
      try {
        const [{ Pagination, Mousewheel, Keyboard, FreeMode, EffectCreative }, components] = await Promise.all([
          import('swiper/modules'),
          import('swiper/react'),
        ]);

        if (!mounted) {
          return;
        }

        setSwiperModules([Pagination, Mousewheel, Keyboard, FreeMode, EffectCreative]);
        setSwiperComponents({ Swiper: components.Swiper, SwiperSlide: components.SwiperSlide });
      } catch (err) {
        console.error('Failed to load Swiper core modules:', err);
      }
    };

    loadSwiperCore();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setLp(initialLp ?? null);
    setProducts(initialProducts ?? []);
    setIsLoading(!initialLp);
    setError('');
    setActiveSlideIndex(0);
    setShowFooterCta(false);

    const nextSlug = initialSlug || initialLp?.slug || '';
    if (nextSlug) {
      slugRef.current = nextSlug;
      setSlug((prev) => (prev === nextSlug ? prev : nextSlug));
    }

    shareTokenRef.current = shareToken ?? null;
  }, [initialLp, initialProducts, initialSlug, shareToken]);

  useEffect(() => {
    if (!footerCtaConfig) {
      setShowFooterCta(false);
      return;
    }
    const swiper = swiperRef.current;
    if (!swiper) {
      return;
    }
    if (finalSlideIndex < 0) {
      setShowFooterCta(false);
      return;
    }
    setShowFooterCta(swiper.activeIndex === finalSlideIndex);
  }, [footerCtaConfig, finalSlideIndex]);

  useEffect(() => {
    if (!lp?.steps?.length) {
      return;
    }
    if (!swiperRef.current) {
      return;
    }
    try {
      swiperRef.current.updateSlides();
      swiperRef.current.update();
    } catch (err) {
      console.error('Failed to update swiper slides:', err);
    }
  }, [lp?.steps, swiperModules, swiperComponents]);

  useEffect(() => {
    viewTrackedRef.current = false;
    viewedStepsRef.current = new Set();

    fetchLP();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSlug, shareToken]);

  useEffect(() => {
    if (!slug || !slugRef.current) {
      return;
    }
    checkRequiredActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    slugRef.current = slug;
  }, [slug]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPointBalance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, slug]);

  const fetchLP = async () => {
    try {
      const token = shareTokenRef.current;
      const identifier = token ?? slugRef.current;
      if (!identifier) {
        setError('LPが見つかりませんでした');
        setIsLoading(false);
        return;
      }

      const fetcher = token ? fetchLandingPageByShareToken : fetchLandingPage;

      const lpData = await fetcher(identifier, {
        trackView: !viewTrackedRef.current,
        sessionId,
      });
      const steps = Array.isArray(lpData?.steps) ? lpData.steps : [];
      const sortedSteps = [...steps].sort((a, b) => a.step_order - b.step_order);

      // 第1層フィルタ：有効なコンテンツを持つステップのみ
      const validSteps = sortedSteps.filter((step) => {
        const hasValidBlockType = typeof step.block_type === 'string' && step.block_type.trim().length > 0;
        const hasValidImageUrl = typeof step.image_url === 'string' && step.image_url.trim().length > 0;
        return hasValidBlockType || hasValidImageUrl;
      });

      if (!viewTrackedRef.current) {
        viewTrackedRef.current = true;
      }

      const footerConfig =
        lpData && typeof lpData.footer_cta_config === 'object' && lpData.footer_cta_config !== null
          ? (lpData.footer_cta_config as FooterCTAConfig)
          : null;
      const floatingCtaEnabled =
        typeof lpData?.floating_cta === 'boolean'
          ? lpData.floating_cta
          : Boolean(footerConfig);

      const newLp = {
        ...lpData,
        steps: validSteps,
        footer_cta_config: footerConfig,
        floating_cta: floatingCtaEnabled,
      };

      const nextSlug = typeof lpData?.slug === 'string' ? lpData.slug : slugRef.current;
      if (nextSlug) {
        slugRef.current = nextSlug;
        setSlug((prev) => (prev === nextSlug ? prev : nextSlug));
      }

      if (validSteps[0]) {
        recordStepViewOnce(validSteps[0].id);
      }

      setLp(newLp);
      setActiveSlideIndex(0);
      setShowFooterCta(false);
      setIsLoading(false);

      if (lpData?.linked_salon) {
        setProducts([]);
      } else if (lpData?.id) {
        fetchProducts(lpData.id);
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
      const response = await fetchPublicProducts({ lp_id: lpId, limit: 20 });
      const payload = response?.data ?? response;
      const productsData = Array.isArray(payload?.data)
        ? (payload.data as Array<Record<string, any>>)
        : Array.isArray(payload?.products)
        ? (payload.products as Array<Record<string, any>>)
        : Array.isArray(payload)
        ? (payload as Array<Record<string, any>>)
        : [];

      const mappedProducts: Product[] = productsData
        .map((item) => {
          if (!item) return null;
          const pricePointsRaw = item.price_in_points;
          const priceYenRaw = item.price_jpy;
          const taxRateRaw = item.tax_rate;
          const stockRaw = item.stock_quantity;
          const createdAt = typeof item.created_at === 'string' ? item.created_at : new Date().toISOString();
          const updatedAt = typeof item.updated_at === 'string' ? item.updated_at : createdAt;

          return {
            id: String(item.id ?? ''),
            seller_id: String(item.seller_id ?? ''),
            lp_id: item.lp_id ?? undefined,
            product_type: (item.product_type as 'points' | 'salon') ?? 'points',
            salon_id: item.salon_id ?? undefined,
            title: item.title ?? '',
            description: item.description ?? undefined,
            price_in_points: Number.isFinite(Number(pricePointsRaw)) ? Number(pricePointsRaw) : 0,
            price_jpy: Number.isFinite(Number(priceYenRaw)) ? Number(priceYenRaw) : null,
            allow_point_purchase: Boolean(item.allow_point_purchase ?? false),
            allow_jpy_purchase: Boolean(item.allow_jpy_purchase ?? false),
            tax_rate: taxRateRaw === null || taxRateRaw === undefined ? undefined : Number(taxRateRaw),
            tax_inclusive: Boolean(item.tax_inclusive ?? true),
            stock_quantity:
              stockRaw === null || stockRaw === undefined || stockRaw === ''
                ? null
                : Number(stockRaw),
            is_available: Boolean(item.is_available ?? false),
            total_sales: Number.isFinite(Number(item.total_sales)) ? Number(item.total_sales) : 0,
            created_at: createdAt,
            updated_at: updatedAt,
          } as Product;
        })
        .filter((product): product is Product => product !== null && product.is_available);

      setProducts(mappedProducts);
    } catch (error) {
      console.error('❌ Failed to fetch products:', error);
    }
  };

  const fetchPointBalance = async () => {
    try {
      const response = await fetchPointsBalance();
      const balance = response?.point_balance || 0;
      setPointBalance(balance);
    } catch (error) {
      console.error('❌ Failed to fetch point balance:', error);
    }
  };

  const handleOpenPurchaseModal = (product: Product) => {
    
    if (!isAuthenticated) {
      if (confirm('商品を購入するにはログインが必要です。ログインページに移動しますか？')) {
        redirectToLogin(router);
      }
      return;
    }
    
    if (!product.allow_point_purchase && !product.allow_jpy_purchase) {
      alert('現在この商品は購入できません。販売者にお問い合わせください。');
      return;
    }

    if (
      product.stock_quantity !== null &&
      product.stock_quantity !== undefined &&
      product.stock_quantity <= 0
    ) {
      alert('申し訳ありませんが、この商品は在庫切れです。');
      return;
    }

    setSelectedProduct(product);
    setPurchaseQuantity(1);
    if (product.allow_point_purchase) {
      setPurchaseMethod('points');
    } else {
      setPurchaseMethod('yen');
    }
    setShowPurchaseModal(true);
  };

  const handleProductButtonClick = (productId?: string) => {
    if (lp?.linked_salon?.public_path) {
      router.push(lp.linked_salon.public_path);
      return;
    }

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

    const isPointsPurchase = purchaseMethod === 'points';
    const totalPointsCost = selectedProduct.price_in_points * purchaseQuantity;
    const totalYenCost = (selectedProduct.price_jpy ?? 0) * purchaseQuantity;

    if (isPointsPurchase) {
      if (!selectedProduct.allow_point_purchase) {
        alert('この商品はポイント決済に対応していません。');
        return;
      }
      if (pointBalance < totalPointsCost) {
        alert('ポイントが不足しています。ポイントを購入してから再度お試しください。');
        return;
      }
    } else {
      if (!selectedProduct.allow_jpy_purchase || totalYenCost <= 0) {
        alert('この商品は日本円決済に対応していません。');
        return;
      }
    }

    setIsPurchasing(true);
    try {
      const response = await purchaseProduct(selectedProduct.id, {
        quantity: purchaseQuantity,
        payment_method: purchaseMethod,
      });

      if (isPointsPurchase) {
        setShowPurchaseModal(false);

        const payload = response || {};
        const nested = (payload as Record<string, any>)?.data || {};

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
      } else {
        const checkoutUrl = (response as Record<string, any>)?.checkout_url;
        if (checkoutUrl) {
          alert('決済ページに移動します。完了後にブラウザに戻ってください。');
          window.location.href = checkoutUrl;
        } else {
          alert('決済ページの生成に失敗しました。時間をおいて再度お試しください。');
        }
      }
    } catch (error: any) {
      console.error('❌ Purchase error:', error);

      const errorDetail =
        (error?.payload && typeof error.payload === 'object'
          ? (error.payload as Record<string, any>).detail
          : undefined) ?? error?.message ?? '購入に失敗しました。もう一度お試しください。';
      alert(errorDetail);
    } finally {
      setIsPurchasing(false);
    }
  };

  const checkRequiredActions = async () => {
    try {
      const currentSlug = slugRef.current;
      if (!currentSlug) {
        return;
      }
      const response = await fetchRequiredActions(currentSlug, sessionId);
      setRequiredActions(response);

      if (!response?.all_completed) {
        const emailAction = Array.isArray(response?.required_actions)
          ? response.required_actions.find(
              (a: any) =>
                a?.action_type === 'email' &&
                Array.isArray(response?.completed_actions) &&
                !response.completed_actions.includes(a.id)
            )
          : undefined;
        if (emailAction) {
          setShowEmailGate(true);
        }
      }
    } catch (err) {
      console.error('Failed to check required actions:', err);
    }
  };

  const enqueueAnalyticsTask = (task: () => Promise<void>, label: string) => {
    const runner = () => {
      task().catch((err) => {
        console.error(label, err);
      });
    };

    if (typeof window !== 'undefined' && typeof (window as any).requestIdleCallback === 'function') {
      (window as any).requestIdleCallback(runner);
    } else {
      setTimeout(runner, 0);
    }
  };

  const recordStepViewOnce = (stepId: string | undefined) => {
    if (!stepId) return;
    if (viewedStepsRef.current.has(stepId)) return;
    viewedStepsRef.current.add(stepId);
    enqueueAnalyticsTask(
      async () => {
        const currentSlug = slugRef.current;
        if (!currentSlug) return;
        await recordStepView(currentSlug, {
          stepId,
          sessionId,
        });
      },
      'Failed to record step view:'
    );
  };

  const handleRecordCtaClick = (stepId: string | undefined, ctaId?: string) => {
    if (!stepId) return;
    enqueueAnalyticsTask(
      async () => {
        const currentSlug = slugRef.current;
        if (!currentSlug) return;
        await recordCtaClick(currentSlug, {
          stepId,
          ctaId,
          sessionId,
        });
      },
      'Failed to record CTA click:'
    );
  };

  const handleSlideChange = (swiper: SwiperType) => {
    setActiveSlideIndex(swiper.activeIndex);
    if (!lp) return;

    if (swiper.previousIndex !== swiper.activeIndex) {
      triggerHapticFeedback('light');
    }

    const currentStep = lp.steps[swiper.activeIndex];
    if (currentStep) {
      recordStepViewOnce(currentStep.id);
    }

    if (
      swiper.previousIndex !== swiper.activeIndex &&
      swiper.previousIndex >= 0 &&
      swiper.previousIndex < lp.steps.length
    ) {
      const previousStep = lp.steps[swiper.previousIndex];
      if (previousStep) {
        enqueueAnalyticsTask(
          async () => {
            const currentSlug = slugRef.current;
            if (!currentSlug) return;
            await recordStepExit(currentSlug, {
              stepId: previousStep.id,
              sessionId,
            });
          },
          'Failed to record step exit:'
        );
      }
    }

    if (!footerCtaConfig) {
      if (showFooterCta) {
        setShowFooterCta(false);
      }
    } else if (finalSlideIndex >= 0) {
      setShowFooterCta(swiper.activeIndex === finalSlideIndex);
    }
  };

  useEffect(() => {
    const swiperInstance = swiperRef.current;
    if (!swiperInstance) return;

    const restoreTouchMove = () => {
      const instance = swiperRef.current;
      if (instance) {
        instance.allowTouchMove = true;
      }
    };

    const updateAllowance = (element: HTMLElement) => {
      const instance = swiperRef.current;
      if (!instance) return;

      const isScrollable = element.scrollHeight - element.clientHeight > 2;
      if (!isScrollable) {
        instance.allowTouchMove = true;
        return;
      }

      const atTop = element.scrollTop <= 0;
      const atBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 2;
      instance.allowTouchMove = atTop || atBottom;
    };

    const scrollContainers = Array.from(swiperInstance.slides || [])
      .map((slide) => slide.querySelector<HTMLElement>('.lp-slide-clean-inner'))
      .filter((node): node is HTMLElement => Boolean(node));

    if (scrollContainers.length === 0) {
      return;
    }

    const handleTouchStart = (event: Event) => {
      updateAllowance(event.currentTarget as HTMLElement);
    };

    const handleScroll = (event: Event) => {
      updateAllowance(event.currentTarget as HTMLElement);
    };

    scrollContainers.forEach((element) => {
      element.addEventListener('touchstart', handleTouchStart, { passive: true });
      element.addEventListener('touchmove', handleScroll, { passive: true });
      element.addEventListener('scroll', handleScroll, { passive: true });
      element.addEventListener('touchend', restoreTouchMove, { passive: true });
      element.addEventListener('touchcancel', restoreTouchMove, { passive: true });
      element.addEventListener('mouseleave', restoreTouchMove);
    });

    return () => {
      scrollContainers.forEach((element) => {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchmove', handleScroll);
        element.removeEventListener('scroll', handleScroll);
        element.removeEventListener('touchend', restoreTouchMove);
        element.removeEventListener('touchcancel', restoreTouchMove);
        element.removeEventListener('mouseleave', restoreTouchMove);
      });
      restoreTouchMove();
    };
  }, [lp?.steps?.length, lp?.swipe_direction, isLoading]);

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      const currentSlug = slugRef.current;
      if (!currentSlug) {
        throw new Error('LP slug is not available');
      }
      await submitEmailCapture(currentSlug, {
        email,
        sessionId,
      });
      
      setShowEmailGate(false);
      await checkRequiredActions();
      alert('メールアドレスが登録されました！');
    } catch (err: any) {
      const detail =
        (err?.payload && typeof err.payload === 'object'
          ? (err.payload as Record<string, any>).detail
          : undefined) ?? err?.message ?? 'メールアドレスの登録に失敗しました';
      alert(detail);
    }
  };

  const getStepBackgroundStyle = (step: any) => {
    if (!step?.content_data || typeof step.content_data !== 'object') {
      return undefined;
    }

    // 手書き風ブロックは常に白背景
    const blockType = typeof step.block_type === 'string' ? step.block_type : '';
    if (blockType.startsWith('handwritten-')) {
      return '#FFFFFF';
    }

    const content = step.content_data as Record<string, any>;
    const backgroundStyle = typeof content.backgroundStyle === 'string' ? content.backgroundStyle.toLowerCase() : undefined;
    if (backgroundStyle === 'none') {
      return undefined;
    }
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

  if (isLoading) {
    return <PageLoader />;
  }

  if (!swiperModules || !swiperComponents) {
    return <PageLoader />;
  }
  const { Swiper, SwiperSlide } = swiperComponents;

  if (error || !lp) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">{error || 'LPが見つかりませんでした'}</div>
      </div>
    );
  }

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

      <div className="h-screen w-full bg-black overflow-hidden">
        <Swiper
          direction={lp.swipe_direction === 'vertical' ? 'vertical' : 'horizontal'}
          slidesPerView={1}
          speed={350}
          touchRatio={0.9}
          threshold={10}
          shortSwipes={true}
          longSwipes={true}
          longSwipesRatio={0.45}
          resistance={true}
          resistanceRatio={0.8}
          touchStartPreventDefault={false}
          simulateTouch={true}
          followFinger={true}
          touchStartForcePreventDefault={false}
          
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
              translate: lp.swipe_direction === 'vertical' ? [0, '-20%', -1] : ['-20%', 0, -1],
              scale: 0.95,
              opacity: 0.8,
            },
            next: {
              translate: lp.swipe_direction === 'vertical' ? [0, '100%', 0] : ['100%', 0, 0],
            },
          }}
          
          mousewheel={{
            releaseOnEdges: true,
            forceToAxis: true,
            sensitivity: 0.6,
            thresholdDelta: 30,
          }}
          keyboard={{
            enabled: true,
            onlyInViewport: true,
          }}
          pagination={{ 
            clickable: true,
            dynamicBullets: true,
            dynamicMainBullets: 3,
          }}
          observer
          observeParents
          observeSlideChildren
          modules={swiperModules}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            try {
              swiper.updateSlides();
              swiper.update();
            } catch (err) {
              console.error('Swiper update failed on mount:', err);
            }
            handleSlideChange(swiper);
          }}
          onSlideChange={handleSlideChange}
          onTouchStart={() => {
            triggerHapticFeedback('light');
          }}
          className="h-full w-full"
        >
          {lp.steps.length > 0 && (() => {
            return null;
          })()}
          {lp.steps.map((step, index) => {
              const slideBackground = getStepBackgroundStyle(step);
              const blockType = typeof step.block_type === 'string' ? step.block_type : '';
              const isFullBleedBlock = blockType === 'top-hero-1' || blockType === 'top-hero-image-1';
              const isLastSlide = index === finalSlideIndex;
              const slideInnerStyle =
                isLastSlide && footerCtaConfig
                  ? { paddingBottom: 'calc(112px + env(safe-area-inset-bottom, 24px))' }
                  : undefined;

              const slideClassName = `lp-slide-clean${isFullBleedBlock ? ' lp-slide-clean--full' : ''}`;
              const contentClassName = `lp-slide-clean-content${isFullBleedBlock ? ' lp-slide-clean-content--full' : ''}`;
              const innerClassName = `lp-slide-clean-inner${isFullBleedBlock ? ' lp-slide-clean-inner--full' : ''}`;

            return (
              <SwiperSlide key={step.id}>
                <div
                  className={slideClassName}
                  style={slideBackground ? { background: slideBackground } : undefined}
                >
                  <div className={contentClassName}>
                    <div className={innerClassName} style={slideInnerStyle}>
                      {step.block_type && step.content_data ? (
                        <ViewerBlockRenderer
                          blockType={step.block_type}
                          content={step.content_data}
                          productId={primaryTargetId}
                          onProductClick={handleProductButtonClick}
                          ctaIds={(ctasByStep[step.id] ?? []).map((cta) => cta.id)}
                          onCtaClick={(ctaId) => handleRecordCtaClick(step.id, ctaId)}
                        />
                      ) : step.image_url ? (
                        <div
                          className="absolute inset-0 bg-cover bg-center"
                          style={{ backgroundImage: `url(${step.image_url})` }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-900">
                          <p className="text-gray-500 text-lg">コンテンツがありません</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {index === 0 && lp.show_swipe_hint && (
                  <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center text-white/80 gap-1 animate-bounce z-20">
                    <span className="text-4xl">
                      {lp.swipe_direction === 'vertical' ? (
                        <ArrowDownIcon className="h-8 w-8" aria-hidden="true" />
                      ) : (
                        <ArrowRightIcon className="h-8 w-8" aria-hidden="true" />
                      )}
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
      {footerCtaConfig?.showOnHero ? renderFooterCta('ghost') : null}
      {footerCtaConfig ? renderFooterCta('solid') : null}
      {showPurchaseModal && selectedProduct && (
        <div className="fixed inset-0 z-[60] flex items-start sm:items-center justify-center overflow-y-auto bg-black/60 backdrop-blur-sm px-4 py-6 sm:py-10 animate-in fade-in duration-200">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 sm:max-h-[90vh] flex flex-col">
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
                <div
                  className={`flex items-center gap-2 ${selectedIsPoints ? 'text-blue-100' : 'text-emerald-100'}`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">
                    {selectedIsPoints ? 'ポイント決済' : '日本円決済'}
                  </span>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-6 sm:flex-1 sm:overflow-y-auto">
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
              <div className="space-y-4 mb-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  {showPointsOption && (
                    <button
                      type="button"
                      onClick={() => setPurchaseMethod('points')}
                      className={`rounded-lg border px-4 py-3 text-left transition ${
                        selectedIsPoints
                          ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_0_1px_rgba(59,130,246,0.3)]'
                          : 'border-gray-200 bg-white hover:border-blue-400/80'
                      }`}
                    >
                      <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gray-500">
                        ポイント決済
                      </div>
                      <div className="mt-2 text-2xl font-bold text-blue-600">
                        {selectedProductPricePoints.toLocaleString()}{' '}
                        <span className="text-base text-blue-400">PT</span>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">保有ポイントから差し引かれます</div>
                    </button>
                  )}
                  {showYenOption && (
                    <button
                      type="button"
                      onClick={() => canUseYen && setPurchaseMethod('yen')}
                      className={`rounded-lg border px-4 py-3 text-left transition ${
                        !selectedIsPoints
                          ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_0_1px_rgba(16,185,129,0.3)]'
                          : 'border-gray-200 bg-white hover:border-emerald-400/80'
                      } ${!canUseYen ? 'opacity-60 cursor-not-allowed' : ''}`}
                      disabled={!canUseYen}
                    >
                      <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gray-500">
                        日本円決済
                      </div>
                      <div className="mt-2 text-2xl font-bold text-emerald-600">
                        {canUseYen ? (
                          <>
                            {selectedProductPriceYen.toLocaleString()}{' '}
                            <span className="text-base text-emerald-400">円</span>
                          </>
                        ) : (
                          <span className="text-sm text-emerald-500">価格未設定</span>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {isTaxInclusive ? '税込価格で表示されています' : '税抜価格で表示されています'}
                      </div>
                    </button>
                  )}
                </div>

                <div className="bg-gradient-to-r from-gray-50 to-white rounded-lg p-4 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span className="font-medium">単価</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {selectedIsPoints
                        ? `${selectedProductPricePoints.toLocaleString()} P`
                        : canUseYen
                          ? `${selectedProductPriceYen.toLocaleString()} 円`
                          : '未設定'}
                    </span>
                  </div>
                </div>

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
                        min={1}
                        max={stockLimit !== null ? Math.max(1, stockLimit) : undefined}
                        value={purchaseQuantity}
                        onChange={(e) => {
                          const nextValue = Math.max(1, parseInt(e.target.value, 10) || 1);
                          const limitedValue = stockLimit !== null ? Math.min(Math.max(1, stockLimit), nextValue) : nextValue;
                          setPurchaseQuantity(limitedValue);
                        }}
                        className="w-16 px-3 py-2 border-2 border-gray-200 rounded-lg text-center font-bold text-gray-900 focus:border-blue-500 focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          const nextValue = purchaseQuantity + 1;
                          if (stockLimit !== null) {
                            setPurchaseQuantity(Math.min(Math.max(1, stockLimit), nextValue));
                          } else {
                            setPurchaseQuantity(nextValue);
                          }
                        }}
                        className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center text-gray-700 font-bold"
                      >
                        ＋
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  className={`rounded-lg p-4 border-2 ${
                    selectedIsPoints
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
                      : 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`flex items-center gap-2 ${selectedIsPoints ? 'text-blue-900' : 'text-emerald-900'}`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span className="font-bold text-lg">合計金額</span>
                    </div>
                    <span className={`text-2xl font-bold ${selectedIsPoints ? 'text-blue-600' : 'text-emerald-600'}`}>
                      {selectedIsPoints
                        ? `${totalPointsCost.toLocaleString()} P`
                        : canUseYen
                          ? `${totalYenCost.toLocaleString()} 円`
                          : '未設定'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Balance Info */}
              {selectedIsPoints ? (
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
                      <span className={`font-bold text-lg ${insufficientPoints ? 'text-red-400' : 'text-green-400'}`}>
                        {(pointBalance - totalPointsCost).toLocaleString()} P
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-emerald-100 via-white to-emerald-50 rounded-xl p-5 mb-6 text-emerald-900 border border-emerald-200 shadow-inner">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .672-3 1.5S10.343 11 12 11s3 .672 3 1.5S13.657 14 12 14s-3 .672-3 1.5S10.343 17 12 17s3-.672 3-1.5" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2m0 16v-2m7-7h2M3 12H1m18.364 6.364l-1.414-1.414M5.05 5.05L3.636 3.636m12.728 0l1.414 1.414M5.05 18.95l-1.414 1.414" />
                      </svg>
                      <span className="font-semibold">決済について</span>
                    </div>
                    <p className="text-sm leading-relaxed">
                      日本円での決済は外部サービス（one.lat）で完了します。ボタンを押すと決済ページへ移動しますので、手続きを完了させてください。
                    </p>
                    <div className="flex items-center justify-between rounded-lg bg-white/70 px-4 py-3 text-sm font-semibold">
                      <span>お支払い金額</span>
                      <span>{canUseYen ? `${totalYenCost.toLocaleString()} 円` : '未設定'}</span>
                    </div>
                    <div className="text-xs text-emerald-700">
                      決済完了後に自動的にコンテンツが付与されます。ブラウザを閉じずに決済を完了してください。
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {selectedIsPoints && insufficientPoints && (
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
                        不足: {(totalPointsCost - pointBalance).toLocaleString()} P
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
                    (selectedIsPoints && insufficientPoints) ||
                    (!selectedIsPoints && !canUseYen)
                  }
                  className={`flex-1 px-6 py-4 text-white rounded-xl font-bold text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 ${
                    selectedIsPoints
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40'
                  }`}
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
                      {selectedIsPoints ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .672-3 1.5S10.343 11 12 11s3 .672 3 1.5S13.657 14 12 14s-3 .672-3 1.5S10.343 17 12 17s3-.672 3-1.5" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2m0 16v-2m7-7h2M3 12H1m18.364 6.364l-1.414-1.414M5.05 5.05L3.636 3.636m12.728 0l1.414 1.414M5.05 18.95l-1.414 1.414" />
                        </svg>
                      )}
                      {selectedIsPoints ? 'ポイントで購入' : '日本円で購入'}
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
              <p className="mt-4 text-[11px] leading-relaxed text-gray-500 text-center">
                デジタルコンテンツの性質上、購入完了後のポイントおよび提供済みコンテンツはキャンセルできません。
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
