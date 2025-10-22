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
    'Ｄ－swipeは高速なスワイプ体験とデータドリブンな改善機能で、情報商材インフォプレナーの成長を支えます。',
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
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      <div className="pointer-events-none absolute inset-0">
        <video
          className="absolute inset-0 h-full w-full object-cover object-center brightness-[0.85]"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src="/videos/pixta.mp4" type="video/mp4" />
        </video>
        <div className="absolute -left-36 top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-[120px]" />
        <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-emerald-400/10 blur-[140px]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-6 py-6 lg:px-10">
          <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.6em] text-slate-200/80">
            <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
            Ｄ－swipe
          </div>
          <Link
            href="/"
            className="hidden text-sm font-semibold text-slate-200 transition hover:text-white lg:inline-flex"
          >
            ホームに戻る
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center px-6 pb-16 lg:px-10">
          <div className="grid w-full max-w-6xl gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,420px)]">
            <section className="hidden flex-col justify-between rounded-[32px] border border-white/10 bg-white/5/40 p-10 backdrop-blur-2xl lg:flex">
              <div className="space-y-8">
                {hero.eyebrow ? (
                  <span className="inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold tracking-[0.4em] text-slate-200/80">
                    {hero.eyebrow}
                  </span>
                ) : null}
                <div className="space-y-4">
                  <h1 className="text-4xl font-semibold leading-snug text-white drop-shadow-md lg:text-5xl">
                    {hero.title}
                  </h1>
                  <p className="text-base text-slate-200/80 lg:text-lg">
                    {hero.description}
                  </p>
                </div>
              </div>

              {hero.highlights?.length ? (
                <ul className="space-y-4 text-slate-100/85">
                  {hero.highlights.map((item) => (
                    <li key={item.title} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/10/60 p-4 backdrop-blur-xl">
                      <span className="mt-1 inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400" aria-hidden="true" />
                      <div>
                        <p className="text-sm font-semibold tracking-wide text-white">{item.title}</p>
                        {item.description ? (
                          <p className="mt-1 text-sm text-slate-200/70">{item.description}</p>
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
              <div className="absolute -top-40 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-blue-500/20 blur-[120px]" />
              <div className="relative overflow-hidden rounded-[32px] border border-white/15 bg-white/10 p-[1px] shadow-2xl backdrop-blur-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent" />
                <div className="relative space-y-8 rounded-[30px] bg-slate-950/40 px-8 py-10 backdrop-blur-2xl sm:px-10">
                  <div className="space-y-3 text-center">
                    <div className="mx-auto h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-emerald-400 opacity-80" />
                    <h2 className="text-2xl font-semibold tracking-wide text-white">{cardTitle}</h2>
                    <p className="text-sm text-slate-200/70">{cardDescription}</p>
                  </div>
                  <div className="space-y-6">{children}</div>
                  {helper ? <div className="text-center text-sm text-slate-200/70">{helper}</div> : null}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
