'use client';

import { useEffect, useRef } from 'react';
import type { VideoHTMLAttributes } from 'react';

type AutoPlayVideoProps = Omit<VideoHTMLAttributes<HTMLVideoElement>,
  'ref' | 'src' | 'autoPlay' | 'loop' | 'muted' | 'playsInline'
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

    const ensureMuted = () => {
      video.muted = true;
      video.defaultMuted = true;
      video.setAttribute('muted', '');
    };

    const attemptPlay = () => {
      ensureMuted();
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          onAutoplayError?.(error);

          if (retryTimeout === null && attempts < maxAttempts) {
            retryTimeout = window.setTimeout(() => {
              retryTimeout = null;
              attempts += 1;
              attemptPlay();
            }, 200);
          }
        });
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        attemptPlay();
      }
    };

    const handleCanPlay = () => {
      attemptPlay();
    };

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      attemptPlay();
    } else {
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('loadeddata', handleCanPlay);
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (retryTimeout !== null) {
        window.clearTimeout(retryTimeout);
      }
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadeddata', handleCanPlay);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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
      preload="auto"
      {...rest}
    />
  );
}
