'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { FireIcon, ClockIcon, MagnifyingGlassIcon, UsersIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { productApi } from '@/lib/api';
import PublicNav from '@/components/PublicNav';
import { cn } from '@/lib/utils';

interface PublicProduct {
  id: string;
  title: string;
  description?: string;
  price_in_points: number;
  total_sales?: number;
  stock_quantity?: number | null;
  seller_username?: string;
  created_at?: string;
}

type SortKey = 'best' | 'new';

const THUMB_GRADIENTS = [
  'linear-gradient(150deg,#0b1f3a,#0e7490)',
  'linear-gradient(150deg,#0284c7,#06b6d4)',
  'linear-gradient(150deg,#7c3aed,#0284c7)',
  'linear-gradient(150deg,#0e7490,#22d3ee)',
  'linear-gradient(150deg,#1b3a61,#0284c7)',
  'linear-gradient(150deg,#0b1f3a,#1b3a61)',
];
const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#22d3ee,#0284c7)',
  'linear-gradient(135deg,#16a34a,#22d3ee)',
  'linear-gradient(135deg,#f59e0b,#ef4444)',
  'linear-gradient(135deg,#0ea5e9,#22d3ee)',
];

function hashIndex(seed: string, len: number) {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % len;
}

export default function MarketplacePage() {
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('best');

  useEffect(() => {
    (async () => {
      try {
        const res = await productApi.getPublic({ sort: 'latest', limit: 50 });
        const data = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const visible = useMemo(() => {
    let rows = products.slice();
    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter((p) => `${p.title}${p.seller_username ?? ''}`.toLowerCase().includes(q));
    }
    rows.sort((a, b) =>
      sort === 'best'
        ? (b.total_sales ?? 0) - (a.total_sales ?? 0)
        : new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime(),
    );
    return rows;
  }, [products, query, sort]);

  const topCreators = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => {
      if (!p.seller_username) return;
      map.set(p.seller_username, (map.get(p.seller_username) ?? 0) + (p.total_sales ?? 0));
    });
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, [products]);

  return (
    <div style={{ background: 'var(--canvas)', color: 'var(--text)', minHeight: '100vh' }}>
      <PublicNav />

      {/* Hero */}
      <header
        style={{
          color: '#fff',
          background:
            'radial-gradient(700px 320px at 80% -30%, #0e7490 0%, transparent 60%), linear-gradient(150deg, #0b1f3a, #0f2c52)',
        }}
      >
        <div className="mx-auto max-w-[1140px] px-6 pb-7 pt-9">
          <h1 className="text-[26px] font-extrabold tracking-tight sm:text-[32px]">マーケット</h1>
          <p className="mt-2.5 text-[14.5px]" style={{ color: '#bcd3ee' }}>
            クリエイターのノウハウ・テンプレート・講座を、ポイントで購入。気になる商品を探そう。
          </p>
          <div className="relative mt-5 max-w-[560px]">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-[19px] w-[19px] -translate-y-1/2" style={{ color: 'var(--muted)' }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="商品・クリエイターで検索"
              className="w-full rounded-[14px] border-0 bg-white py-3.5 pl-12 pr-4 text-[15px] shadow-[var(--sh-md)] focus:outline-none"
              style={{ color: 'var(--ink)' }}
            />
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto grid max-w-[1140px] grid-cols-1 gap-8 px-6 pb-16 pt-7 lg:grid-cols-[1fr_304px]">
        <main>
          <div className="mb-[18px] flex items-center gap-1">
            <SortButton active={sort === 'best'} onClick={() => setSort('best')} icon={<FireIcon className="h-[15px] w-[15px]" />}>
              売れ筋
            </SortButton>
            <SortButton active={sort === 'new'} onClick={() => setSort('new')} icon={<ClockIcon className="h-[15px] w-[15px]" />}>
              新着
            </SortButton>
            <span className="ml-auto text-[12.5px]" style={{ color: 'var(--muted)' }}>
              <b style={{ color: 'var(--ink)' }}>{visible.length}</b> 件
            </span>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-sm" style={{ color: 'var(--muted)' }}>
              読み込み中...
            </div>
          ) : visible.length === 0 ? (
            <div className="py-12 text-center text-sm" style={{ color: 'var(--muted)' }}>
              該当する商品が見つかりませんでした。
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((p) => (
                <ProductCard key={p.id} product={p} showBest={sort === 'best'} />
              ))}
            </div>
          )}
        </main>

        <aside className="hidden lg:block">
          <div className="card mb-[18px]" style={{ padding: 18 }}>
            <h3 className="mb-3.5 flex items-center gap-1.5 text-[13px] font-bold" style={{ color: 'var(--ink)' }}>
              <UsersIcon className="h-4 w-4" style={{ color: 'var(--brand)' }} />
              売れ筋クリエイター
            </h3>
            {topCreators.length === 0 ? (
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                まだデータがありません
              </p>
            ) : (
              topCreators.map(([name, sales], i) => (
                <Link
                  key={name}
                  href={`/u/${name}`}
                  className="flex items-center gap-2.5 border-t py-2 first:border-t-0"
                  style={{ borderColor: 'var(--line-2)' }}
                >
                  <span
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-extrabold"
                    style={{ background: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length], color: '#042032' }}
                  >
                    {name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-bold" style={{ color: 'var(--ink)' }}>
                      {name}
                    </div>
                    <div className="text-[11.5px]" style={{ color: 'var(--muted)' }}>
                      {sales}件販売
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="rounded-[16px] p-5 text-white shadow-[var(--sh-card)]" style={{ background: 'linear-gradient(160deg,#0b1f3a,#0f2c52)' }}>
            <b className="block text-base font-extrabold">あなたも販売する</b>
            <p className="my-2 mb-4 text-[12.5px] leading-relaxed" style={{ color: '#bcd3ee' }}>
              作ったLPやノウハウを商品化。ポイント決済で受け取れます。
            </p>
            <Link href="/products/manage" className="btn btn-primary btn-block btn-sm">
              販売者になる
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SortButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn('inline-flex items-center gap-1.5 rounded-[10px] px-3.5 py-2 text-[13.5px] font-bold transition-colors')}
      style={active ? { color: 'var(--brand)', background: 'var(--surface-tint)' } : { color: 'var(--muted)' }}
    >
      {icon}
      {children}
    </button>
  );
}

function ProductCard({ product, showBest }: { product: PublicProduct; showBest: boolean }) {
  const seller = product.seller_username ?? '';
  const isBest = showBest && (product.total_sales ?? 0) >= 100;
  return (
    <article className="card card-hover flex flex-col overflow-hidden" style={{ padding: 0 }}>
      <Link href={`/products/${product.id}`} className="relative block h-[130px]" style={{ background: THUMB_GRADIENTS[hashIndex(product.id, THUMB_GRADIENTS.length)] }}>
        {isBest && (
          <span className="absolute right-2.5 top-2.5 rounded-full px-2.5 py-[3px] text-[10.5px] font-extrabold text-white bg-brand-grad">
            人気
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 px-[15px] pb-[15px] pt-3.5">
        <Link href={`/products/${product.id}`} className="text-[14.5px] font-bold leading-[1.4] transition-colors hover:text-[color:var(--brand)]" style={{ color: 'var(--ink)' }}>
          {product.title}
        </Link>
        {seller && (
          <Link href={`/u/${seller}`} className="flex items-center gap-1.5">
            <span
              className="flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold"
              style={{ background: AVATAR_GRADIENTS[hashIndex(seller, AVATAR_GRADIENTS.length)], color: '#042032' }}
            >
              {seller.charAt(0).toUpperCase()}
            </span>
            <span className="text-xs font-semibold" style={{ color: 'var(--text-2)' }}>
              {seller}
            </span>
          </Link>
        )}
        <div className="mt-auto flex items-center justify-between pt-1.5">
          <span className="text-lg font-extrabold tabular-nums" style={{ color: 'var(--brand)' }}>
            {product.price_in_points.toLocaleString()}
            <small className="text-xs"> P</small>
          </span>
          <span className="inline-flex items-center gap-1 text-[11.5px]" style={{ color: 'var(--muted)' }}>
            <FireIcon className="h-[13px] w-[13px]" style={{ color: '#f59e0b' }} />
            {product.total_sales ?? 0}件
          </span>
        </div>
      </div>
    </article>
  );
}
