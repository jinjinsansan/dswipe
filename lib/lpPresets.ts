/* LP一式プリセット（Momentum）
   mock: design_handoff_dswipe/D-Swipe Templates.html の TEMPLATES を移植。
   1クリックで完成形のスワイプLP(5〜6枚)を生成する。
   背景は backgroundPreset(lib/backgroundPresets.ts = mock BG_PRESETS のグラデ)を適用。
   backgroundColor は近似単色フォールバック。heroブロックは既定で動画背景＋
   backgroundColor をオーバーレイ基調に使うため、TOPページ同様の見た目になる。 */

import type { BlockContent } from '@/types/templates';
import type { BackgroundPresetKey } from '@/lib/backgroundPresets';

type PresetPalette = {
  backgroundPreset: BackgroundPresetKey;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
};

const BG: Record<string, PresetPalette> = {
  navy: { backgroundPreset: 'navy', backgroundColor: '#0B1F3A', textColor: '#FFFFFF', accentColor: '#22D3EE' },
  deep: { backgroundPreset: 'deep', backgroundColor: '#0B1220', textColor: '#F8FAFC', accentColor: '#22D3EE' },
  cyan: { backgroundPreset: 'cyan', backgroundColor: '#0284C7', textColor: '#FFFFFF', accentColor: '#E0F2FE' },
  teal: { backgroundPreset: 'teal', backgroundColor: '#0E7490', textColor: '#FFFFFF', accentColor: '#22D3EE' },
  aurora: { backgroundPreset: 'aurora', backgroundColor: '#0B1F3A', textColor: '#FFFFFF', accentColor: '#F59E0B' },
  light: { backgroundPreset: 'light', backgroundColor: '#F4F8FD', textColor: '#0B1F3A', accentColor: '#0284C7' },
};

export interface LpPresetBlock {
  blockType: string;
  content: BlockContent;
}

export interface LpPreset {
  key: string;
  category: string;
  name: string;
  description: string;
  priceLabel: string;
  blocks: LpPresetBlock[];
}

const momentum = (palette: PresetPalette, rest: Record<string, unknown>) =>
  ({ ...palette, themeKey: 'momentum', ...rest }) as unknown as BlockContent;

