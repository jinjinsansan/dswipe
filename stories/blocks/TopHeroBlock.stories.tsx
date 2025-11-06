import type { Meta, StoryObj } from '@storybook/react';
import TopHeroBlock from '@/components/blocks/TopHeroBlock';
import type { HeroBlockContent } from '@/types/templates';

const baseContent: HeroBlockContent = {
  tagline: 'AI Launch Suite',
  highlightText: '5分でデプロイ完了',
  title: '誰でもレスポンシブLPを生成できます',
  subtitle:
    'ヒアリングに回答するだけで、AIが最適なコピーとデザインを生成。全デバイスに対応した最新テンプレートを数分で用意できます。',
  buttonText: '無料で始める',
  buttonUrl: '#',
  secondaryButtonText: '導入事例を確認',
  secondaryButtonUrl: '#',
  textColor: '#F8FAFC',
  accentColor: '#38BDF8',
  overlayColor: '#0B1120',
  backgroundColor: '#020617',
  buttonColor: '#22D3EE',
  secondaryButtonColor: '#F8FAFC',
  backgroundVideoUrl: '',
};

const meta: Meta<typeof TopHeroBlock> = {
  title: 'Blocks/TopHeroBlock',
  component: TopHeroBlock,
  args: {
    content: baseContent,
  },
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'responsive',
    },
  },
};

export default meta;

type Story = StoryObj<typeof TopHeroBlock>;

export const Default: Story = {};

export const LongCopy: Story = {
  args: {
    content: {
      ...baseContent,
      title: '複数行のヘッドラインでも崩れないレスポンシブ設計',
      subtitle:
        'メインコピーが長くなっても自動で折り返しと字間を調整し、スマートフォンでも視認性を維持します。CTA ボタンはスタック配置からインライン配置まで滑らかに遷移します。',
    },
  },
};

export const AccentVariants: Story = {
  args: {
    content: {
      ...baseContent,
      accentColor: '#F97316',
      buttonColor: '#F97316',
      secondaryButtonColor: '#FBBF24',
    },
  },
};
