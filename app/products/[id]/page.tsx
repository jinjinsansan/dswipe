'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArchiveBoxIcon, CubeTransparentIcon, FireIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { productApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import PublicNav from '@/components/PublicNav';
import { Button } from '@/components/ui';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const { user } = useAuthStore();

  const [product, setProduct] = useState<Record<string, any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const response = await productApi.get(productId);
      setProduct(response.data);
    } catch (err) {
      console.error('商品取得エラー:', err);
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
    if (!product) return;

    const totalPrice = product.price_in_points * quantity;
    const confirmMessage =
      `以下の商品を購入しますか？\n\n` +
      `商品名: ${product.title}\n` +
      `単価: ${product.price_in_points.toLocaleString()} P\n` +
      `数量: ${quantity}個\n` +
      `合計: ${totalPrice.toLocaleString()} P\n\n` +
      `ポイントが消費されます。よろしいですか？`;
    if (!confirm(confirmMessage)) return;

    try {
      setIsPurchasing(true);
      await productApi.purchase(productId, { quantity });
      alert(`購入完了！\n\n商品名: ${product.title}\n数量: ${quantity}個\n使用ポイント: ${totalPrice.toLocaleString()} P\n\nダッシュボードに移動します。`);
      router.push('/dashboard');
    } catch (err) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      alert(detail || '購入に失敗しました');
    } finally {
      setIsPurchasing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--canvas)' }}>
        <div className="text-lg" style={{ color: 'var(--muted)' }}>
          読み込み中...
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4" style={{ background: 'var(--canvas)' }}>
        <p className="text-lg" style={{ color: 'var(--danger-ink)' }}>
          商品が見つかりませんでした
        </p>
        <Link href="/products" className="font-semibold" style={{ color: 'var(--brand)' }}>
          マーケットに戻る
        </Link>
      </div>
    );
  }

  const stock = product.stock ?? product.stock_quantity;
  const totalPrice = product.price_in_points * quantity;
  const seller = product.seller_username as string | undefined;

  return (
    <div style={{ background: 'var(--canvas)', color: 'var(--text)', minHeight: '100vh' }}>
      <PublicNav />

      <div className="mx-auto max-w-[1140px] px-6 py-7">
        <Link href="/products" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--muted)' }}>
          <ArrowLeftIcon className="h-4 w-4" />
          マーケットに戻る
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left: media */}
          <div
            className="flex aspect-square items-center justify-center overflow-hidden rounded-[20px]"
            style={{ background: product.image_url ? undefined : 'linear-gradient(150deg,#0b1f3a,#0e7490)' }}
          >
            {product.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.image_url} alt={product.title} className="h-full w-full object-cover" />
            ) : (
              <ArchiveBoxIcon className="h-16 w-16 text-white/70" aria-hidden="true" />
            )}
          </div>

          {/* Right: info */}
          <div>
            {seller && (
              <Link href={`/u/${seller}`} className="mb-4 inline-flex items-center gap-2">
                <span className="avatar h-8 w-8 text-xs">{seller.charAt(0).toUpperCase()}</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--brand)' }}>
                  {seller}
                </span>
              </Link>
            )}

            <h1 className="mb-3 text-3xl font-extrabold tracking-tight sm:text-4xl" style={{ color: 'var(--ink)' }}>
              {product.title}
            </h1>

            {product.description && (
              <p className="mb-6 text-base leading-relaxed" style={{ color: 'var(--text-2)' }}>
                {product.description}
              </p>
            )}

            <div className="mb-6 flex items-center gap-6 text-sm" style={{ color: 'var(--muted)' }}>
              <span className="inline-flex items-center gap-2">
                <FireIcon className="h-5 w-5" style={{ color: '#f59e0b' }} />
                <span>
                  <b style={{ color: 'var(--ink)' }}>{product.total_sales || 0}</b> 件販売
                </span>
              </span>
              <span className="inline-flex items-center gap-2">
                <CubeTransparentIcon className="h-5 w-5" />
                <span>
                  在庫: <b style={{ color: 'var(--ink)' }}>{stock === null || stock === undefined ? '無制限' : stock}</b>
                </span>
              </span>
            </div>

            <div className="card card-pad mb-6">
              <div className="text-sm" style={{ color: 'var(--muted)' }}>
                価格
              </div>
              <div className="mb-4 text-4xl font-extrabold tabular-nums" style={{ color: 'var(--brand)' }}>
                {product.price_in_points.toLocaleString()} P
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-sm" style={{ color: 'var(--muted)' }}>
                  数量
                </label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="btn btn-secondary h-10 w-10 p-0">
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="input w-20 text-center"
                    min={1}
                    max={stock || undefined}
                  />
                  <button
                    onClick={() => setQuantity(stock ? Math.min(stock, quantity + 1) : quantity + 1)}
                    className="btn btn-secondary h-10 w-10 p-0"
                  >
                    ＋
                  </button>
                </div>
              </div>

              <div className="mb-4 flex items-center justify-between border-t pt-4" style={{ borderColor: 'var(--line)' }}>
                <span style={{ color: 'var(--muted)' }}>合計</span>
                <span className="text-2xl font-extrabold tabular-nums" style={{ color: 'var(--ink)' }}>
                  {totalPrice.toLocaleString()} P
                </span>
              </div>

              <Button onClick={handlePurchase} size="lg" block disabled={isPurchasing || stock === 0}>
                {isPurchasing ? '購入中...' : stock === 0 ? '在庫切れ' : '購入する'}
              </Button>
            </div>

            {product.additional_info && (
              <div className="card card-pad">
                <h3 className="mb-2 font-bold" style={{ color: 'var(--ink)' }}>
                  商品詳細
                </h3>
                <p className="whitespace-pre-wrap text-sm" style={{ color: 'var(--text-2)' }}>
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
