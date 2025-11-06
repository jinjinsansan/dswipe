import type { Meta, StoryObj } from '@storybook/nextjs';
import TopGuaranteeBlock from '@/components/blocks/TopGuaranteeBlock';
import type { GuaranteeBlockContent } from '@/types/templates';

const baseContent: GuaranteeBlockContent = {
  badgeText: '安心保証',
  title: '30日間全額返金をお約束します',
  subtitle:
    '導入後のサポートも専任チームが担当。成果が出なければメール一本で全額返金に対応します。',
  guaranteeDetails:
    '導入初期は週次で KPI を共有いただきながら、コンバージョン改善に向けた A/B テストの支援もセットでご提供します。',
  bulletPoints: [
    '専用 Slack チャンネルで 24 時間以内に回答',
    'Playwright レポートの読み方ハンドブック付き',
    'AI テンプレートのチューニングワークショップ開催',
  ],
  backgroundColor: '#020617',
  textColor: '#F8FAFC',
  accentColor: '#34D399',
};

const meta: Meta<typeof TopGuaranteeBlock> = {
  title: 'Blocks/TopGuaranteeBlock',
  component: TopGuaranteeBlock,
  args: {
    content: baseContent,
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof TopGuaranteeBlock>;

export const Default: Story = {};

export const LightMode: Story = {
  args: {
    content: {
      ...baseContent,
      backgroundColor: '#FFFFFF',
      textColor: '#0F172A',
      accentColor: '#2563EB',
    },
  },
  parameters: {
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#FFFFFF' },
      ],
    },
  },
};
