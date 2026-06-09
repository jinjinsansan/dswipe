'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  EyeIcon,
  CursorArrowRaysIcon,
  CurrencyYenIcon,
  DocumentTextIcon,
  PlusIcon,
  ShieldCheckIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import { lpApi, pointsApi, productApi } from '@/lib/api';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { Button, Card, Badge, KpiCard, PointsPill } from '@/components/ui';

interface DashboardLP {
  id: string;
  title: string;
  slug?: string;
  is_published?: boolean;
  total_views?: number;
  total_cta_clicks?: number;
  heroImage?: string | null;
}

const THUMB_GRADIENTS = [
  'linear-gradient(150deg,#0b1f3a,#0e7490)',
  'linear-gradient(150deg,#0284c7,#06b6d4)',
  'linear-gradient(150deg,#1b3a61,#2a4f7d)',
  'linear-gradient(150deg,#0e7490,#22d3ee)',
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized } = useAuthStore();
  const [lps, setLps] = useState<DashboardLP[]>([]);
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [pointBalance, setPointBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [totalSales, setTotalSales] = useState<number>(0);

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isInitialized]);

  const fetchData = async () => {
    try {
      const [lpsResponse, pointsResponse, productsResponse] = await Promise.all([
        lpApi.list(),
        pointsApi.getBalance(),
        productApi.list(),
      ]);

      const lpsData = Array.isArray(lpsResponse.data?.data)
        ? lpsResponse.data.data
        : Array.isArray(lpsResponse.data)
        ? lpsResponse.data
        : [];

      const heroImageMap = new Map<string, string | null>();
      await Promise.all(
        lpsData.map(async (lpItem: { id: string }) => {
          try {
            const detailResponse = await lpApi.get(lpItem.id);
            const steps = Array.isArray(detailResponse.data?.steps) ? detailResponse.data.steps : [];
            const heroStep =
              [...steps].find((step: { block_type?: string; content_data?: { block_type?: string } }) => {
                const type = step?.block_type || step?.content_data?.block_type;
                return typeof type === 'string' && type.includes('hero');
              }) ||
              steps.find((step: { block_type?: string }) => step?.block_type === 'image-aurora-1') ||
              steps[0];

            const extractImageFromStep = (step: Record<string, any> | undefined): string | null => {
              if (!step) return null;
              const sources = [
                step?.content_data?.imageUrl,
                step?.content_data?.image_url,
                step?.content_data?.heroImage,
                step?.content_data?.hero_image,
                step?.content_data?.primaryImageUrl,
                step?.content_data?.primary_image_url,
                step?.image_url,
                step?.imageUrl,
              ];
              return sources.find((value) => typeof value === 'string' && value.trim().length > 0) || null;
            };

            heroImageMap.set(lpItem.id, extractImageFromStep(heroStep));
          } catch (detailError) {
            console.error('Failed to fetch LP detail for hero image:', detailError);
            heroImageMap.set(lpItem.id, null);
          }
        }),
      );

      const productsData = Array.isArray(productsResponse.data?.data)
        ? productsResponse.data.data
        : Array.isArray(productsResponse.data)
        ? productsResponse.data
        : [];

      const enrichedLps = lpsData.map((lpItem: Record<string, any>) => ({
        ...lpItem,
        heroImage: heroImageMap.get(lpItem.id) || lpItem.image_url || null,
      })) as DashboardLP[];

      setLps(enrichedLps);
      setProducts(productsData);
      setPointBalance(pointsResponse.data.point_balance);

      const sales = productsData.reduce(
        (sum: number, p: Record<string, any>) => sum + (p.total_sales || 0) * (p.price_in_points || 0),
        0,
      );
      setTotalSales(sales);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLP = async (lpId: string) => {
    if (!confirm('本当にこのLPを削除しますか？この操作は取り消せません。')) return;
    try {
      await lpApi.delete(lpId);
      await fetchData();
    } catch (error) {
      console.error('Failed to delete LP:', error);
      alert('LPの削除に失敗しました');
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

  const totalViews = lps.reduce((sum, lp) => sum + (lp.total_views || 0), 0);
  const totalClicks = lps.reduce((sum, lp) => sum + (lp.total_cta_clicks || 0), 0);
  const ctaRate = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0';
  const publishedCount = lps.filter((lp) => lp.is_published).length;
  const draftCount = lps.length - publishedCount;
  const salesCount = products.reduce((sum, p) => sum + ((p.total_sales as number) || 0), 0);

  return (
    <DashboardShell
      title="ダッシュボード"
      subtitle={`ようこそ、${user?.username ?? ''}さん`}
      actions={
        <>
          <PointsPill value={pointBalance} className="hidden sm:inline-flex" />
          <Link href="/lp/create" className="btn btn-primary btn-sm">
            <PlusIcon />
            <span className="hidden sm:inline">新規LP作成</span>
          </Link>
          <div className="avatar">{user?.username?.charAt(0).toUpperCase() || 'U'}</div>
        </>
      }
    >
      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <KpiCard icon={<EyeIcon />} caption="総閲覧数" value={totalViews.toLocaleString()} />
        <KpiCard icon={<CursorArrowRaysIcon />} softIcon caption="CTAクリック率" value={`${ctaRate}%`} />
        <KpiCard
          icon={<CurrencyYenIcon />}
          caption="売上（ポイント）"
          value={
            <>
              {totalSales.toLocaleString()}
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}> P</span>
            </>
          }
        />
        <KpiCard
          icon={<DocumentTextIcon />}
          softIcon
          caption="公開中のLP"
          value={
            <>
              {publishedCount}
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}> / {lps.length}本</span>
            </>
          }
          foot={`下書き ${draftCount}本`}
        />
      </div>

      {/* LP grid */}
      <div>
        <div className="mb-3.5 flex items-center justify-between gap-3">
          <h2 className="text-[17px] font-bold" style={{ color: 'var(--ink)' }}>
            最近編集したLP
          </h2>
          <Link href="/products" className="btn btn-secondary btn-sm">
            マーケットを見る
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {lps.map((lp, i) => (
            <Card key={lp.id} padded={false} hover className="flex flex-col overflow-hidden">
              <div
                className="relative flex h-[116px] items-center justify-center"
                style={
                  lp.heroImage
                    ? undefined
                    : { background: THUMB_GRADIENTS[i % THUMB_GRADIENTS.length] }
                }
              >
                {lp.heroImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={lp.heroImage} alt={lp.title} className="h-full w-full object-cover" />
                ) : (
                  <span className="px-4 text-center text-[13px] font-extrabold text-white drop-shadow">
                    {lp.title}
                  </span>
                )}
                <span className="absolute right-2.5 top-2.5">
                  {lp.is_published ? (
                    <Badge tone="live" small dot>
                      公開中
                    </Badge>
                  ) : (
                    <Badge tone="draft" small>
                      下書き
                    </Badge>
                  )}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-2.5 px-3.5 pb-3.5 pt-3">
                <div className="truncate text-sm font-bold" style={{ color: 'var(--ink)' }}>
                  {lp.title}
                </div>
                <div className="flex gap-3.5 text-[11.5px] font-medium" style={{ color: 'var(--muted)' }}>
                  <span>
                    閲覧 <b style={{ color: 'var(--text)' }}>{(lp.total_views || 0).toLocaleString()}</b>
                  </span>
                  <span>
                    CTA <b style={{ color: 'var(--text)' }}>{(lp.total_cta_clicks || 0).toLocaleString()}</b>
                  </span>
                </div>
                <div className="grid grid-cols-[1fr_1fr_auto] gap-1.5">
                  <Link href={`/lp/${lp.id}/edit`} className="lp-act">
                    編集
                  </Link>
                  <Link href={`/lp/${lp.id}/analytics`} className="lp-act">
                    分析
                  </Link>
                  <button onClick={() => handleDeleteLP(lp.id)} className="lp-act del" aria-label="削除">
                    ✕
                  </button>
                </div>
                {lp.is_published && lp.slug && (
                  <div className="flex gap-1.5 border-t pt-2.5" style={{ borderColor: 'var(--line)' }}>
                    <input
                      readOnly
                      value={`d-swipe.com/view/${lp.slug}`}
                      className="min-w-0 flex-1 rounded-[7px] border px-2 py-1 font-mono text-[10.5px]"
                      style={{ background: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--muted)' }}
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/view/${lp.slug}`);
                      }}
                      className="whitespace-nowrap rounded-[7px] px-2.5 py-1 text-[11px] font-bold text-white bg-brand-grad"
                    >
                      コピー
                    </button>
                  </div>
                )}
              </div>
            </Card>
          ))}

          <Link
            href="/lp/create"
            className="flex min-h-[240px] flex-col items-center justify-center gap-2.5 rounded-[20px] border-[1.5px] border-dashed text-center transition-colors"
            style={{ borderColor: '#c3d4e8', color: 'var(--brand)' }}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-[13px] text-white bg-brand-grad shadow-[var(--sh-glow)]">
              <PlusIcon className="h-6 w-6" />
            </span>
            <b className="text-sm font-bold">新規LPを作成</b>
            <span className="text-xs" style={{ color: 'var(--muted)' }}>
              AIが構成を提案します
            </span>
          </Link>
        </div>
      </div>

      {/* Bottom info */}
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
        <InfoCard
          icon={<ShieldCheckIcon className="h-[18px] w-[18px]" />}
          label="ご利用中のプラン"
          value={user?.user_type === 'seller' ? 'Seller プラン' : 'Buyer プラン'}
          sub={
            <>
              LP作成数 <b style={{ color: 'var(--text)' }}>無制限</b> · AI生成 利用可
            </>
          }
        />
        <InfoCard
          icon={<DocumentTextIcon className="h-[18px] w-[18px]" />}
          label="登録中のLP"
          value={`${lps.length}本`}
          sub={
            <>
              公開中 <b style={{ color: 'var(--text)' }}>{publishedCount}本</b> · 下書き{' '}
              <b style={{ color: 'var(--text)' }}>{draftCount}本</b>
            </>
          }
        />
        <InfoCard
          icon={<BriefcaseIcon className="h-[18px] w-[18px]" />}
          label="販売実績"
          value={`${salesCount}件`}
          sub={
            <>
              総売上 <b style={{ color: 'var(--text)' }}>{totalSales.toLocaleString()} P</b>
            </>
          }
        />
      </div>
    </DashboardShell>
  );
}

function InfoCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub: React.ReactNode;
}) {
  return (
    <Card className="flex items-start gap-3" padded={false}>
      <div className="flex gap-3 p-[18px]">
        <span
          className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[10px]"
          style={{ background: 'var(--surface-tint)', color: 'var(--brand)' }}
        >
          {icon}
        </span>
        <div className="min-w-0">
          <div className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>
            {label}
          </div>
          <div className="text-lg font-extrabold leading-tight" style={{ color: 'var(--ink)' }}>
            {value}
          </div>
          <div className="mt-1.5 text-xs" style={{ color: 'var(--muted)' }}>
            {sub}
          </div>
        </div>
      </div>
    </Card>
  );
}
