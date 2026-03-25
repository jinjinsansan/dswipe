import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: これは開発段階でのみ使用してください
    // 本番環境前には必ずESLintエラーを修正してください
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: これは開発段階でのみ使用してください
    // 本番環境前には必ず型エラーを修正してください
    ignoreBuildErrors: true,
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

export default nextConfig;
