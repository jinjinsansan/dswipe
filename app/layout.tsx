import type { Metadata } from "next";
import { Noto_Sans_JP, Inter, M_PLUS_1p, Zen_Kaku_Gothic_New } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

// オプション1: Noto Sans JP（現在使用中）- Google公式、企業サイトで最も使われている
const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
});

// オプション2: Inter + Noto Sans JP - グローバル企業感（英語：Inter、日本語：Noto Sans JP）
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

// オプション3: M PLUS 1p - モダン・スタートアップ感
const mPlus1p = M_PLUS_1p({
  variable: "--font-m-plus-1p",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "800"],
});

// オプション4: Zen Kaku Gothic New - 角ゴシック、硬派・信頼感
const zenKakuGothicNew = Zen_Kaku_Gothic_New({
  variable: "--font-zen-kaku",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
});

// 👇 ここを変更してフォントを切り替え
// 'notoSansJP' | 'inter' | 'mPlus1p' | 'zenKakuGothicNew'
const ACTIVE_FONT = 'mPlus1p';

const fontMap = {
  notoSansJP: notoSansJP.variable,
  inter: `${inter.variable} ${notoSansJP.variable}`, // 英語Inter + 日本語Noto Sans JP
  mPlus1p: mPlus1p.variable,
  zenKakuGothicNew: zenKakuGothicNew.variable,
};

export const metadata: Metadata = {
  title: "D-swipe - 情報商材特化LP作成プラットフォーム",
  description: "情報商材に特化したランディングページを簡単に作成・公開できるプラットフォーム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${fontMap[ACTIVE_FONT]} font-sans antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
