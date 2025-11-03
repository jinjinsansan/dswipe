import type { Meta, StoryObj } from '@storybook/react';
import TopInlineCTABlock from '@/components/blocks/TopInlineCTABlock';
import type { InlineCTABlockContent } from '@/types/templates';

const baseContent: InlineCTABlockContent = {
  eyebrow: '限定ウェビナー',
  title: '公開前UIの全貌をライブで解説',
  subtitle:
    '実運用中のレスポンシブ調整ノウハウを余すことなく共有します。配布資料と収録動画も後日送付。',
  buttonText: '参加登録する',
  buttonUrl: '#',
  textColor: '#0F172A',
  accentColor: '#2563EB',
  backgroundColor: '#FFFFFF',
  buttonColor: '#2563EB',
};

const meta: Meta<typeof TopInlineCTABlock> = {
  title: 'Blocks/TopInlineCTABlock',
  component: TopInlineCTABlock,
  args: {
    content: baseContent,
  },
  parameters: {
    layout: 'padded',
  },
};

export default meta;

type Story = StoryObj<typeof TopInlineCTABlock>;

export const Default: Story = {};

export const DarkTheme: Story = {
  args: {
    content: {
      ...baseContent,
      backgroundColor: '#020617',
      textColor: '#F8FAFC',
      accentColor: '#38BDF8',
      buttonColor: '#38BDF8',
    },
  },
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#020617' },
      ],
    },
  },
};

export const LongSubtitle: Story = {
  args: {
    content: {
      ...baseContent,
      subtitle:
        '導入後30日での成果創出を想定したロードマップと、各フェーズで用意しておくべきコンテンツ・動画・広告のサンプルを共有します。',
    },
  },
};
