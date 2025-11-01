import type { Metadata } from 'next';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export const metadata: Metadata = {
  title: '特定商取引法に基づく表記 | D-swipe',
  description: 'D-swipeを運営するD-Powerの特定商取引法に基づく表記です。事業者情報や決済条件などをご確認ください。',
};

const PLACEHOLDER_TEXT = '現在準備中です。確定次第、本ページを更新いたします。';

export default function TokushoPage() {
  return (
    <DashboardLayout pageTitle="特定商取引法に基づく表記" pageSubtitle="最終更新日：2025年11月1日" requireAuth={false}>
      <div className="relative min-h-screen bg-slate-950 text-slate-100">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_62%)]" />
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(148,163,184,0.12)_1px,transparent_1px)]"
          style={{ backgroundSize: '48px 48px' }}
        />

        <main className="relative z-10 pt-6 pb-20">
          <div className="container mx-auto max-w-4xl px-4">
            <section className="mb-10 space-y-4">
              <p className="text-base leading-relaxed text-slate-300">
                本ページは、D-swipe（運営：D-Power）の特定商取引法に基づく表記です。お申し込み前に必ずご確認ください。未確定の項目については、判明次第速やかに更新いたします。
              </p>
            </section>

            <div className="space-y-8">
              <section className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 shadow-xl shadow-blue-900/10">
                <h2 className="text-xl font-semibold text-white">販売事業者</h2>
                <dl className="mt-4 space-y-3 text-sm leading-relaxed">
                  <div className="flex flex-col gap-1 rounded-xl border border-slate-800/70 bg-slate-900/60 p-4">
                    <dt className="text-slate-400">販売業者名</dt>
                    <dd className="text-white">D-Power</dd>
                  </div>
                  <div className="flex flex-col gap-1 rounded-xl border border-slate-800/70 bg-slate-900/60 p-4">
                    <dt className="text-slate-400">代表者名</dt>
                    <dd className="text-slate-200">情報確認中（{PLACEHOLDER_TEXT}）</dd>
                  </div>
                  <div className="flex flex-col gap-1 rounded-xl border border-slate-800/70 bg-slate-900/60 p-4">
                    <dt className="text-slate-400">所在地</dt>
                    <dd className="text-slate-100">
                      Registered Location: Samoa Office<br />
                      Location: Hong Kong
                    </dd>
                  </div>
                </dl>
              </section>

              <section className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 shadow-xl shadow-blue-900/10">
                <h2 className="text-xl font-semibold text-white">お問い合わせ先</h2>
                <dl className="mt-4 space-y-3 text-sm leading-relaxed">
                  <div className="flex flex-col gap-1 rounded-xl border border-slate-800/70 bg-slate-900/60 p-4">
                    <dt className="text-slate-400">メールアドレス</dt>
                    <dd className="text-slate-100">
                      <a href="mailto:info@dlogicai.com" className="text-blue-300 hover:text-blue-200">
                        info@dlogicai.com
                      </a>
                    </dd>
                  </div>
                  <div className="flex flex-col gap-1 rounded-xl border border-slate-800/70 bg-slate-900/60 p-4">
                    <dt className="text-slate-400">電話番号 / 受付時間</dt>
                    <dd className="text-slate-200">{PLACEHOLDER_TEXT}</dd>
                  </div>
                </dl>
              </section>

              <section className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 shadow-xl shadow-blue-900/10">
                <h2 className="text-xl font-semibold text-white">料金・お支払い</h2>
                <dl className="mt-4 space-y-3 text-sm leading-relaxed">
                  <div className="flex flex-col gap-1 rounded-xl border border-slate-800/70 bg-slate-900/60 p-4">
                    <dt className="text-slate-400">販売価格</dt>
                    <dd className="text-slate-200">各販売ページに税込価格を表示しています。</dd>
                  </div>
                  <div className="flex flex-col gap-1 rounded-xl border border-slate-800/70 bg-slate-900/60 p-4">
                    <dt className="text-slate-400">商品代金以外の必要料金</dt>
                    <dd className="text-slate-200">{PLACEHOLDER_TEXT}</dd>
                  </div>
                  <div className="flex flex-col gap-1 rounded-xl border border-slate-800/70 bg-slate-900/60 p-4">
                    <dt className="text-slate-400">お支払い方法</dt>
                    <dd className="text-slate-100">クレジットカード / USDT</dd>
                  </div>
                  <div className="flex flex-col gap-1 rounded-xl border border-slate-800/70 bg-slate-900/60 p-4">
                    <dt className="text-slate-400">お支払い時期</dt>
                    <dd className="text-slate-200">ご注文時に即時決済されます。</dd>
                  </div>
                </dl>
              </section>

              <section className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 shadow-xl shadow-blue-900/10">
                <h2 className="text-xl font-semibold text-white">商品の引き渡し・提供時期</h2>
                <p className="mt-4 text-sm leading-relaxed text-slate-200">
                  代金決済完了後、購入履歴ページよりデジタルコンテンツを即時に閲覧またはダウンロードできます。オンラインサロンの場合は、決済完了後ただちに参加手続きが可能です。
                </p>
              </section>

              <section className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 shadow-xl shadow-blue-900/10">
                <h2 className="text-xl font-semibold text-white">返品・キャンセル</h2>
                <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-200">
                  <li>デジタルコンテンツの性質上、データ破損など著しい欠損がある場合を除き返品・キャンセルはお受けできません。</li>
                  <li>ポイント購入についても、決済完了後のキャンセルは承っておりません。</li>
                  <li>{PLACEHOLDER_TEXT}</li>
                </ul>
              </section>

              <section className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 shadow-xl shadow-blue-900/10">
                <h2 className="text-xl font-semibold text-white">提供条件・対応環境</h2>
                <p className="mt-4 text-sm leading-relaxed text-slate-200">{PLACEHOLDER_TEXT}</p>
              </section>

              <section className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 shadow-xl shadow-blue-900/10">
                <h2 className="text-xl font-semibold text-white">表現および商品に関する注意書き</h2>
                <p className="mt-4 text-sm leading-relaxed text-slate-200">
                  サイト内に示された事例や成果は個人差があり、必ずしも利益や効果を保証するものではありません。サービスの利用結果は、お客様各自の環境や取り組み方によって異なります。
                </p>
              </section>

              <section className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 shadow-xl shadow-blue-900/10">
                <h2 className="text-xl font-semibold text-white">特別な販売条件</h2>
                <p className="mt-4 text-sm leading-relaxed text-slate-200">{PLACEHOLDER_TEXT}</p>
              </section>

              <section className="rounded-2xl border border-blue-500/50 bg-slate-900/70 p-6 shadow-xl shadow-blue-900/10">
                <h2 className="text-xl font-semibold text-white">更新のお知らせ</h2>
                <p className="mt-4 text-sm leading-relaxed text-slate-200">
                  上記記載内容は、法令改正・サービス変更・新情報の追加に伴い予告なく更新される場合があります。最新情報は本ページをご確認ください。
                </p>
              </section>
            </div>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
}
