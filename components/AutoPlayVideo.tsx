'use client';

import { useEffect, useRef } from 'react';
import type { VideoHTMLAttributes } from 'react';

type AutoPlayVideoProps = Omit<VideoHTMLAttributes<HTMLVideoElement>,
  'ref' | 'src' | 'autoPlay' | 'loop' | 'muted' | 'playsInline' | 'controls'
> & {
  src: string;
  onAutoplayError?: (error: unknown) => void;
};

export default function AutoPlayVideo({ src, className, onAutoplayError, ...rest }: AutoPlayVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    let retryTimeout: number | null = null;
    let attempts = 0;
    const maxAttempts = 4;
    let userInteracted = false;

    const ensureMuted = () => {
      video.muted = true;
      video.defaultMuted = true;
      video.setAttribute('muted', '');
      video.volume = 0;
    };

    const attemptPlay = () => {
      ensureMuted();
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // 再生成功 - コントロールを完全に隠す
            video.removeAttribute('controls');
          })
          .catch((error) => {
            console.warn('[AutoPlayVideo] Autoplay failed:', error.message);
            onAutoplayError?.(error);

            // リトライロジック
            if (retryTimeout === null && attempts < maxAttempts) {
              retryTimeout = window.setTimeout(() => {
                retryTimeout = null;
                attempts += 1;
                attemptPlay();
              }, 300);
            } else if (!userInteracted) {
              // 全てのリトライが失敗した場合、ユーザーインタラクションを待つ
              console.info('[AutoPlayVideo] Waiting for user interaction...');
            }
          });
      }
    };

    // ユーザーインタラクション後に再生を試みる
    const handleUserInteraction = () => {
      if (!userInteracted) {
        userInteracted = true;
        console.info('[AutoPlayVideo] User interaction detected, attempting play...');
        attemptPlay();
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && video.paused) {
        attemptPlay();
      }
    };

    const handleCanPlay = () => {
      if (video.paused) {
        attemptPlay();
      }
    };

    // 初回再生試行
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      attemptPlay();
    } else {
      video.addEventListener('canplay', handleCanPlay, { once: true });
      video.addEventListener('loadeddata', handleCanPlay, { once: true });
    }

    // ユーザーインタラクションイベントリスナー（1回のみ）
    const interactionEvents = ['click', 'touchstart', 'touchend', 'scroll', 'keydown'];
    interactionEvents.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true, passive: true });
    });

    // Visibility change
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // ビデオが一時停止された場合の自動再開
    const handlePause = () => {
      if (!video.seeking && !video.ended) {
        attemptPlay();
      }
    };
    video.addEventListener('pause', handlePause);

    return () => {
      if (retryTimeout !== null) {
        window.clearTimeout(retryTimeout);
      }
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadeddata', handleCanPlay);
      video.removeEventListener('pause', handlePause);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      interactionEvents.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [src, onAutoplayError]);

  return (
    <video
      ref={videoRef}
      className={className}
      src={src}
      autoPlay
      loop
      muted
      playsInline
      controls={false}
      disablePictureInPicture
      disableRemotePlayback
      preload="auto"
      style={{
        WebkitPlaysInline: true,
      } as React.CSSProperties}
      {...rest}
    />
  );
}
