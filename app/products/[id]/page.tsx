'use client';

import { PageLoader } from '@/components/LoadingSpinner';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArchiveBoxIcon, CubeTransparentIcon, FireIcon } from '@heroicons/react/24/outline';
import { productApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import StickySiteHeader from '@/components/layout/StickySiteHeader';
import type { Product } from '@/types';
import { redirectToLogin } from '@/lib/navigation';

type ProductDetail = Product & {
  seller_username?: string | null;
  image_url?: string | null;
  additional_info?: string | null;
};

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
      const response = await productApi.get(productId);
      const productData = response.data as ProductDetail;
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
      : `以下の商品を日本円決済で購入しますか？\n\n` +
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
      const response = await productApi.purchase(productId, {
        quantity,
        payment_method: selectedMethod,
      });
      const result = response.data;

      if (isPointsPurchase) {
        const successMessage = `購入完了！\n\n` +
          `商品名: ${product.title}\n` +
          `数量: ${quantity}個\n` +
          `使用ポイント: ${totalPoints.toLocaleString()} P\n\n` +
          `ダッシュボードに移動します。`;
        alert(successMessage);
        router.push('/dashboard');
      } else {
        if (result.checkout_url) {
          alert('決済ページに移動します。完了後に購入履歴をご確認ください。');
          window.location.href = result.checkout_url;
          return;
        }
        alert('決済ページの生成に失敗しました。時間をおいて再度お試しください。');
      }
    } catch (error: any) {
      alert(error.response?.data?.detail || '購入に失敗しました');
    } finally {
      setIsPurchasing(false);
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-950 text-slate-200">
        <StickySiteHeader dark showDashboardLink />
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
          <div className="text-center">
            <p className="mb-4 text-lg text-red-400">商品が見つかりませんでした</p>
            <Link href="/products" className="text-blue-400 transition-colors hover:text-blue-300">
              商品一覧に戻る
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

  return (
    <div className="min-h-screen bg-gray-950 text-slate-100">
      <StickySiteHeader dark showDashboardLink />
      {/* Header */}
      <header className="sticky top-16 z-40 border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/products" className="text-gray-400 hover:text-white transition-colors text-sm">
              ← 商品一覧に戻る
            </Link>
          </div>
        </div>
      </header>

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Image */}
          <div>
            {product.image_url ? (
              <div className="aspect-square bg-gray-900 rounded-lg overflow-hidden">
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-square bg-gray-900 rounded-lg flex items-center justify-center">
                <ArchiveBoxIcon className="h-16 w-16 text-gray-600" aria-hidden="true" />
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div>
            {/* Seller */}
            <Link
              href={`/u/${product.seller_username}`}
              className="inline-flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
                {product.seller_username?.charAt(0).toUpperCase() || 'S'}
              </div>
              <span className="text-blue-400 hover:text-blue-300 text-sm">
                {product.seller_username}
              </span>
            </Link>

            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {product.title}
            </h1>

            <p className="text-gray-300 text-lg mb-6 leading-relaxed">
              {product.description}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-6 mb-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <FireIcon className="h-5 w-5 text-orange-400" aria-hidden="true" />
                <span>
                  <span className="font-semibold text-white">{product.total_sales || 0}</span> 件販売
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CubeTransparentIcon className="h-5 w-5" aria-hidden="true" />
                <span>
                  在庫: <span className="font-semibold text-white">{stockQuantity ?? '無制限'}</span>
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6 mb-6">
              <div className="text-gray-400 text-sm mb-3">決済方法</div>

              {canPurchase ? (
                <div className="grid gap-3 sm:grid-cols-2 mb-6">
                  {product.allow_point_purchase && (
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('points')}
                      className={`rounded-lg border px-4 py-3 text-left transition-colors ${
                        isPointsSelected
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-gray-700 bg-gray-900/70 hover:border-blue-500/60'
                      }`}
                    >
                      <div className="text-xs uppercase tracking-wide text-gray-400">ポイント決済</div>
                      <div className="mt-1 text-2xl font-semibold text-blue-300">
                        {product.price_in_points.toLocaleString()} <span className="text-base text-gray-400">PT</span>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">保有ポイントから差し引かれます</div>
                    </button>
                  )}

                  {product.allow_jpy_purchase && (
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('yen')}
                      className={`rounded-lg border px-4 py-3 text-left transition-colors ${
                        !isPointsSelected
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-gray-700 bg-gray-900/70 hover:border-emerald-500/60'
                      }`}
                    >
                      <div className="text-xs uppercase tracking-wide text-gray-400">日本円決済</div>
                      <div className="mt-1 text-2xl font-semibold text-emerald-300">
                        {(product.price_jpy ?? 0).toLocaleString()} <span className="text-base text-gray-400">円</span>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        one.latの決済画面に遷移します{product.tax_inclusive ? '（税込）' : ''}
                      </div>
                    </button>
                  )}
                </div>
              ) : (
                <p className="mb-6 text-sm text-gray-500">
                  現在、この商品は購入できません。
                </p>
              )}

              {canPurchase && (
                <>
                  <div className="mb-4">
                    <label className="block text-gray-400 text-sm mb-2">数量</label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        -
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
                        className="w-20 px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-center focus:outline-none focus:border-blue-500"
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
                        className="w-10 h-10 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-gray-700 pt-4 mb-4">
                    <div className="flex items-center justify-between text-lg">
                      <span className="text-gray-400">合計</span>
                      <span className="text-2xl font-bold text-white">
                        {isPointsSelected
                          ? `${pointsTotal.toLocaleString()} P`
                          : `${yenTotal.toLocaleString()} 円`}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handlePurchase}
                    disabled={
                      isPurchasing ||
                      !methodAvailable ||
                      (stockQuantity !== null && stockQuantity === 0)
                    }
                    className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPurchasing
                      ? '手続き中...'
                      : stockQuantity !== null && stockQuantity === 0
                        ? '在庫切れ'
                        : isPointsSelected
                          ? 'ポイントで購入'
                          : '日本円で購入'}
                  </button>
                </>
              )}
            </div>

            {/* Additional Info */}
            {product.additional_info && (
              <div className="bg-gray-800/30 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">商品詳細</h3>
                <p className="text-gray-400 text-sm whitespace-pre-wrap">
                  {product.additional_info}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
