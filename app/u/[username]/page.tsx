'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { productApi } from '@/lib/api';
import PublicNav from '@/components/PublicNav';
import { Button } from '@/components/ui';

interface CreatorProduct {
  id: string;
  title: string;
  description?: string;
  price_in_points?: number;
  stock?: number | null;
  stock_quantity?: number | null;
  image_url?: string;
  seller_username?: string;
  is_available?: boolean;
}

const THUMB_GRADIENTS = [
  'linear-gradient(150deg,#0b1f3a,#0e7490)',
  'linear-gradient(150deg,#0284c7,#06b6d4)',
  'linear-gradient(150deg,#7c3aed,#0284c7)',
  'linear-gradient(150deg,#0e7490,#22d3ee)',
];

export default function CreatorProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const [products, setProducts] = useState<CreatorProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const fetchUserProducts = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await productApi.getPublic({ sort: 'latest', limit: 50, seller_username: username });
      const allProducts: CreatorProduct[] = response.data?.data || response.data || [];
      const userProducts = allProducts.filter((p) => !p.seller_username || p.seller_username === username);
      setProducts(userProducts);
    } catch (err) {
      console.error('商品の取得に失敗:', err);
      setError(err instanceof Error ? err.message : '商品の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const activeCount = products.filter((p) => p.is_available !== false).length;

  return (
    <div style={{ background: 'var(--canvas)', color: 'var(--text)', minHeight: '100vh' }}>
      <PublicNav />

      {/* Profile header */}
      <header
        style={{
          color: '#fff',
          background:
            'radial-gradient(700px 320px at 80% -30%, #0e7490 0%, transparent 60%), linear-gradient(150deg, #0b1f3a, #0f2c52)',
        }}
      >
        <div className="mx-auto flex max-w-[1140px] flex-col items-center gap-6 px-6 py-10 sm:flex-row sm:items-end sm:py-12">
          <span
            className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full text-4xl font-extrabold"
            style={{ background: 'linear-gradient(135deg,#22d3ee,#0284c7)', color: '#042032' }}
          >
            {username.charAt(0).toUpperCase()}
          </span>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-extrabold tracking-tight">{username}</h1>
            <div className="mt-3 flex justify-center gap-6 text-sm sm:justify-start">
              <span>
                <b className="text-base">{products.length}</b> <span style={{ color: '#bcd3ee' }}>商品</span>
              </span>
              <span>
                <b className="text-base" style={{ color: '#67e8f9' }}>
                  {activeCount}
                </b>{' '}
                <span style={{ color: '#bcd3ee' }}>販売中</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Products */}
      <div className="mx-auto max-w-[1140px] px-6 py-10">
        <h2 className="mb-6 text-xl font-bold" style={{ color: 'var(--ink)' }}>
          販売中の商品
        </h2>

        {isLoading ? (
          <div className="py-12 text-center text-sm" style={{ color: 'var(--muted)' }}>
            読み込み中...
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-4 py-12">
            <p className="text-sm" style={{ color: 'var(--danger-ink)' }}>
              {error}
            </p>
            <Button variant="secondary" size="sm" onClick={fetchUserProducts}>
              再試行
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="py-12 text-center text-sm" style={{ color: 'var(--muted)' }}>
            まだ商品がありません
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product, i) => (
              <article key={product.id} className="card card-hover flex flex-col overflow-hidden" style={{ padding: 0 }}>
                <Link
                  href={`/products/${product.id}`}
                  className="block h-[130px] overflow-hidden"
                  style={{ background: product.image_url ? undefined : THUMB_GRADIENTS[i % THUMB_GRADIENTS.length] }}
                >
                  {product.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.image_url} alt={product.title} className="h-full w-full object-cover" />
                  )}
                </Link>
                <div className="flex flex-1 flex-col gap-2 px-[15px] pb-[15px] pt-3.5">
                  <Link
                    href={`/products/${product.id}`}
                    className="line-clamp-2 text-[14.5px] font-bold leading-[1.4] hover:text-[color:var(--brand)]"
                    style={{ color: 'var(--ink)' }}
                  >
                    {product.title}
                  </Link>
                  {product.description && (
                    <p className="line-clamp-2 text-xs" style={{ color: 'var(--muted)' }}>
                      {product.description}
                    </p>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-1.5">
                    <span className="text-lg font-extrabold tabular-nums" style={{ color: 'var(--brand)' }}>
                      {(product.price_in_points ?? 0).toLocaleString()}
                      <small className="text-xs"> P</small>
                    </span>
                    <Link href={`/products/${product.id}`} className="btn btn-secondary btn-sm">
                      詳細
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
