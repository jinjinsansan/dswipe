import createIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  // E:\dev 直下の無関係な package-lock.json を workspace root と誤検出し
  // devでGoogleフォント解決が壊れるため、root をこのリポジトリに固定
  turbopack: {
    root: __dirname,
  },
  typescript: {
    // ビルド時の型チェックを継続
    ignoreBuildErrors: false,
  },
  images: {
    // 外部画像の読み込みを許可
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // すべてのHTTPSホストを許可（本番では具体的なドメインを指定推奨）
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
