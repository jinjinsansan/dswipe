import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'プライバシーポリシー | D-swipe',
  description: 'D-swipeの個人情報保護方針です。ユーザーデータの取り扱いについてご確認ください。'
};

export default function PrivacyPolicyPage() {
  return (
    <main className="relative min-h-screen bg-slate-950 py-24 text-slate-200">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(147,197,253,0.22),transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(148,163,184,0.12)_1px,transparent_1px)]" style={{ backgroundSize: '46px 46px' }} />

      <div className="relative z-10">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="mb-12 space-y-4">
            <Link href="/" className="inline-flex items-center text-xs font-semibold uppercase tracking-[0.32em] text-blue-300 hover:text-white transition-colors">
              ← Home
            </Link>
            <h1 className="text-4xl font-bold text-white">プライバシーポリシー</h1>
            <p className="text-sm text-slate-400">最終更新日：2024年10月22日</p>
            <p className="text-base leading-relaxed text-slate-300">
              D-swipe（以下「当社」）は、ユーザーの個人情報を適切に保護することを最優先事項と位置づけ、以下の方針に基づき個人情報を取り扱います。
            </p>
          </div>

          <div className="space-y-12 text-base leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">1. 取得する情報</h2>
              <p>当社はサービス提供のため、必要な範囲で以下の情報を取得します。</p>
              <ul className="list-disc space-y-2 pl-6 text-slate-300">
                <li>氏名、メールアドレス、連絡先などの基本情報</li>
                <li>LP作成や運営に関する入力データ、利用履歴</li>
                <li>決済処理に必要な情報（クレジットカード情報は決済事業者が管理）</li>
                <li>サポート対応に必要なログ情報および通信記録</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">2. 利用目的</h2>
              <p>取得した情報は、以下の目的で利用します。</p>
              <ul className="list-disc space-y-2 pl-6 text-slate-300">
                <li>サービスの提供、維持、保護および改善</li>
                <li>ユーザーサポートおよびお問い合わせ対応</li>
                <li>新機能や重要なお知らせ等の通知</li>
                <li>不正利用の防止およびセキュリティ向上</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">3. 第三者提供</h2>
              <p>
                法令に基づく場合を除き、ユーザーの同意なく個人情報を第三者に提供することはありません。ただし、業務委託先（決済処理、分析サービス等）に対しては、必要な範囲で個人情報を開示することがあります。
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">4. 安全管理措置</h2>
              <p>
                当社は、個人情報の漏えい、滅失または毀損を防ぐために、アクセス制限、暗号化、監査ログの管理等の合理的な安全対策を講じています。委託先に対しても同等の安全管理措置を求めます。
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">5. ユーザーの権利</h2>
              <p>
                ユーザーは、当社が保有する自己の個人情報について、開示、訂正、利用停止、削除を求めることができます。ご希望の際は、下記お問い合わせ窓口までご連絡ください。
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">6. Cookie等の利用</h2>
              <p>
                当社は、サービス品質向上のためにCookieや類似技術を利用する場合があります。ユーザーはブラウザ設定によりCookieの受け入れを拒否できますが、サービスの一部機能が利用できなくなる可能性があります。
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">7. 方針の変更</h2>
              <p>
                本ポリシーの内容は、法令遵守およびサービス改善のため予告なく変更される場合があります。変更後は、本ページに掲示された時点から効力を生じます。
              </p>
            </section>

            <section className="space-y-3 border-l-2 border-blue-500/40 pl-6 text-sm text-slate-400">
              <p>個人情報に関するお問い合わせ先：</p>
              <address className="not-italic">
                D-swipe 個人情報保護管理担当<br />
                support@d-swipe.jp
              </address>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
