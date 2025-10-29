import Link from 'next/link';

type Highlight = {
  title: string;
  description?: string;
};

type HeroContent = {
  eyebrow?: string;
  title: string;
  description: string;
  highlights?: Highlight[];
  footerLink?: {
    href: string;
    label: string;
  };
};

interface AuthShellProps {
  cardTitle: string;
  cardDescription: string;
  helper?: React.ReactNode;
  hero?: HeroContent;
  children: React.ReactNode;
}

const defaultHero: HeroContent = {
  eyebrow: 'SWIPE-STYLE LP PLATFORM',
  title: '情報の鮮度を逃がさない体験をつくる',
  description:
    'Ｄ－swipeは高速なスワイプ体験とデータドリブンな改善機能で、デジタルコンテンツクリエイターの成長を支えます。',
  highlights: [
    {
      title: 'AIによる構成アシスト',
      description: 'ヒーローからFAQまで一貫したストーリーを提案。',
    },
    {
      title: '高品質メディア運用',
      description: '動画・画像の一元管理と自動最適化でスピーディに掲載。',
    },
    {
      title: '分析ダッシュボード',
      description: '閲覧データをリアルタイムに把握し次の一手を決定。',
    },
  ],
};

export default function AuthShell({
  cardTitle,
  cardDescription,
  helper,
  hero = defaultHero,
  children,
}: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-slate-50">
      <div className="pointer-events-none absolute inset-0">
        <video
          className="absolute inset-0 h-full w-full object-cover object-center opacity-30"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src="/videos/pixta.mp4" type="video/mp4" />
        </video>
        <div className="absolute -left-36 top-24 h-72 w-72 rounded-full bg-cyan-500/20 blur-[120px]" />
        <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-purple-400/10 blur-[140px]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-6 backdrop-blur-xl bg-slate-900/70 lg:px-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.4em] text-white">
            <span className="h-2 w-2 rounded-full bg-cyan-400" aria-hidden="true" />
            Ｄ－swipe
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition hover:text-cyan-300 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 hover:border-cyan-400/50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            ホームに戻る
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center px-6 pb-16 lg:px-10">
          <div className="grid w-full max-w-6xl gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,420px)]">
            <section className="hidden flex-col justify-between rounded-2xl border-2 border-white/20 bg-slate-900/60 p-10 backdrop-blur-xl shadow-2xl lg:flex">
              <div className="space-y-8">
                {hero.eyebrow ? (
                  <span className="inline-flex w-fit rounded-full border-2 border-cyan-400/50 bg-cyan-500/20 px-5 py-2 text-xs font-bold tracking-[0.3em] text-cyan-200">
                    {hero.eyebrow}
                  </span>
                ) : null}
                <div className="space-y-4">
                  <h1 className="text-4xl font-black leading-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 drop-shadow-2xl lg:text-5xl">
                    {hero.title}
                  </h1>
                  <p className="text-base text-white font-semibold lg:text-lg">
                    {hero.description}
                  </p>
                </div>
              </div>

              {hero.highlights?.length ? (
                <ul className="space-y-3">
                  {hero.highlights.map((item) => (
                    <li key={item.title} className="flex items-start gap-3 rounded-xl border-2 border-blue-200 bg-white p-4 shadow-xl">
                      <span className="mt-0.5 inline-flex h-2 w-2 shrink-0 rounded-full bg-cyan-500" aria-hidden="true" />
                      <div>
                        <p className="text-sm font-bold text-slate-900">{item.title}</p>
                        {item.description ? (
                          <p className="mt-1 text-xs text-slate-600 leading-tight">{item.description}</p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}

              {hero.footerLink ? (
                <Link
                  href={hero.footerLink.href}
                  className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-200 transition hover:text-white"
                >
                  {hero.footerLink.label}
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              ) : null}
            </section>

            <section className="relative">
              <div className="absolute -top-40 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[120px]" />
              <div className="relative overflow-hidden rounded-2xl border-2 border-white/20 bg-white shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
                <div className="relative space-y-8 px-8 py-10 sm:px-10">
                  <div className="space-y-3 text-center">
                    <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 shadow-xl flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900">{cardTitle}</h2>
                    <p className="text-sm text-slate-600 font-medium">{cardDescription}</p>
                  </div>
                  <div className="space-y-6">{children}</div>
                  {helper ? <div className="text-center text-sm text-slate-700 font-medium">{helper}</div> : null}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
