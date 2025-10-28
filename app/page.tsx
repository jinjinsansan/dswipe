import StickySiteHeader from '@/components/layout/StickySiteHeader';
import HomeSwiper from './HomeSwiper';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-black text-white">
      <StickySiteHeader
        dark
        showDashboardLink
        className="bg-black/70 border-white/10"
        innerClassName="max-w-7xl"
      />
      <div className="relative">
        <HomeSwiper />
      </div>
    </div>
  );
}
