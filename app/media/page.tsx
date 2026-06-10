'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PhotoIcon, ArrowUpTrayIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import { mediaApi } from '@/lib/api';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { Card, Button } from '@/components/ui';

interface MediaItem {
  url: string;
  uploaded_at: string;
}

export default function MediaPage() {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAuthStore();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isInitialized]);

  const fetchMedia = async () => {
    try {
      const storedMedia = localStorage.getItem('uploaded_media');
      if (storedMedia) setMedia(JSON.parse(storedMedia));
    } catch (error) {
      console.error('Failed to fetch media:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadedUrls: MediaItem[] = [];
      for (let i = 0; i < files.length; i++) {
        const response = await mediaApi.upload(files[i]);
        uploadedUrls.push({ url: response.data.url, uploaded_at: new Date().toISOString() });
      }
      const newMedia = [...uploadedUrls, ...media];
      localStorage.setItem('uploaded_media', JSON.stringify(newMedia));
      setMedia(newMedia);
      alert(`${files.length}枚の画像をアップロードしました`);
    } catch (error) {
      console.error('Upload failed:', error);
      const detail = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      alert(detail || 'アップロードに失敗しました');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('URLをコピーしました');
  };

  const handleDelete = async (url: string) => {
    if (!confirm('この画像を削除しますか？')) return;
    try {
      await mediaApi.delete(url);
      const newMedia = media.filter((m) => m.url !== url);
      localStorage.setItem('uploaded_media', JSON.stringify(newMedia));
      setMedia(newMedia);
    } catch (error) {
      const detail = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      alert(detail || '削除に失敗しました');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--canvas)' }}>
        <div className="text-lg" style={{ color: 'var(--muted)' }}>
          読み込み中...
        </div>
      </div>
    );
  }

  return (
    <DashboardShell
      title="メディア"
      subtitle="画像をアップロードして管理"
      actions={
        <>
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" multiple className="hidden" />
          <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            <ArrowUpTrayIcon />
            <span className="hidden sm:inline">{isUploading ? 'アップロード中...' : '画像をアップロード'}</span>
          </Button>
        </>
      }
    >
      {media.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 px-6 py-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: 'var(--surface-tint)', color: 'var(--brand)' }}>
            <PhotoIcon className="h-6 w-6" />
          </span>
          <h3 className="text-lg font-bold" style={{ color: 'var(--ink)' }}>
            画像がありません
          </h3>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            最初の画像をアップロードしましょう
          </p>
          <Button size="sm" onClick={() => fileInputRef.current?.click()}>
            画像をアップロード
          </Button>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {media.map((item, index) => (
              <Card key={index} padded={false} hover className="group flex flex-col overflow-hidden">
                <div className="relative h-24 sm:h-32" style={{ background: 'var(--surface-2)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url} alt="Media" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <button onClick={() => window.open(item.url, '_blank')} className="rounded bg-white px-3 py-1.5 text-xs font-semibold text-slate-900">
                      表示
                    </button>
                  </div>
                </div>
                <div className="p-2">
                  <div className="mb-2 truncate text-[10px]" style={{ color: 'var(--muted)' }}>
                    {new Date(item.uploaded_at).toLocaleDateString('ja-JP')}
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <button onClick={() => handleCopyUrl(item.url)} className="lp-act">
                      URL
                    </button>
                    <button
                      onClick={() => handleDelete(item.url)}
                      className="lp-act"
                      style={{ background: 'var(--danger-tint)', color: 'var(--danger-ink)', borderColor: 'transparent' }}
                    >
                      削除
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="flex items-center gap-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px]" style={{ background: 'var(--surface-tint)', color: 'var(--brand)' }}>
              <InformationCircleIcon className="h-5 w-5" />
            </span>
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                合計 {media.length}枚の画像
              </div>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>
                LPエディタでこれらの画像を使用できます
              </div>
            </div>
          </Card>
        </>
      )}
    </DashboardShell>
  );
}
