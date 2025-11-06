// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/react';
import TopFAQBlock from '@/components/blocks/TopFAQBlock';
import type { FAQBlockContent } from '@/types/templates';

const baseContent: FAQBlockContent = {
  title: 'よくある質問',
  subtitle: '導入前の疑問にお答えします。',
  items: [
    {
      question: 'AI が生成したコピーはどこまで編集できますか？',
      answer: 'ブロックエディタからすべて編集可能です。Playwright の自動スクリーンショットを見ながら最適化できます。',
    },
    {
      question: 'レスポンシブ崩れが起きた場合の確認方法は？',
      answer: 'ビジュアルリグレッションテストの差分を確認してから Storybook 上で該当ブロックのみを再検証できます。',
    },
  ],
  backgroundColor: '#0F172A',
  textColor: '#F8FAFC',
  accentColor: '#38BDF8',
};

const meta: Meta<typeof TopFAQBlock> = {
  title: 'Blocks/TopFAQBlock',
  component: TopFAQBlock,
  args: {
    content: baseContent,
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof TopFAQBlock>;

export const Default: Story = {};

export const DenseItems: Story = {
  args: {
    content: {
      ...baseContent,
      items: new Array(4).fill(null).map((_, idx) => ({
        question: `サンプル質問 ${idx + 1}`,
        answer:
          '回答文が長くなるケースでも折り返しと余白が適切に調整され、モバイルでも段落が読みやすいように設計されています。',
      })),
    },
  },
};
