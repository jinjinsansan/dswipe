'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';

/*
 * エディタの実機プレビュー用iframe。
 * iframe自体を viewportWidth(=実機幅) で描画し、CSS transformでステージに収まるよう縮小する。
 * iframe内は独立したビューポートなので、vw基準のclamp()タイポグラフィや
 * sm:等のブレークポイントが「その幅の実機」とまったく同じに効く。
 *
 * Reactのイベント委譲はiframe境界を越えられないため、createPortalではなく
 * iframe内に独立したReactルートを作ってchildrenを描画する
 * (DraggableBlockEditorは親ツリーのContextに依存しないため安全)。
 */

interface PreviewFrameProps {
  /** iframe内部のビューポート幅(px)。モバイル=375、PC=1280など */
  viewportWidth: number;
  children: ReactNode;
  /** iframe内のスクロールコンテナ(高さ100vhのdiv)を親に渡す。scrollToBlock互換 */
  onScrollContainerChange?: (el: HTMLDivElement | null) => void;
}

export default function PreviewFrame({ viewportWidth, children, onScrollContainerChange }: PreviewFrameProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const rootRef = useRef<Root | null>(null);
  const [scale, setScale] = useState(1);
  const [frameHeight, setFrameHeight] = useState(600);
  const [, setReady] = useState(false);

  // ステージ実寸からscaleとiframe論理高さを算出(リサイズ追従)
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const update = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (w <= 0 || h <= 0) return;
      const s = w / viewportWidth;
      setScale(s);
      setFrameHeight(h / s);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(host);
    return () => observer.disconnect();
  }, [viewportWidth]);

  // iframeドキュメント初期化: 親のCSSを複製し、Reactルートをマウント
  useEffect(() => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    if (!iframe || !doc) return;

    doc.body.style.margin = '0';
    doc.body.style.overflow = 'hidden';
    doc.body.style.background = '#ffffff';

    const STYLE_MARK = 'data-preview-frame-style';
    const syncStyles = () => {
      doc.head.querySelectorAll(`[${STYLE_MARK}]`).forEach((node) => node.remove());
      document.head
        .querySelectorAll('style, link[rel="stylesheet"]')
        .forEach((node) => {
          const clone = node.cloneNode(true) as HTMLElement;
          clone.setAttribute(STYLE_MARK, 'true');
          doc.head.appendChild(clone);
        });
    };
    syncStyles();
    // dev(HMR)やフォント遅延注入でも追従できるよう親headを監視
    const observer = new MutationObserver(syncStyles);
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });

    const scrollContainer = doc.createElement('div');
    scrollContainer.style.height = '100vh';
    scrollContainer.style.overflowY = 'auto';
    doc.body.appendChild(scrollContainer);

    const root = createRoot(scrollContainer);
    rootRef.current = root;
    onScrollContainerChange?.(scrollContainer);
    setReady(true); // マウント済みルートへchildrenを流すための再レンダー

    return () => {
      observer.disconnect();
      onScrollContainerChange?.(null);
      rootRef.current = null;
      // レンダー中の同期unmountを避ける
      setTimeout(() => root.unmount());
      scrollContainer.remove();
    };
    // onScrollContainerChangeはuseCallback前提。iframe再生成は不要
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 親が再レンダーされるたびに最新のchildrenをiframe内ルートへ反映
  useEffect(() => {
    rootRef.current?.render(<>{children}</>);
  });

  return (
    <div ref={hostRef} className="h-full w-full overflow-hidden">
      <iframe
        ref={iframeRef}
        title="LPプレビュー"
        style={{
          width: `${viewportWidth}px`,
          height: `${frameHeight}px`,
          border: '0',
          display: 'block',
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          background: '#ffffff',
        }}
      />
    </div>
  );
}
