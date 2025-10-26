'use client';

import { PageLoader } from '@/components/LoadingSpinner';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArchiveBoxIcon, CubeTransparentIcon, FireIcon } from '@heroicons/react/24/outline';
import { productApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const { user } = useAuthStore();

  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const response = await productApi.get(productId);
      setProduct(response.data);
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
      router.push('/login');
      return;
    }

    // 購入確認ダイアログ
    const totalPrice = product.price_in_points * quantity;
    const confirmMessage = `以下の商品を購入しますか？\n\n` +
      `商品名: ${product.title}\n` +
      `単価: ${product.price_in_points.toLocaleString()} P\n` +
      `数量: ${quantity}個\n` +
      `合計: ${totalPrice.toLocaleString()} P\n\n` +
      `ポイントが消費されます。よろしいですか？`;

    if (!confirm(confirmMessage)) {
      return; // キャンセルされた
    }

    try {
      setIsPurchasing(true);
      await productApi.purchase(productId, { quantity });
      
      // 購入完了メッセージ
      const successMessage = `購入完了！\n\n` +
        `商品名: ${product.title}\n` +
        `数量: ${quantity}個\n` +
        `使用ポイント: ${totalPrice.toLocaleString()} P\n\n` +
        `ダッシュボードに移動します。`;
      alert(successMessage);
      
      router.push('/dashboard');
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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">商品が見つかりませんでした</p>
          <Link href="/products" className="text-blue-400 hover:text-blue-300">
            商品一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  const totalPrice = product.price_in_points * quantity;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/products" className="text-gray-400 hover:text-white transition-colors text-sm">
              ← 商品一覧に戻る
            </Link>
          </div>
        </div>
      </header>

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  在庫: <span className="font-semibold text-white">{product.stock}</span>
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6 mb-6">
              <div className="text-gray-400 text-sm mb-2">価格</div>
              <div className="text-4xl font-bold text-blue-400 mb-4">
                {product.price_in_points.toLocaleString()} P
              </div>

              {/* Quantity */}
              <div className="mb-4">
                <label className="block text-gray-400 text-sm mb-2">数量</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-center focus:outline-none focus:border-blue-500"
                    min="1"
                    max={product.stock}
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-10 h-10 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-gray-700 pt-4 mb-4">
                <div className="flex items-center justify-between text-lg">
                  <span className="text-gray-400">合計</span>
                  <span className="text-2xl font-bold text-white">
                    {totalPrice.toLocaleString()} P
                  </span>
                </div>
              </div>

              {/* Purchase Button */}
              <button
                onClick={handlePurchase}
                disabled={isPurchasing || product.stock === 0}
                className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPurchasing ? '購入中...' : product.stock === 0 ? '在庫切れ' : '購入する'}
              </button>
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
