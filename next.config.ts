import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: これは開発段階でのみ使用してください
    // 本番環境前には必ずESLintエラーを修正してください
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ビルド時の型チェックを継続
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
