import Link from 'next/link';
import { BoltIcon, SparklesIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const POINTS = [
  { icon: BoltIcon, label: '最短3分でLPを公開' },
  { icon: SparklesIcon, label: 'AIが構成を自動提案' },
  { icon: ChartBarIcon, label: '閲覧・CTAをデータで可視化' },
];

const STATS = [
  { n: '2,400+', l: '公開LP' },
  { n: '+18%', l: '平均CV改善' },
  { n: '3分', l: '公開まで' },
];

function BrandMark() {
  return (
    <svg width="34" height="34" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="auth-bl" x1="0" y1="0" x2="40" y2="40">
          <stop stopColor="#22d3ee" />
          <stop offset="1" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="11" fill="#fff" fillOpacity=".08" stroke="rgba(255,255,255,.2)" />
      <path d="M11 13h6c4 0 7 2.8 7 7s-3 7-7 7h-6z" fill="none" stroke="url(#auth-bl)" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M25 20l6-5m-6 5l6 5" stroke="url(#auth-bl)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Split-screen auth shell (Momentum): navy brand panel on the left, form slot
 * on the right. Shared by /login and /register.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]" style={{ background: 'var(--canvas)' }}>
      {/* LEFT — navy brand panel */}
      <div
        className="relative flex flex-col overflow-hidden px-8 py-10 text-white sm:px-14 sm:py-14"
        style={{
          background:
            'radial-gradient(700px 460px at 25% 10%, rgba(34,211,238,.22), transparent 60%), linear-gradient(160deg, #0b1f3a 0%, #0f2c52 60%, #0b2742 100%)',
        }}
      >
        <Link href="/" className="flex items-center gap-3 text-xl font-extrabold tracking-tight text-white">
          <BrandMark />
          <span>
            D<span style={{ color: 'var(--cyan-400)' }}>-</span>Swipe
          </span>
        </Link>

        <div className="relative z-10 mt-auto">
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-[38px]">
            スワイプで、
            <br />
            <span className="grad-text" style={{ backgroundImage: 'linear-gradient(120deg,#67e8f9,#38bdf8)' }}>
              伝わる
            </span>
            。売れる。
          </h2>
          <p className="mt-4 max-w-[40ch] text-[15px] leading-[1.8]" style={{ color: '#bcd3ee' }}>
            ノーコード × AI で、情報商材のスワイプ型LPを数分で。公開から改善まで、すべてここで。
          </p>
          <div className="mt-7 hidden flex-col gap-3.5 sm:flex">
            {POINTS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 text-sm" style={{ color: '#dbe8f7' }}>
                <span
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[9px]"
                  style={{ background: 'rgba(34,211,238,.16)', color: '#67e8f9' }}
                >
                  <Icon className="h-4 w-4" />
                </span>
                {label}
              </div>
            ))}
          </div>
        </div>

        <div
          className="relative z-10 mt-10 hidden gap-7 border-t pt-6 sm:flex"
          style={{ borderColor: 'rgba(255,255,255,.12)' }}
        >
          {STATS.map(({ n, l }) => (
            <div key={l}>
              <div className="text-2xl font-extrabold tracking-tight">{n}</div>
              <div className="mt-0.5 text-xs" style={{ color: 'var(--on-navy-muted)' }}>
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

      {/* RIGHT — form slot */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px]">{children}</div>
      </div>
    </div>
  );
}

/** Login/Register tab switch used inside AuthLayout. */
export function AuthTabs({ active }: { active: 'login' | 'register' }) {
  const base =
    'flex-1 rounded-[9px] py-2.5 text-sm font-semibold transition-colors';
  return (
    <div className="seg-tabs mb-6 w-full">
      <Link
        href="/login"
        className={base}
        style={active === 'login' ? { background: 'var(--surface)', color: 'var(--ink)', boxShadow: 'var(--sh-xs)' } : { color: 'var(--muted)' }}
      >
        ログイン
      </Link>
      <Link
        href="/register"
        className={base}
        style={active === 'register' ? { background: 'var(--surface)', color: 'var(--ink)', boxShadow: 'var(--sh-xs)' } : { color: 'var(--muted)' }}
      >
        新規登録
      </Link>
    </div>
  );
}
