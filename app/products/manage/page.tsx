"use client";

import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import { useAuthStore } from "@/store/authStore";
import { lpApi, productApi } from "@/lib/api";
import DSwipeLogo from "@/components/DSwipeLogo";
import { getDashboardNavLinks, isDashboardLinkActive } from "@/components/dashboard/navLinks";
import type { LandingPage, Product } from "@/types";

interface ProductFormState {
  title: string;
  description: string;
  price: string;
  stock: string;
  lpId: string;
  redirectUrl: string;
  thanksLpId: string;
  isAvailable: boolean;
}

type ManageProduct = Product & {
  lp_id?: string | null;
  stock_quantity?: number | null;
  redirect_url?: string | null;
  thanks_lp_id?: string | null;
};

type LpOption = Pick<LandingPage, "id" | "title">;

export default function ProductManagementPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isInitialized, logout, isAdmin } = useAuthStore();
  const navLinks = useMemo(
    () => getDashboardNavLinks({ isAdmin, userType: user?.user_type }),
    [isAdmin, user?.user_type]
  );

  const [products, setProducts] = useState<ManageProduct[]>([]);
  const [lpOptions, setLpOptions] = useState<LpOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<ManageProduct | null>(null);

  const [form, setForm] = useState<ProductFormState>({
    title: "",
    description: "",
    price: "",
    stock: "",
    lpId: "",
    redirectUrl: "",
    thanksLpId: "",
    isAvailable: true,
  });

  const productStats = useMemo(() => {
    if (!products.length) {
      return {
        total: 0,
        published: 0,
        draft: 0,
        totalSales: 0,
        limitedStock: 0,
      };
    }

    let published = 0;
    let limitedStock = 0;
    let totalSales = 0;

    products.forEach((product) => {
      if (product.is_available) published += 1;
      if (
        product.stock_quantity !== null &&
        product.stock_quantity !== undefined &&
        product.stock_quantity >= 0 &&
        product.stock_quantity <= 5
      ) {
        limitedStock += 1;
      }
      totalSales += product.total_sales ?? 0;
    });

    return {
      total: products.length,
      published,
      draft: products.length - published,
      totalSales,
      limitedStock,
    };
  }, [products]);

  const lpTitleMap = useMemo(() => {
    const map = new Map<string, string>();
    lpOptions.forEach((lp) => {
      map.set(lp.id, lp.title);
    });
    return map;
  }, [lpOptions]);
  const fetchData = useCallback(async (showSpinner = true) => {
    if (showSpinner) {
      setIsLoading(true);
    }
    try {
      const [productsRes, lpsRes] = await Promise.all([
        productApi.list({ limit: 100 }),
        lpApi.list({ limit: 100 }),
      ]);

      const productPayload = productsRes.data as { data?: ManageProduct[] | null } | ManageProduct[] | null | undefined;
      let productRows: ManageProduct[] = [];

      if (Array.isArray(productPayload)) {
        productRows = productPayload;
      } else if (productPayload && "data" in productPayload && Array.isArray(productPayload.data)) {
        productRows = productPayload.data;
      }

      setProducts(productRows);

      const lpPayload = lpsRes.data as { data?: LandingPage[] | null } | LandingPage[] | null | undefined;
      let lpRows: LandingPage[] = [];

      if (Array.isArray(lpPayload)) {
        lpRows = lpPayload;
      } else if (lpPayload && "data" in lpPayload && Array.isArray(lpPayload.data)) {
        lpRows = lpPayload.data;
      }

      const lpOptionsData: LpOption[] = lpRows.map((lp) => ({ id: lp.id, title: lp.title }));
      setLpOptions(lpOptionsData);
      setError(null);
    } catch (err) {
      console.error("Failed to load product data:", err);
      setError("商品情報の取得に失敗しました");
    } finally {
      if (showSpinner) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!user?.user_type) return;

    if (user.user_type !== "seller") {
      router.push("/dashboard");
      return;
    }

    fetchData();
  }, [fetchData, isAuthenticated, isInitialized, user]);

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      price: "",
      stock: "",
      lpId: "",
      redirectUrl: "",
      thanksLpId: "",
      isAvailable: true,
    });
    setFormError(null);
  };

  const openCreateModal = () => {
    resetForm();
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: ManageProduct) => {
    setEditingProduct(product);
    setForm({
      title: product.title ?? "",
      description: product.description ?? "",
      price: String(product.price_in_points ?? ""),
      stock: product.stock_quantity === null || product.stock_quantity === undefined ? "" : String(product.stock_quantity),
      lpId: product.lp_id ?? "",
      redirectUrl: product.redirect_url ?? "",
      thanksLpId: product.thanks_lp_id ?? "",
      isAvailable: Boolean(product.is_available),
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormError(null);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = event.target;
    const { name } = target;
    let value: string | boolean = target.value;

    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      value = target.checked;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setFormError("タイトルは必須です");
      return;
    }

    if (!form.price || Number.isNaN(Number(form.price)) || Number(form.price) < 0) {
      setFormError("価格は0以上の数値で入力してください");
      return;
    }

    if (form.stock && (Number.isNaN(Number(form.stock)) || Number(form.stock) < 0)) {
      setFormError("在庫数は0以上の数値で入力してください");
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        title: form.title.trim(),
        price_in_points: Number(form.price),
        is_available: form.isAvailable,
      };

      const description = form.description.trim();
      if (description) {
        payload.description = description;
      } else if (editingProduct) {
        payload.description = null;
      }

      if (form.stock !== "") {
        payload.stock_quantity = Number(form.stock);
      } else if (editingProduct) {
        payload.stock_quantity = null;
      }

      if (form.lpId) {
        payload.lp_id = form.lpId;
      } else if (editingProduct) {
        payload.lp_id = null;
      }

      const redirect = form.redirectUrl.trim();
      if (redirect) {
        payload.redirect_url = redirect;
      } else if (editingProduct) {
        payload.redirect_url = null;
      }

      if (form.thanksLpId) {
        payload.thanks_lp_id = form.thanksLpId;
      } else if (editingProduct) {
        payload.thanks_lp_id = null;
      }

      if (editingProduct) {
        await productApi.update(editingProduct.id, payload);
        alert("商品情報を更新しました");
      } else {
        await productApi.create(payload);
        alert("商品を作成しました");
      }

      closeModal();
      fetchData(false);
    } catch (err) {
      console.error("Failed to save product:", err);
      alert("商品情報の保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("選択した商品を削除しますか？")) {
      return;
    }

    try {
      await productApi.delete(productId);
      alert("商品を削除しました");
      fetchData(false);
    } catch (err) {
      console.error("Failed to delete product:", err);
      alert("商品の削除に失敗しました");
    }
  };

  const handleToggleAvailability = async (product: ManageProduct) => {
    try {
      await productApi.update(product.id, { is_available: !product.is_available });
      fetchData(false);
    } catch (err) {
      console.error("Failed to toggle availability:", err);
      alert("公開設定の更新に失敗しました");
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-slate-600 text-xl">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex overflow-x-hidden">
      <aside className="hidden sm:flex w-52 flex-shrink-0 bg-white border-r border-slate-200 flex-col">
        <div className="px-6 h-16 border-b border-slate-200 flex items-center">
          <Link href="/dashboard" className="block">
            <DSwipeLogo size="medium" showFullName={true} />
          </Link>
        </div>

        <nav className="flex-1 p-3">
          <div className="space-y-0.5">
            {navLinks.map((link) => {
              const isActive = isDashboardLinkActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded transition-colors text-sm font-medium ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-base">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-3 border-t border-slate-200">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <div className="text-slate-900 text-sm font-semibold truncate">
                {user?.username || "ユーザー"}
              </div>
              <div className="text-slate-500 text-xs truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-sm font-semibold"
          >
            ログアウト
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 w-full">
        <div className="sm:hidden border-b border-slate-200 bg-white w-full">
          <div className="px-3 py-3 border-b border-slate-100 flex items-center justify-between w-full">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="min-w-0">
                <div className="text-slate-900 text-sm font-semibold truncate">
                  {user?.username || "ユーザー"}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-xs font-semibold"
            >
              ログアウト
            </button>
          </div>
          <nav className="flex items-center gap-2 overflow-x-auto px-3 py-2">
            {navLinks.map((link) => {
              const active = isDashboardLinkActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap ${
                    active
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <main className="flex-1 overflow-auto bg-slate-100 px-3 sm:px-6 py-6 w-full min-w-0">
          <div className="max-w-5xl mx-auto space-y-6 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">商品管理</h1>
                <p className="text-sm text-slate-600 mt-1">
                  CTAで紐づける商品の作成・編集・公開設定をこちらで行えます。
                </p>
              </div>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 shadow whitespace-nowrap"
              >
                + 新しい商品を追加
              </button>
            </div>

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                {products.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">
                    <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                      <ShoppingBagIcon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-900 mb-2">まだ商品がありません</h2>
                    <p className="text-sm text-slate-600 mb-4">
                      CTAに紐づける商品を作成し、決済モーダルで販売しましょう。
                    </p>
                    <button
                      onClick={openCreateModal}
                      className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 shadow"
                    >
                      商品を作成する
                    </button>
                  </div>
                ) : (
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">登録済み商品</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-900">{productStats.total}</p>
                        <p className="mt-1 text-xs text-slate-500">公開 {productStats.published} / 下書き {productStats.draft}</p>
                      </div>
                      <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-600">販売実績</p>
                        <p className="mt-2 text-2xl font-semibold text-emerald-700">{productStats.totalSales.toLocaleString()} 件</p>
                        <p className="mt-1 text-xs text-emerald-600/70">CTA決済の累計成約数</p>
                      </div>
                      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-blue-600">リンク済みLP</p>
                        <p className="mt-2 text-2xl font-semibold text-blue-700">{lpOptions.length}</p>
                        <p className="mt-1 text-xs text-blue-600/70">このページで紐づけ可能なLP</p>
                      </div>
                      <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-amber-600">要補充</p>
                        <p className="mt-2 text-2xl font-semibold text-amber-700">{productStats.limitedStock}</p>
                        <p className="mt-1 text-xs text-amber-600/70">在庫5個以下の商品</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {products.map((product) => {
                        const lpTitle = product.lp_id ? lpTitleMap.get(product.lp_id) : undefined;
                        const isLimitedStock =
                          product.stock_quantity !== null &&
                          product.stock_quantity !== undefined &&
                          product.stock_quantity <= 5 &&
                          product.stock_quantity >= 0;

                        return (
                          <div
                            key={product.id}
                            className="group relative flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-200 hover:shadow-[0_20px_50px_-40px_rgba(59,130,246,0.35)]"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h3 className="text-base font-semibold text-slate-900 line-clamp-2">
                                  {product.title}
                                </h3>
                                {product.description && (
                                  <p className="mt-2 text-xs text-slate-600 line-clamp-3">
                                    {product.description}
                                  </p>
                                )}
                              </div>
                              <span
                                className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide ${
                                  product.is_available
                                    ? "border border-emerald-400 bg-emerald-50 text-emerald-600"
                                    : "border border-slate-300 bg-slate-100 text-slate-600"
                                }`}
                              >
                                {product.is_available ? "販売中" : "非公開"}
                              </span>
                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-slate-600">
                              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                                <span className="text-xs text-slate-500">価格</span>
                                <span className="font-semibold text-slate-900">
                                  {product.price_in_points.toLocaleString()} P
                                </span>
                              </div>

                              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                                <span className="text-xs text-slate-500">在庫</span>
                                <span
                                  className={`font-semibold ${
                                    product.stock_quantity === null || product.stock_quantity === undefined
                                      ? "text-slate-900"
                                      : isLimitedStock
                                      ? "text-amber-600"
                                      : "text-slate-900"
                                  }`}
                                >
                                  {product.stock_quantity === null || product.stock_quantity === undefined
                                    ? "無制限"
                                    : `${product.stock_quantity.toLocaleString()} 個`}
                                </span>
                              </div>

                              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                                <span className="text-xs text-slate-500">累計成約</span>
                                <span className="font-semibold text-blue-600">
                                  {product.total_sales.toLocaleString()} 件
                                </span>
                              </div>

                              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                                <span className="text-xs text-slate-500">紐づけLP</span>
                                <span className="truncate text-right text-sm text-slate-700">
                                  {lpTitle ?? "-"}
                                </span>
                              </div>
                            </div>

                            {(product.redirect_url || product.thanks_lp_id) && (
                              <div className="mt-3 space-y-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
                                {product.redirect_url && (
                                  <p className="truncate">
                                    リダイレクト: {product.redirect_url}
                                  </p>
                                )}
                                {product.thanks_lp_id && (
                                  <p className="truncate">
                                    サンクスLP: {lpTitleMap.get(product.thanks_lp_id) ?? product.thanks_lp_id}
                                  </p>
                                )}
                              </div>
                            )}

                            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4">
                              <button
                                onClick={() => handleToggleAvailability(product)}
                                className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                              >
                                {product.is_available ? "非公開にする" : "販売を再開"}
                              </button>
                              <button
                                onClick={() => openEditModal(product)}
                                className="inline-flex flex-1 items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                              >
                                編集
                              </button>
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                              >
                                削除
                              </button>
                            </div>

                            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                              <span>
                                更新日: {product.updated_at
                                  ? new Date(product.updated_at).toLocaleDateString("ja-JP", {
                                      month: "short",
                                      day: "numeric",
                                    })
                                  : "-"}
                              </span>
                              {isLimitedStock && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-600">
                                  ⚠ 在庫わずか
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-2xl my-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingProduct ? "商品を編集" : "新しい商品を作成"}
              </h2>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">商品タイトル *</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                  placeholder="例: 有料メルマガ会員権"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">商品説明</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                  rows={4}
                  placeholder="LP CTAから遷移して購入される商品の概要を記載しましょう"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">価格（ポイント） *</label>
                  <input
                    name="price"
                    value={form.price}
                    onChange={handleInputChange}
                    type="number"
                    min="0"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                    placeholder="1000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">在庫数</label>
                  <input
                    name="stock"
                    value={form.stock}
                    onChange={handleInputChange}
                    type="number"
                    min="0"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                    placeholder="空欄で無制限"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">紐づけるLP</label>
                <select
                  name="lpId"
                  value={form.lpId}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                >
                  <option value="">選択しない</option>
                  {lpOptions.map((lp) => (
                    <option key={lp.id} value={lp.id}>
                      {lp.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">購入後リダイレクトURL</label>
                  <input
                    name="redirectUrl"
                    value={form.redirectUrl}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                    placeholder="https://example.com/thanks"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">サンクスページLP</label>
                  <select
                    name="thanksLpId"
                    value={form.thanksLpId}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                  >
                    <option value="">選択しない</option>
                    {lpOptions.map((lp) => (
                      <option key={lp.id} value={lp.id}>
                        {lp.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">販売ステータス</div>
                  <div className="text-xs text-slate-500">チェックを外すとCTA経由の決済モーダルに表示されません。</div>
                </div>
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={form.isAvailable}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500"
                  />
                  {form.isAvailable ? "販売中" : "非公開"}
                </label>
              </div>

              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {formError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                  disabled={saving}
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-60"
                  disabled={saving}
                >
                  {saving ? "保存中..." : editingProduct ? "更新する" : "作成する"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
