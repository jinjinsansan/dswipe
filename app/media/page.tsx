'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { mediaApi } from '@/lib/api';
import DSwipeLogo from '@/components/DSwipeLogo';
import {
  ArrowLeftIcon,
  CloudArrowUpIcon,
  PhotoIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  InformationCircleIcon,
  ChartBarIcon,
  PlusCircleIcon,
  CubeIcon,
  BanknotesIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

interface MediaItem {
  url: string;
  uploaded_at: string;
}

export default function MediaPage() {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized, logout } = useAuthStore();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isInitialized) return;
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchMedia();
  }, [isAuthenticated, isInitialized]);

  const fetchMedia = async () => {
    try {
      // メディア一覧を取得する実装（バックエンドに追加が必要）
      // 仮でローカルストレージから取得
      const storedMedia = localStorage.getItem('uploaded_media');
      if (storedMedia) {
        setMedia(JSON.parse(storedMedia));
      }
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
        const file = files[i];
        const response = await mediaApi.upload(file);
        uploadedUrls.push({
          url: response.data.url,
          uploaded_at: new Date().toISOString(),
        });
      }

      // ローカルストレージに保存
      const newMedia = [...uploadedUrls, ...media];
      localStorage.setItem('uploaded_media', JSON.stringify(newMedia));
      setMedia(newMedia);
      
      alert(`${files.length}枚の画像をアップロードしました`);
    } catch (error: any) {
      console.error('Upload failed:', error);
      alert(error.response?.data?.detail || 'アップロードに失敗しました');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
      const newMedia = media.filter(m => m.url !== url);
      localStorage.setItem('uploaded_media', JSON.stringify(newMedia));
      setMedia(newMedia);
      alert('画像を削除しました');
    } catch (error: any) {
      alert(error.response?.data?.detail || '削除に失敗しました');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-slate-600 text-lg">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className="hidden sm:flex w-52 bg-white border-r border-slate-200 flex flex-col">
        <div className="px-6 h-16 border-b border-slate-200 flex items-center">
          <Link href="/dashboard" className="block">
            <DSwipeLogo size="medium" showFullName={true} />
          </Link>
        </div>

        <nav className="flex-1 p-3">
          <div className="space-y-0.5">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors text-sm font-medium"
            >
              <ChartBarIcon className="h-4 w-4" aria-hidden="true" />
              <span>ダッシュボード</span>
            </Link>
            
            <Link
              href="/lp/create"
              className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors text-sm font-medium"
            >
              <PlusCircleIcon className="h-4 w-4" aria-hidden="true" />
              <span>新規LP作成</span>
            </Link>
            
            <Link
              href="/products"
              className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors text-sm font-medium"
            >
              <CubeIcon className="h-4 w-4" aria-hidden="true" />
              <span>商品管理</span>
            </Link>
            
            <Link
              href="/points/purchase"
              className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors text-sm font-medium"
            >
              <BanknotesIcon className="h-4 w-4" aria-hidden="true" />
              <span>ポイント購入</span>
            </Link>
            
            <Link
              href="/media"
              className="flex items-center space-x-2 px-3 py-2 text-white bg-blue-600 rounded text-sm font-medium"
            >
              <PhotoIcon className="h-4 w-4" aria-hidden="true" />
              <span>メディア</span>
            </Link>
          </div>
        </nav>

        <div className="p-3 border-t border-slate-200">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-slate-900 text-sm font-medium truncate">{user?.username}</div>
              <div className="text-slate-500 text-xs">{user?.user_type}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors text-xs font-medium"
          >
            ログアウト
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="bg-white border-b border-slate-200 px-2 sm:px-4 lg:px-6 h-16 flex items-center justify-between gap-2">
          {/* Left: Page Title & Description (Hidden on Mobile) */}
          <div className="hidden sm:block flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-semibold text-slate-900 mb-0.5">メディア</h1>
            <p className="text-slate-500 text-[10px] sm:text-xs truncate">画像をアップロードして管理</p>
          </div>
          
          {/* Right: Actions & User Info */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {/* Upload Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              multiple
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-2 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-semibold disabled:opacity-50 whitespace-nowrap"
            >
              <span className="hidden sm:inline-flex items-center gap-2">
                <CloudArrowUpIcon className="h-4 w-4" aria-hidden="true" />
                {isUploading ? 'アップロード中...' : '画像をアップロード'}
              </span>
              <span className="sm:hidden inline-flex items-center gap-2">
                <CloudArrowUpIcon className="h-4 w-4" aria-hidden="true" />
                {isUploading ? '中...' : 'アップロード'}
              </span>
            </button>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="sm:hidden p-2 text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" aria-hidden="true" />
            </button>
            
            {/* User Avatar (Desktop) */}
            <div className="hidden sm:flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu (Mobile Only) */}
        {showMobileMenu && (
          <div className="sm:hidden bg-white border-b border-slate-200 p-3">
            <nav className="space-y-0.5 mb-3">
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors text-sm font-medium"
              >
                <ChartBarIcon className="h-4 w-4" aria-hidden="true" />
                <span>ダッシュボード</span>
              </Link>
              <Link
                href="/lp/create"
                className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors text-sm font-medium"
              >
                <PlusCircleIcon className="h-4 w-4" aria-hidden="true" />
                <span>新規LP作成</span>
              </Link>
              <Link
                href="/products"
                className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors text-sm font-medium"
              >
                <CubeIcon className="h-4 w-4" aria-hidden="true" />
                <span>商品管理</span>
              </Link>
              <Link
                href="/points/purchase"
                className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors text-sm font-medium"
              >
                <BanknotesIcon className="h-4 w-4" aria-hidden="true" />
                <span>ポイント購入</span>
              </Link>
              <Link
                href="/media"
                className="flex items-center space-x-2 px-3 py-2 text-white bg-blue-600 rounded text-sm font-medium"
                onClick={() => setShowMobileMenu(false)}
              >
                <PhotoIcon className="h-4 w-4" aria-hidden="true" />
                <span>メディア</span>
              </Link>
            </nav>
            <div className="px-3 py-2 border-t border-slate-200 pt-2">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-slate-900 text-sm font-medium truncate">{user?.username}</div>
                  <div className="text-slate-500 text-xs">{user?.user_type}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors text-xs font-medium"
              >
                ログアウト
              </button>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6">

          {/* Media Grid */}
          {media.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-sm">
              <div className="mx-auto mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <PhotoIcon className="h-8 w-8" aria-hidden="true" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-1 sm:mb-2">画像がありません</h3>
              <p className="text-slate-500 text-xs sm:text-sm mb-3 sm:mb-4">最初の画像をアップロードしましょう</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-semibold"
              >
                <CloudArrowUpIcon className="h-4 w-4" aria-hidden="true" />
                画像をアップロード
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-3">
              {media.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-blue-200 transition-all group shadow-sm"
                >
                  {/* Image */}
                  <div className="relative h-20 sm:h-32 bg-slate-100">
                    <img
                      src={item.url}
                      alt="Media"
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => window.open(item.url, '_blank')}
                        className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-white text-slate-900 rounded text-[10px] sm:text-xs font-medium"
                      >
                        <EyeIcon className="h-3 w-3" aria-hidden="true" />
                        表示
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-1.5 sm:p-2">
                    <div className="text-slate-500 text-[8px] sm:text-[10px] mb-1 sm:mb-2 truncate">
                      {new Date(item.uploaded_at).toLocaleDateString('ja-JP')}
                    </div>
                    <div className="grid grid-cols-2 gap-0.5 sm:gap-1">
                      <button
                        onClick={() => handleCopyUrl(item.url)}
                        className="inline-flex items-center gap-1 px-1 sm:px-2 py-0.5 sm:py-1 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-colors text-[10px] sm:text-xs font-medium"
                      >
                        <DocumentDuplicateIcon className="h-3 w-3" aria-hidden="true" />
                        URL
                      </button>
                      <button
                        onClick={() => handleDelete(item.url)}
                        className="inline-flex items-center gap-1 px-1 sm:px-2 py-0.5 sm:py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors text-[10px] sm:text-xs font-medium"
                      >
                        <TrashIcon className="h-3 w-3" aria-hidden="true" />
                        削除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info */}
          {media.length > 0 && (
            <div className="mt-4 sm:mt-6 bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-sm">
              <div className="flex items-center gap-2 sm:gap-3">
                <InformationCircleIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                <div>
                  <div className="text-slate-900 text-xs sm:text-sm font-medium">合計 {media.length}枚の画像</div>
                  <div className="text-slate-500 text-[10px] sm:text-xs">LPエディタでこれらの画像を使用できます</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
