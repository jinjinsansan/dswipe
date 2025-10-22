import type { Metadata } from "next";
import { Noto_Sans_JP, Inter, M_PLUS_1p, Zen_Kaku_Gothic_New, BIZ_UDPGothic, Sawarabi_Gothic, Zen_Maru_Gothic, Roboto } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import NextTopLoader from 'nextjs-toploader';
import { GoogleOAuthProvider } from '@react-oauth/google';

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

// オプション5: BIZ UDPGothic - モリサワのUD Gothic、企業で広く使われている
const bizUdpGothic = BIZ_UDPGothic({
  variable: "--font-biz-udp",
  subsets: ["latin"],
  weight: ["400", "700"],
});

// オプション6: Sawarabi Gothic - シンプルでクリーン、読みやすい
const sawarabiGothic = Sawarabi_Gothic({
  variable: "--font-sawarabi",
  subsets: ["latin"],
  weight: ["400"],
});

// オプション7: Zen Maru Gothic - 丸ゴシック、優しく親しみやすい
const zenMaruGothic = Zen_Maru_Gothic({
  variable: "--font-zen-maru",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
});

// オプション8: Roboto + Noto Sans JP - グローバル/国内併用向け
const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

// 👇 ここを変更してフォントを切り替え
// 'notoSansJP' | 'inter' | 'mPlus1p' | 'zenKakuGothicNew' | 'bizUdpGothic' | 'sawarabiGothic' | 'zenMaruGothic' | 'robotoNoto'
const ACTIVE_FONT = 'robotoNoto';

const fontConfig = {
  notoSansJP: {
    variable: notoSansJP.variable,
    className: notoSansJP.className,
  },
  inter: {
    variable: `${inter.variable} ${notoSansJP.variable}`,
    className: `${inter.className}`,
  },
  mPlus1p: {
    variable: mPlus1p.variable,
    className: mPlus1p.className,
  },
  zenKakuGothicNew: {
    variable: zenKakuGothicNew.variable,
    className: zenKakuGothicNew.className,
  },
  bizUdpGothic: {
    variable: bizUdpGothic.variable,
    className: bizUdpGothic.className,
  },
  sawarabiGothic: {
    variable: sawarabiGothic.variable,
    className: sawarabiGothic.className,
  },
  zenMaruGothic: {
    variable: zenMaruGothic.variable,
    className: zenMaruGothic.className,
  },
  robotoNoto: {
    variable: `${roboto.variable} ${notoSansJP.variable}`,
    className: `${roboto.className} ${notoSansJP.className}`,
  },
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
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const shouldUseGoogleProvider = Boolean(googleClientId && googleClientId.trim().length > 0);

  return (
    <html lang="ja">
      <body className={`${fontConfig[ACTIVE_FONT].className} antialiased`}>
        <NextTopLoader
          color="#3b82f6"
          height={3}
          showSpinner={false}
          shadow="0 0 10px #3b82f6,0 0 5px #3b82f6"
        />
        {shouldUseGoogleProvider ? (
          <GoogleOAuthProvider clientId={googleClientId!}>
            <AuthProvider>
              {children}
            </AuthProvider>
          </GoogleOAuthProvider>
        ) : (
          <AuthProvider>
            {children}
          </AuthProvider>
        )}
      </body>
    </html>
  );
}
