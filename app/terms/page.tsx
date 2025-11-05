import Link from 'next/link';
import type { Metadata } from 'next';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export const metadata: Metadata = {
  title: '利用規約 | D-swipe',
  description: 'D-swipeプラットフォームの利用規約です。ご利用前に必ずご確認ください。'
};

export default function TermsPage() {
  return (
    <DashboardLayout pageTitle="利用規約" pageSubtitle="最終更新日：2025年11月5日" requireAuth={false}>
      <div className="relative min-h-screen bg-slate-950 text-slate-200">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_60%)]" />
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(148,163,184,0.12)_1px,transparent_1px)]"
          style={{ backgroundSize: '44px 44px' }}
        />

        <main className="relative z-10 pt-6 pb-20">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="mb-12 space-y-4">
              <p className="text-base leading-relaxed text-slate-300">
                この利用規約（以下「本規約」）は、D-swipe（以下「当社」）が提供するサービスの利用条件を定めるものです。ユーザーの皆さまには、本規約に従ってサービスをご利用いただきます。
              </p>
            </div>

          <div className="space-y-12 text-base leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">第1条（適用）</h2>
              <p>
                本規約は、ユーザーと当社との間のサービス利用に関わる一切の関係に適用されます。当社はサービス提供に際し、本規約のほか、利用ガイドライン等を定める場合があります。
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">第2条（ユーザー登録）</h2>
              <p>
                サービスの利用を希望する方は、当社の定める方法によってユーザー登録を行うものとします。登録申請者が過去に本規約への違反等により利用資格を取り消された場合、登録をお断りすることがあります。
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">第3条（禁止事項）</h2>
              <p>ユーザーは、サービスの利用にあたり以下の行為をしてはなりません。</p>
              <ul className="list-disc space-y-2 pl-6 text-slate-300">
                <li>法令または公序良俗に違反する行為</li>
                <li>犯罪行為に関連する行為</li>
                <li>当社のサービス運営を妨害する行為</li>
                <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
                <li>当社、他のユーザー、または第三者の知的財産権、肖像権、プライバシーを侵害する行為</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">第4条（サービスの提供停止等）</h2>
              <p>
                当社は、以下のいずれかに該当する場合には、ユーザーに事前に通知することなくサービスの全部または一部の提供を停止または中断することができるものとします。これによりユーザーまたは第三者が被った損害について、当社は一切の責任を負いません。
              </p>
              <ul className="list-disc space-y-2 pl-6 text-slate-300">
                <li>システムの保守点検または更新を行う場合</li>
                <li>地震、落雷、火災、停電、天災等の不可抗力によりサービス提供が困難となった場合</li>
                <li>その他、当社がサービス提供が困難と判断した場合</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">第5条（利用制限および登録抹消）</h2>
              <p>
                当社は、ユーザーが本規約のいずれかに違反した場合、事前の通知なくユーザーに対してサービスの利用を制限し、またはユーザー登録を抹消することができます。
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">第6条（免責事項）</h2>
              <p>
                当社の債務不履行責任は、当社の故意または重過失によらない場合には免責されるものとします。また、当社はサービスに関して、ユーザーと他のユーザーまたは第三者との間に生じた取引、連絡または紛争について一切の責任を負いません。
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">第7条（決済手数料）</h2>
              <p>
                当社は、プラットフォームを通じた売上金の精算時に、一律10％の決済手数料を申し受けます。手数料は決済代行費用、システム運用費その他の関連費用に充当され、当社が別途定める方法で算出・控除されます。
              </p>
              <p>
                当社は、手数料率を変更する場合、相当の周知期間を設けたうえで、当社ウェブサイトもしくは当社指定の方法によりユーザーへ通知します。変更後の手数料率は、通知に定める適用開始日以降に成立した取引から適用されます。
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">第8条（為替手数料および換算レート）</h2>
              <p>
                外貨建ての決済または精算が発生する場合、当社は市場実勢レートに当社所定の為替スプレッド（目安：1米ドルあたり3円前後）を加算した換算レートを適用します。適用レートは日々または必要に応じて更新され、更新後のレートは当社が指定する管理画面等に表示されます。
              </p>
              <p>
                為替レートの更新またはスプレッドの変更が行われた場合、当社は合理的な方法でユーザーに通知します。換算レートは、売上金の送金時点または当社が定める基準時点において最新のレートを適用するものとします。
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">第9条（規約の変更）</h2>
              <p>
                当社は必要と判断した場合には、ユーザーに通知することなく本規約を変更することができます。変更後の規約は、当社のウェブサイトに掲載した時点から効力を生じるものとします。ただし、手数料その他ユーザーに重大な影響を及ぼす変更を行う場合には、合理的な周知期間を設けます。
              </p>
            </section>

            <section className="space-y-3 border-l-2 border-blue-500/40 pl-6 text-sm text-slate-400">
              <p>本規約に関するお問い合わせ先：</p>
              <address className="not-italic">
                D-swipe カスタマーサポート<br />
                info@dlogicai.com
              </address>
            </section>
          </div>
        </div>
        </main>
      </div>
    </DashboardLayout>
  );
}
