'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { productApi, lpApi } from '@/lib/api';

interface Product {
  id: string;
  title: string;
  description?: string;
  price_in_points: number;
  stock_quantity?: number;
  is_available: boolean;
  total_sales: number;
  lp_id?: string;
}

interface LP {
  id: string;
  title: string;
}

export default function ProductsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized, logout } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [lps, setLps] = useState<LP[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price_in_points: 1000,
    stock_quantity: null as number | null,
    is_available: true,
    lp_id: '',
  });

  useEffect(() => {
    if (!isInitialized) return;
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchData();
  }, [isAuthenticated, isInitialized]);

  const fetchData = async () => {
    try {
      const [productsRes, lpsRes] = await Promise.all([
        productApi.list(),
        lpApi.list(),
      ]);
      
      const productsData = Array.isArray(productsRes.data?.data) 
        ? productsRes.data.data 
        : Array.isArray(productsRes.data) 
        ? productsRes.data 
        : [];
      
      const lpsData = Array.isArray(lpsRes.data?.data) 
        ? lpsRes.data.data 
        : Array.isArray(lpsRes.data) 
        ? lpsRes.data 
        : [];
      
      setProducts(productsData);
      setLps(lpsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleOpenCreate = () => {
    setFormData({
      title: '',
      description: '',
      price_in_points: 1000,
      stock_quantity: null,
      is_available: true,
      lp_id: '',
    });
    setEditingProduct(null);
    setShowCreateModal(true);
  };

  const handleOpenEdit = (product: Product) => {
    setFormData({
      title: product.title,
      description: product.description || '',
      price_in_points: product.price_in_points,
      stock_quantity: product.stock_quantity || null,
      is_available: product.is_available,
      lp_id: product.lp_id || '',
    });
    setEditingProduct(product);
    setShowCreateModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const data = {
        ...formData,
        lp_id: formData.lp_id || undefined,
      };

      if (editingProduct) {
        await productApi.update(editingProduct.id, data);
      } else {
        await productApi.create(data);
      }

      setShowCreateModal(false);
      await fetchData();
      alert(editingProduct ? '商品を更新しました' : '商品を作成しました');
    } catch (error: any) {
      alert(error.response?.data?.detail || '商品の保存に失敗しました');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('この商品を削除しますか？')) return;

    try {
      await productApi.delete(id);
      await fetchData();
      alert('商品を削除しました');
    } catch (error: any) {
      alert(error.response?.data?.detail || '商品の削除に失敗しました');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="text-2xl font-bold text-white">
              SwipeLaunch
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                ダッシュボード
              </Link>
              <Link href="/products" className="text-white font-semibold">
                商品管理
              </Link>
              <div className="flex items-center space-x-4 border-l border-gray-700 pl-6">
                <span className="text-gray-300">
                  {user?.username || 'ユーザー'}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  ログアウト
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">商品管理</h1>
              <p className="text-gray-400">LPに紐付ける商品を管理します（ポイント決済）</p>
            </div>
            <button
              onClick={handleOpenCreate}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg shadow-blue-500/50"
            >
              + 商品を作成
            </button>
          </div>
        </div>

        {/* 商品一覧 */}
        {products.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-white mb-2">商品がありません</h2>
            <p className="text-gray-400 mb-6">
              最初の商品を作成して、LPに紐付けましょう
            </p>
            <button
              onClick={handleOpenCreate}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              商品を作成
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const linkedLP = lps.find(lp => lp.id === product.lp_id);
              
              return (
                <div
                  key={product.id}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{product.title}</h3>
                      {product.description && (
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        product.is_available
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {product.is_available ? '販売中' : '停止中'}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">価格</span>
                      <span className="text-white font-bold">{product.price_in_points.toLocaleString()} P</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">在庫</span>
                      <span className="text-white">
                        {product.stock_quantity === null ? '無制限' : `${product.stock_quantity}個`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">販売数</span>
                      <span className="text-white">{product.total_sales}件</span>
                    </div>
                    {linkedLP && (
                      <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                        <span className="text-gray-400 text-sm">紐付けLP</span>
                        <Link
                          href={`/lp/${linkedLP.id}/edit`}
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          {linkedLP.title}
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEdit(product)}
                      className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      削除
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 作成/編集モーダル */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-4">
          <div className="bg-gray-800 rounded-xl p-8 max-w-2xl w-full border border-gray-700 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingProduct ? '商品を編集' : '商品を作成'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 商品名 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  商品名 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  placeholder="例: プレミアム会員プラン"
                />
              </div>

              {/* 説明 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  説明
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="商品の説明を入力..."
                />
              </div>

              {/* 価格 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  価格（ポイント） <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={formData.price_in_points}
                  onChange={(e) => setFormData({ ...formData, price_in_points: parseInt(e.target.value) })}
                  required
                  min="0"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  1ポイント = 1円相当として設定してください
                </p>
              </div>

              {/* 在庫 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  在庫数
                </label>
                <input
                  type="number"
                  value={formData.stock_quantity || ''}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value ? parseInt(e.target.value) : null })}
                  min="0"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  placeholder="空欄で無制限"
                />
              </div>

              {/* LP紐付け */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  紐付けLP（オプション）
                </label>
                <select
                  value={formData.lp_id}
                  onChange={(e) => setFormData({ ...formData, lp_id: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">紐付けない</option>
                  {lps.map((lp) => (
                    <option key={lp.id} value={lp.id}>
                      {lp.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* 販売状態 */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_available}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  className="w-4 h-4 bg-gray-900 border-gray-700 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label className="ml-2 text-sm text-gray-300">
                  販売可能にする
                </label>
              </div>

              {/* ボタン */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  {editingProduct ? '更新' : '作成'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
