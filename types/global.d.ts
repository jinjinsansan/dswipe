// Visual Viewport API type definitions for iOS Safari support
interface VisualViewport extends EventTarget {
  readonly offsetLeft: number;
  readonly offsetTop: number;
  readonly pageLeft: number;
  readonly pageTop: number;
  readonly width: number;
  readonly height: number;
  readonly scale: number;
  onresize: ((this: VisualViewport, ev: Event) => any) | null;
  onscroll: ((this: VisualViewport, ev: Event) => any) | null;
  addEventListener<K extends keyof VisualViewportEventMap>(
    type: K,
    listener: (this: VisualViewport, ev: VisualViewportEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof VisualViewportEventMap>(
    type: K,
    listener: (this: VisualViewport, ev: VisualViewportEventMap[K]) => any,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

interface VisualViewportEventMap {
  resize: Event;
  scroll: Event;
}

interface Window {
  visualViewport?: VisualViewport;
}

// Viewport meta tag extensions for iOS
interface Viewport {
  width?: string | number;
  initialScale?: number;
  maximumScale?: number;
  userScalable?: boolean;
  viewportFit?: 'auto' | 'contain' | 'cover';
  interactiveWidget?: 'resizes-visual' | 'resizes-content' | 'overlays-content';
}

declare module 'swiper/css' {
  const content: string;
  export default content;
}

declare module 'swiper/css/pagination' {
  const content: string;
  export default content;
}

declare module 'swiper/css/free-mode' {
  const content: string;
  export default content;
}

declare module 'swiper/css/effect-creative' {
  const content: string;
  export default content;
}

declare module '*.css' {
  const content: string;
  export default content;
}

export {};