export const LP_PRESETS: LpPreset[] = [
  {
    key: 'challenge',
    category: 'チャレンジ型',
    name: '7日間チャレンジ',
    description: '無料オファーでリスト獲得。SNS集客の王道。',
    priceLabel: '無料 / リスト獲得',
    blocks: [
      {
        blockType: 'top-hero-1',
        content: momentum(BG.navy, {
          tagline: '7-DAY CHALLENGE',
          title: '7日間で、集客が変わる。',
          subtitle: 'SNSだけで月100リスト。再現性のある導線を、スワイプ1本で。',
          buttonText: '無料で受け取る',
          buttonUrl: '',
        }),
      },
      {
        blockType: 'top-problem-1',
        content: momentum(BG.deep, {
          title: 'こんな悩み、ありませんか？',
          subtitle: 'ひとつでも当てはまるなら、このまま読み進めてください。',
          problems: ['毎日投稿しても反応が薄い', 'LPの作り方が分からない', '何を直せば伸びるか不明'],
        }),
      },
      {
        blockType: 'top-highlights-1',
        content: momentum(BG.cyan, {
          tagline: 'WHAT YOU GET',
          title: '7日間で手に入るもの',
          features: [
            { icon: 'rocket', title: '最短3分のLP量産術', description: 'テンプレに沿って入力するだけ' },
            { icon: 'chart', title: '数字で改善する型', description: '離脱とCTAで勝ち筋を発見' },
            { icon: 'shield', title: '7日間の伴走サポート', description: 'つまずいてもすぐ質問' },
          ],
        }),
      },
      {
        blockType: 'top-testimonials-1',
        content: momentum(BG.teal, {
          title: '参加者の声',
          subtitle: '半信半疑から始めた人が、成果を出しています。',
          testimonials: [{ quote: '3日目で初めてのリストが30件。やってよかった。', name: '佐藤 あや', role: '受講3週間 / 副業コーチ' }],
        }),
      },
      {
        blockType: 'top-cta-1',
        content: momentum(BG.cyan, {
          eyebrow: 'GET STARTED',
          title: '無料で、受け取ろう。',
          subtitle: 'メール登録だけ。今すぐ7日間を始める。',
          buttonText: '無料で受け取る',
          buttonUrl: '',
        }),
      },
    ],
  },
  {
    key: 'course',
    category: '講座・コース型',
    name: 'オンライン講座',
    description: '動画・有料講座の販売に。信頼を積み上げる構成。',
    priceLabel: '9,800 P',
    blocks: [
      {
        blockType: 'top-hero-1',
        content: momentum(BG.teal, {
          tagline: 'ONLINE COURSE',
          title: '売れる文章の作り方講座',
          subtitle: 'コピー1本で売上を変える。プロの型を体系的に。',
          buttonText: '講座を申し込む',
          buttonUrl: '',
        }),
      },
      {
        blockType: 'top-highlights-1',
        content: momentum(BG.light, {
          tagline: 'CURRICULUM',
          title: '学べること',
          features: [
            { icon: 'insight', title: '売れる見出しの公式', description: '3秒で続きを読ませる' },
            { icon: 'documentation', title: '感情を動かす本文設計', description: 'ストーリーの組み立て方' },
            { icon: 'growth', title: 'CTAの最適配置', description: 'クリックされる導線' },
          ],
        }),
      },
      {
        blockType: 'top-testimonials-1',
        content: momentum(BG.navy, {
          title: '受講者の声',
          subtitle: '型を学んだ人から、結果が出ています。',
          testimonials: [{ quote: '学んだ翌週、初めてのセールスで12万円。型は裏切らない。', name: '田中 みう', role: '受講2ヶ月 / 個人事業主' }],
        }),
      },
      {
        blockType: 'top-faq-1',
        content: momentum(BG.light, {
          title: 'よくある質問',
          subtitle: '申し込み前の不安にお答えします。',
          items: [
            { question: '初心者でも大丈夫？', answer: 'はい。基礎から順に学べます。' },
            { question: '返金はできる？', answer: '14日間の返金保証つきです。' },
          ],
        }),
      },
      {
        blockType: 'top-pricing-1',
        content: momentum(BG.aurora, {
          title: '受講料',
          subtitle: '今月の募集 残り 8 名',
          plans: [
            {
              name: 'オンライン講座',
              price: '9,800 P',
              period: '',
              description: '通常 29,800 P → 限定価格。14日間の返金保証つき。',
              features: ['全カリキュラム視聴', '実践テンプレ配布', '14日間返金保証'],
              buttonText: '講座を申し込む',
              highlighted: true,
            },
          ],
        }),
      },
      {
        blockType: 'top-cta-1',
        content: momentum(BG.cyan, {
          eyebrow: 'START TODAY',
          title: '今日から、書ける人へ。',
          subtitle: 'ボタンひとつで受講スタート。',
          buttonText: '講座を申し込む',
          buttonUrl: '',
        }),
      },
    ],
  },
  {
    key: 'sales',
    category: 'セールス型',
    name: '限定オファー',
    description: '期間限定・高単価商品の販売に。勢いで決める。',
    priceLabel: '高単価向け',
    blocks: [
      {
        blockType: 'top-hero-1',
        content: momentum(BG.aurora, {
          tagline: 'LIMITED OFFER',
          title: 'いまだけ、特別価格。',
          subtitle: '次にこの価格で出る保証はありません。',
          buttonText: '今すぐ申し込む',
          buttonUrl: '',
        }),
      },
      {
        blockType: 'top-problem-1',
        content: momentum(BG.deep, {
          title: '値段で、諦めていませんか？',
          subtitle: '本当は、もう答えが出ているはずです。',
          problems: ['やりたいのに先延ばし', '他社は高すぎて手が出ない', '今が始めどきだと分かってる'],
        }),
      },
      {
        blockType: 'top-pricing-1',
        content: momentum(BG.aurora, {
          title: '特別価格',
          subtitle: '先着50名 — 残り 12 名',
          plans: [
            {
              name: '限定オファー',
              price: '39,800 P',
              period: '',
              description: '通常 98,000 P → 期間限定価格。',
              features: ['本編すべて', '個別サポート', '30日間の全額返金保証'],
              buttonText: '今すぐ申し込む',
              highlighted: true,
            },
          ],
        }),
      },
      {
        blockType: 'top-testimonials-1',
        content: momentum(BG.teal, {
          title: '購入者の声',
          subtitle: '迷っていた人ほど、満足しています。',
          testimonials: [{ quote: '迷って損した。もっと早く決めればよかった。', name: '中村 ゆい', role: '購入者 / 経営者' }],
        }),
      },
      {
        blockType: 'top-cta-1',
        content: momentum(BG.cyan, {
          eyebrow: 'LAST CALL',
          title: '締切まで、あとわずか。',
          subtitle: 'この価格は今だけ。後悔しない選択を。',
          buttonText: '今すぐ申し込む',
          buttonUrl: '',
        }),
      },
    ],
  },
  {
    key: 'salon',
    category: 'サロン・継続型',
    name: 'メンバーシップ',
    description: '月額サロンの募集に。継続的な関係をつくる。',
    priceLabel: '¥2,980 / 月',
    blocks: [
      {
        blockType: 'top-hero-1',
        content: momentum(BG.navy, {
          tagline: 'MEMBERSHIP',
          title: 'ひとりで、悩まない。',
          subtitle: '学び続ける仲間と、結果が出るまで伴走するサロン。',
          buttonText: 'サロンに参加する',
          buttonUrl: '',
        }),
      },
      {
        blockType: 'top-highlights-1',
        content: momentum(BG.light, {
          tagline: 'MEMBER BENEFITS',
          title: '会員特典',
          features: [
            { icon: 'library', title: '限定LP・テンプレ配布', description: '毎月の新作テンプレ' },
            { icon: 'time', title: '月2回の勉強会', description: 'アーカイブ見放題' },
            { icon: 'partnership', title: '質問し放題フィード', description: 'つまずきを即解決' },
          ],
        }),
      },
      {
        blockType: 'top-testimonials-1',
        content: momentum(BG.teal, {
          title: '会員の声',
          subtitle: '続けるほど、成果につながります。',
          testimonials: [{ quote: '毎月の勉強会が刺激に。半年で売上が3倍になりました。', name: '佐藤 あや', role: '会員歴6ヶ月' }],
        }),
      },
      {
        blockType: 'top-pricing-1',
        content: momentum(BG.aurora, {
          title: '月額メンバーシップ',
          subtitle: '248名が参加中',
          plans: [
            {
              name: 'メンバーシップ',
              price: '¥2,980',
              period: '/月',
              description: '通常 ¥4,980 → いまだけ。いつでも退会OK・初月半額。',
              features: ['限定コンテンツ見放題', '月2回の勉強会', '質問し放題フィード'],
              buttonText: 'サロンに参加する',
              highlighted: true,
            },
          ],
        }),
      },
      {
        blockType: 'top-cta-1',
        content: momentum(BG.cyan, {
          eyebrow: 'JOIN US',
          title: '仲間と、前に進もう。',
          subtitle: '今月の参加枠は残りわずか。',
          buttonText: 'サロンに参加する',
          buttonUrl: '',
        }),
      },
    ],
  },
];

export const getLpPreset = (key: string): LpPreset | undefined =>
  LP_PRESETS.find((preset) => preset.key === key);
