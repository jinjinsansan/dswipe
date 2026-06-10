'use client';

import { PageLoader } from '@/components/LoadingSpinner';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArchiveBoxIcon,
  ArrowRightIcon,
  ChevronRightIcon,
  CubeTransparentIcon,
  FireIcon,
  ShieldCheckIcon,
  Square2StackIcon,
} from '@heroicons/react/24/outline';
import { paymentApi } from '@/lib/api';
import { fetchProductDetail, purchaseProduct } from '@/lib/publicClient';
import { useAuthStore } from '@/store/authStore';
import StickySiteHeader from '@/components/layout/StickySiteHeader';
import type { Product } from '@/types';
import { redirectToLogin } from '@/lib/navigation';

/* Momentum product detail — mock: design_handoff_dswipe/D-Swipe Product Detail.html */

type ProductDetail = Product & {
  seller_username?: string | null;
  image_url?: string | null;
  additional_info?: string | null;
  lp_slug?: string | null;
};

import { GRAD_BRAND, NAVY_CARD_BG } from '@/lib/momentum';

const MEDIA_FALLBACK_BG =
  'radial-gradient(420px 320px at 75% 10%, rgba(34,211,238,.35), transparent 60%), linear-gradient(160deg, #0b1f3a, #0e7490)';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const { user } = useAuthStore();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'points' | 'yen'>('points');

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const productData = (await fetchProductDetail(productId)) as ProductDetail;
      setProduct(productData);
      if (productData.allow_point_purchase) {
        setSelectedMethod('points');
      } else if (productData.allow_jpy_purchase) {
        setSelectedMethod('yen');
      } else {
        setSelectedMethod('points');
      }
    } catch (error: any) {
      console.error('商品取得エラー:', error);
      setError('商品の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      alert('ログインが必要です');
      redirectToLogin(router);
      return;
    }

    if (!product) {
      return;
    }

    const stockLimit = typeof product.stock_quantity === 'number' ? product.stock_quantity : undefined;
    if (stockLimit !== undefined && quantity > stockLimit) {
      alert('在庫数を超える購入はできません');
      return;
    }

    const isPointsPurchase = selectedMethod === 'points';

    if (isPointsPurchase && !product.allow_point_purchase) {
      alert('この商品はポイント決済に対応していません');
      return;
    }

    if (!isPointsPurchase && !product.allow_jpy_purchase) {
      alert('この商品は日本円決済に対応していません');
      return;
    }

    const totalPoints = product.price_in_points * quantity;
    const totalYen = (product.price_jpy ?? 0) * quantity;

    const confirmMessage = isPointsPurchase
      ? `以下の商品を購入しますか？\n\n` +
        `商品名: ${product.title}\n` +
        `単価: ${product.price_in_points.toLocaleString()} P\n` +
        `数量: ${quantity}個\n` +
        `合計: ${totalPoints.toLocaleString()} P\n\n` +
        `ポイントが消費されます。よろしいですか？`
      : `保存済みの請求先情報でクイック決済を開始します。\n\n` +
        `商品名: ${product.title}\n` +
        `単価: ${(product.price_jpy ?? 0).toLocaleString()} 円\n` +
        `数量: ${quantity}個\n` +
        `合計: ${totalYen.toLocaleString()} 円\n\n` +
        `決済プロバイダー(one.lat)の画面に移動します。よろしいですか？`;

    if (!confirm(confirmMessage)) {
      return; // キャンセルされた
    }

    try {
      setIsPurchasing(true);
      if (isPointsPurchase) {
        const result = await purchaseProduct(productId, {
          quantity,
          payment_method: selectedMethod,
        });
        const successMessage = `購入完了！\n\n` +
          `商品名: ${product.title}\n` +
          `数量: ${quantity}個\n` +
          `使用ポイント: ${totalPoints.toLocaleString()} P\n\n` +
          `ダッシュボードに移動します。`;
        alert(successMessage);
        router.push('/dashboard');
        return;
      }

      const quickResponse = await paymentApi.quickCheckout({
        item_type: 'product',
        item_id: product.id,
        quantity,
      });
      const { checkout_url: checkoutUrl } = quickResponse.data;
      if (!checkoutUrl) {
        alert('決済ページの生成に失敗しました。時間をおいて再度お試しください。');
        return;
      }
      alert('決済ページに移動します。完了後に購入履歴をご確認ください。');
      window.location.href = checkoutUrl;
      return;
    } catch (error: any) {
      const detail =
        (error?.payload && typeof error.payload === 'object'
          ? (error.payload as Record<string, any>).detail
          : undefined) ?? error?.response?.data?.detail;
      if (detail === '請求先情報を設定してください') {
        alert('先に請求先情報（氏名・メール・電話番号）を登録してください。プロフィール設定画面に移動します。');
        const redirectPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';
        const search = redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : '';
        router.push(`/profile${search}`);
        return;
      }
      alert(detail || '購入に失敗しました');
    } finally {
      setIsPurchasing(false);
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#f4f8fd] text-slate-700">
        <StickySiteHeader showDashboardLink />
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
          <div className="text-center bg-white border border-[#e2ebf6] rounded-2xl shadow-sm px-10 py-12">
            <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
              <ArchiveBoxIcon className="h-8 w-8" aria-hidden="true" />
            </div>
            <p className="mb-4 text-lg font-semibold text-[#0b1f3a]">商品が見つかりませんでした</p>
            <Link href="/products" className="text-sky-600 font-semibold transition-colors hover:text-sky-500">
              マーケットに戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const stockQuantity = product?.stock_quantity ?? null;
  const isPointsSelected = selectedMethod === 'points';
  const pointsTotal = product ? product.price_in_points * quantity : 0;
  const yenTotal = product && product.price_jpy ? product.price_jpy * quantity : 0;
  const canPurchase = Boolean(product?.allow_point_purchase || product?.allow_jpy_purchase);
  const methodAvailable = isPointsSelected
    ? Boolean(product?.allow_point_purchase)
    : Boolean(product?.allow_jpy_purchase && (product?.price_jpy ?? 0) > 0);
  const sellerInitial = product.seller_username?.charAt(0).toUpperCase() || 'S';
  const lpSlug = typeof product.lp_slug === 'string' && product.lp_slug ? product.lp_slug : null;

  return (
    <div className="min-h-screen bg-[#f4f8fd] text-slate-700">
      <StickySiteHeader showDashboardLink />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-[7px] pt-[18px] pb-1.5 text-[13px] text-slate-500">
          <Link href="/products" className="hover:text-sky-600 transition-colors">マーケット</Link>
          <ChevronRightIcon className="w-3.5 h-3.5" aria-hidden="true" />
          <span className="text-slate-700 font-medium line-clamp-1">{product.title}</span>
        </div>

        {/* Product Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start pt-3 pb-16">
          {/* Left: Media */}
          <div className="lg:sticky lg:top-[84px]">
            {product.image_url ? (
              <div className="aspect-square rounded-[20px] overflow-hidden shadow-[0_22px_44px_-24px_rgba(2,132,199,.34)] bg-white">
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div
                className="aspect-square rounded-[20px] overflow-hidden shadow-[0_22px_44px_-24px_rgba(2,132,199,.34)] relative flex items-end p-[26px]"
                style={{ background: MEDIA_FALLBACK_BG }}
              >
                <span className="absolute top-4 left-4 text-[11px] font-bold text-pure-white bg-[rgba(11,31,58,.5)] backdrop-blur-[4px] px-[11px] py-1 rounded-full">
                  {product.is_available !== false ? '販売中' : '停止中'}
                </span>
                <div>
                  <span className="text-xs font-bold tracking-[.14em] uppercase text-pure-white opacity-85">D-Swipe Market</span>
                  <h3 className="text-2xl sm:text-[30px] font-extrabold tracking-tight leading-tight text-pure-white mt-2 [text-shadow:0_2px_14px_rgba(0,0,0,.35)]">
                    {product.title}
                  </h3>
                </div>
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div>
            {/* Seller */}
            {product.seller_username ? (
              <Link
                href={`/u/${product.seller_username}`}
                className="inline-flex items-center gap-[9px] py-1.5 pl-1.5 pr-3 border border-[#e2ebf6] rounded-full bg-white hover:border-[#bfe6fb] transition-colors"
              >
                <span
                  className="w-[30px] h-[30px] rounded-full flex items-center justify-center font-extrabold text-[13px] text-[#042032]"
                  style={{ background: 'linear-gradient(135deg,#22d3ee,#0284c7)' }}
                >
                  {sellerInitial}
                </span>
                <span className="text-[13px] font-bold text-[#0b1f3a] leading-tight">
                  @{product.seller_username}
                  <small className="block font-medium text-slate-500 text-[11px]">クリエイター</small>
                </span>
              </Link>
            ) : null}

            <h1 className="text-2xl sm:text-[30px] font-extrabold tracking-tight text-[#0b1f3a] leading-tight mt-4">
              {product.title}
            </h1>

            {product.description ? (
              <p className="text-[15px] leading-[1.8] text-slate-700 mt-3.5">
                {product.description}
              </p>
            ) : null}

            {/* Stats */}
            <div className="flex items-center gap-[22px] mt-5 text-[13.5px] text-slate-600">
              <span className="inline-flex items-center gap-2">
                <FireIcon className="w-[18px] h-[18px] text-amber-500" aria-hidden="true" />
                <span><b className="text-[#0b1f3a] tabular-nums">{product.total_sales || 0}</b> 件販売</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <CubeTransparentIcon className="w-[18px] h-[18px]" aria-hidden="true" />
                <span>在庫: <b className="text-[#0b1f3a] tabular-nums">{stockQuantity ?? '無制限'}</b></span>
              </span>
            </div>

            {/* Buy box */}
            <div className="bg-white border border-[#e2ebf6] rounded-[20px] shadow-[0_2px_5px_rgba(11,31,58,.05),0_12px_24px_-14px_rgba(11,31,58,.22)] p-[22px] mt-[22px]">
              <div className="text-[12.5px] font-semibold text-slate-500 mb-3">決済方法</div>

              {canPurchase ? (
                <div className="grid gap-3 sm:grid-cols-2 mb-5">
                  {product.allow_point_purchase && (
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('points')}
                      className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                        isPointsSelected
                          ? 'border-sky-600 bg-[#e9f6fe]'
                          : 'border-[#e2ebf6] bg-white hover:border-[#bfe6fb]'
                      }`}
                    >
                      <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">ポイント決済</div>
                      <div className="mt-1 text-2xl font-extrabold text-sky-600 tabular-nums">
                        {product.price_in_points.toLocaleString()} <span className="text-base text-slate-500">P</span>
                      </div>
                      <div className="mt-1 text-xs text-slate-500">保有ポイントから差し引かれます</div>
                    </button>
                  )}

                  {product.allow_jpy_purchase && (
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('yen')}
                      className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                        !isPointsSelected
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-[#e2ebf6] bg-white hover:border-emerald-200'
                      }`}
                    >
                      <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">日本円決済</div>
                      <div className="mt-1 text-2xl font-extrabold text-emerald-600 tabular-nums">
                        {(product.price_jpy ?? 0).toLocaleString()} <span className="text-base text-slate-500">円</span>
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        one.latの決済画面に遷移します{product.tax_inclusive ? '（税込）' : ''}
                      </div>
                    </button>
                  )}
                </div>
              ) : (
                <p className="mb-5 text-sm text-slate-500">
                  現在、この商品は購入できません。
                </p>
              )}

              {canPurchase && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-[13.5px] text-slate-600">数量</span>
                    <div className="inline-flex items-center border border-[#e2ebf6] rounded-[11px] overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-[38px] h-[38px] bg-[#f8fafc] text-[#0b1f3a] text-lg hover:bg-[#e9f6fe] hover:text-sky-600 transition-colors"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => {
                          const nextValue = Math.max(1, parseInt(e.target.value, 10) || 1);
                          if (stockQuantity !== null) {
                            if (stockQuantity === 0) {
                              setQuantity(1);
                            } else {
                              setQuantity(Math.min(stockQuantity, nextValue));
                            }
                          } else {
                            setQuantity(nextValue);
                          }
                        }}
                        className="w-12 text-center border-0 text-[15px] font-bold text-[#0b1f3a] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        min={1}
                        max={stockQuantity !== null && stockQuantity > 0 ? stockQuantity : undefined}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (stockQuantity !== null) {
                            if (stockQuantity === 0) {
                              return;
                            }
                            setQuantity(Math.min(stockQuantity, quantity + 1));
                          } else {
                            setQuantity(quantity + 1);
                          }
                        }}
                        className="w-[38px] h-[38px] bg-[#f8fafc] text-[#0b1f3a] text-lg hover:bg-[#e9f6fe] hover:text-sky-600 transition-colors"
                      >
                        ＋
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#e2ebf6] mt-4 pt-4">
                    <span className="text-sm font-semibold text-[#0b1f3a]">合計</span>
                    <span className="text-2xl font-extrabold text-[#0b1f3a] tabular-nums">
                      {isPointsSelected
                        ? `${pointsTotal.toLocaleString()} P`
                        : `${yenTotal.toLocaleString()} 円`}
                    </span>
                  </div>

                  <button
                    onClick={handlePurchase}
                    disabled={
                      isPurchasing ||
                      !methodAvailable ||
                      (stockQuantity !== null && stockQuantity === 0)
                    }
                    className="w-full mt-4 px-6 py-3.5 text-pure-white rounded-xl font-bold text-base shadow-[0_10px_26px_-8px_rgba(6,182,212,.55)] hover:shadow-[0_18px_48px_-12px_rgba(6,182,212,.5)] transition-shadow disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                    style={{ background: GRAD_BRAND }}
                  >
                    {isPurchasing
                      ? '手続き中...'
                      : stockQuantity !== null && stockQuantity === 0
                        ? '在庫切れ'
                        : isPointsSelected
                          ? 'ポイントで購入'
                          : '保存済み情報でクイック購入'}
                  </button>

                  <div className="flex items-center justify-center gap-[7px] text-xs text-slate-500 mt-3.5">
                    <ShieldCheckIcon className="w-[15px] h-[15px] text-green-600" aria-hidden="true" />
                    プラットフォーム内決済で安全に取引できます
                  </div>
                </>
              )}
            </div>

            {/* Additional Info */}
            {product.additional_info && (
              <div className="mt-6">
                <h3 className="text-lg font-bold text-[#0b1f3a] mb-3">商品詳細</h3>
                <div className="bg-white border border-[#e2ebf6] rounded-2xl p-5 shadow-sm">
                  <p className="text-sm leading-[1.85] text-slate-700 whitespace-pre-wrap">
                    {product.additional_info}
                  </p>
                </div>
              </div>
            )}

            {/* LP link */}
            {lpSlug && (
              <Link
                href={`/view/${lpSlug}`}
                className="flex items-center gap-3.5 rounded-2xl px-5 py-[18px] mt-6 text-pure-white shadow-[0_22px_44px_-24px_rgba(2,132,199,.34)] hover:opacity-95 transition-opacity"
                style={{ background: NAVY_CARD_BG }}
              >
                <span className="w-[42px] h-[42px] rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Square2StackIcon className="w-[22px] h-[22px]" aria-hidden="true" />
                </span>
                <span>
                  <b className="block text-[14.5px]">この商品のLPを見る</b>
                  <span className="block text-[12.5px] text-[#bcd3ee] mt-0.5">スワイプLPで商品の詳細を確認できます</span>
                </span>
                <ArrowRightIcon className="w-5 h-5 ml-auto flex-shrink-0" aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
