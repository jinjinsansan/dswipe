'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { mediaApi } from '@/lib/api';
import DSwipeLogo from '@/components/DSwipeLogo';

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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-52 bg-gray-800/50 backdrop-blur-sm border-r border-gray-700 flex flex-col">
        <div className="px-6 h-16 border-b border-gray-700 flex items-center">
          <Link href="/dashboard" className="block">
            <DSwipeLogo size="medium" showFullName={true} />
          </Link>
        </div>

        <nav className="flex-1 p-3">
          <div className="space-y-0.5">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded transition-colors text-sm font-light"
            >
              <span className="text-base">📊</span>
              <span>ダッシュボード</span>
            </Link>
            
            <Link
              href="/lp/create"
              className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded transition-colors text-sm font-light"
            >
              <span className="text-base">➕</span>
              <span>新規LP作成</span>
            </Link>
            
            <Link
              href="/products"
              className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded transition-colors text-sm font-light"
            >
              <span className="text-base">📦</span>
              <span>商品管理</span>
            </Link>
            
            <Link
              href="/points/purchase"
              className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded transition-colors text-sm font-light"
            >
              <span className="text-base">💰</span>
              <span>ポイント購入</span>
            </Link>
            
            <Link
              href="/media"
              className="flex items-center space-x-2 px-3 py-2 text-white bg-blue-600 rounded text-sm font-light"
            >
              <span className="text-base">🖼️</span>
              <span>メディア</span>
            </Link>
          </div>
        </nav>

        <div className="p-3 border-t border-gray-700">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-light truncate">{user?.username}</div>
              <div className="text-gray-400 text-xs">{user?.user_type}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-3 py-1.5 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 transition-colors text-xs font-light"
          >
            ログアウト
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 px-6 h-16">
          <div className="flex items-center justify-between">
            {/* Left: Page Title & Description */}
            <div>
              <h1 className="text-xl font-light text-white mb-0.5">メディア</h1>
              <p className="text-gray-400 text-xs font-light">画像をアップロードして管理</p>
            </div>
            
            {/* Right: Actions & User Info */}
            <div className="flex items-center space-x-4">
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
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-light disabled:opacity-50"
              >
                {isUploading ? 'アップロード中...' : '+ 画像をアップロード'}
              </button>
              
              {/* User Avatar */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">

          {/* Media Grid */}
          {media.length === 0 ? (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-12 text-center">
              <div className="text-5xl mb-3">🖼️</div>
              <h3 className="text-xl font-light text-white mb-2">画像がありません</h3>
              <p className="text-gray-400 text-sm font-light mb-4">最初の画像をアップロードしましょう</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-block px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-light"
              >
                画像をアップロード
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
              {media.map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition-all group"
                >
                  {/* Image */}
                  <div className="relative h-32 bg-gray-900">
                    <img
                      src={item.url}
                      alt="Media"
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => window.open(item.url, '_blank')}
                        className="px-3 py-1.5 bg-white text-black rounded text-xs font-light mr-1"
                      >
                        表示
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-2">
                    <div className="text-gray-400 text-[10px] font-light mb-2 truncate">
                      {new Date(item.uploaded_at).toLocaleDateString('ja-JP')}
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        onClick={() => handleCopyUrl(item.url)}
                        className="px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-xs font-light"
                      >
                        URL
                      </button>
                      <button
                        onClick={() => handleDelete(item.url)}
                        className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs font-light"
                      >
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
            <div className="mt-6 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">ℹ️</span>
                <div>
                  <div className="text-white text-sm font-light">合計 {media.length}枚の画像</div>
                  <div className="text-gray-400 text-xs font-light">LPエディタでこれらの画像を使用できます</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
