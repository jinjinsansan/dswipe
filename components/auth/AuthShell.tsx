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
  eyebrow: 'SWIPE LP PLATFORM',
  title: 'スワイプで、伝わる。つながる。',
  description:
    'ノーコード × AI で、情報発信のスワイプ型LPを数分で。公開から改善まで、すべてここで。',
  highlights: [
    { title: '最短3分でLPを公開' },
    { title: 'AIが構成を自動提案' },
    { title: '閲覧・CTAをデータで可視化' },
  ],
};

const STATS = [
  { n: '2,400+', l: '公開LP' },
  { n: '+18%', l: '平均CV改善' },
  { n: '3分', l: '公開まで' },
];

export default function AuthShell({
  cardTitle,
  cardDescription,
  helper,
  hero = defaultHero,
  children,
}: AuthShellProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]" style={{ background: 'var(--color-surface-base)' }}>
      {/* LEFT — navy brand panel */}
      <div
        className="relative flex flex-col overflow-hidden px-8 py-10 text-pure-white sm:px-14 sm:py-14"
        style={{
          background:
            'radial-gradient(700px 460px at 25% 10%, rgba(34,211,238,.22), transparent 60%), linear-gradient(160deg, #0b1f3a 0%, #0f2c52 60%, #0b2742 100%)',
        }}
      >
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.4em] text-pure-white">
          <span className="h-2 w-2 rounded-full bg-cyan-400" aria-hidden="true" />
          Ｄ－swipe
        </Link>

        <div className="relative z-10 mt-auto">
          {hero.eyebrow ? (
            <span className="mb-4 inline-flex w-fit rounded-full border border-white/15 bg-white/5 px-4 py-1 text-[11px] font-semibold tracking-[0.3em] text-cyan-200">
              {hero.eyebrow}
            </span>
          ) : null}
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-[40px]">{hero.title}</h1>
          <p className="mt-4 max-w-[42ch] text-[15px] leading-[1.8]" style={{ color: '#bcd3ee' }}>
            {hero.description}
          </p>

          {hero.highlights?.length ? (
            <div className="mt-7 hidden flex-col gap-3.5 sm:flex">
              {hero.highlights.map((item) => (
                <div key={item.title} className="flex items-start gap-3 text-sm" style={{ color: '#dbe8f7' }}>
                  <span
                    className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md"
                    style={{ background: 'rgba(34,211,238,.16)', color: '#67e8f9' }}
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <div>
                    <p className="font-semibold text-pure-white">{item.title}</p>
                    {item.description ? (
                      <p className="mt-0.5 text-xs" style={{ color: '#9fb4d0' }}>
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="relative z-10 mt-10 hidden gap-7 border-t pt-6 sm:flex" style={{ borderColor: 'rgba(255,255,255,.12)' }}>
          {STATS.map(({ n, l }) => (
            <div key={l}>
              <div className="text-2xl font-extrabold tracking-tight">{n}</div>
              <div className="mt-0.5 text-xs" style={{ color: '#9fb4d0' }}>
                {l}
              </div>
            </div>
          ))}
        </div>

        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 -right-36 h-[460px] w-[460px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,.22), transparent 65%)' }}
        />
      </div>

      {/* RIGHT — form panel */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px]">
          <div className="mb-7 text-center">
            <h2 className="text-[28px] font-extrabold tracking-tight" style={{ color: 'var(--color-foreground)' }}>
              {cardTitle}
            </h2>
            <p className="mt-2 text-sm text-slate-500">{cardDescription}</p>
          </div>

          <div className="space-y-6">{children}</div>

          {helper ? <div className="mt-6 text-center text-sm text-slate-600">{helper}</div> : null}

          <Link href="/" className="mt-5 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
