"use client";

import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBagIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useAuthStore } from "@/store/authStore";
import { lpApi, productApi } from "@/lib/api";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { Badge, Button } from "@/components/ui";
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
  const { user, isAuthenticated, isInitialized } = useAuthStore();

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
    lpOptions.forEach((lp) => map.set(lp.id, lp.title));
    return map;
  }, [lpOptions]);

  const fetchData = useCallback(async (showSpinner = true) => {
    if (showSpinner) setIsLoading(true);
    try {
      const [productsRes, lpsRes] = await Promise.all([
        productApi.list({ limit: 100 }),
        lpApi.list({ limit: 100 }),
      ]);

      const productPayload = productsRes.data as { data?: ManageProduct[] | null } | ManageProduct[] | null | undefined;
      let productRows: ManageProduct[] = [];
      if (Array.isArray(productPayload)) productRows = productPayload;
      else if (productPayload && "data" in productPayload && Array.isArray(productPayload.data)) productRows = productPayload.data;
      setProducts(productRows);

      const lpPayload = lpsRes.data as { data?: LandingPage[] | null } | LandingPage[] | null | undefined;
      let lpRows: LandingPage[] = [];
      if (Array.isArray(lpPayload)) lpRows = lpPayload;
      else if (lpPayload && "data" in lpPayload && Array.isArray(lpPayload.data)) lpRows = lpPayload.data;
      setLpOptions(lpRows.map((lp) => ({ id: lp.id, title: lp.title })));
      setError(null);
    } catch (err) {
      console.error("Failed to load product data:", err);
      setError("商品情報の取得に失敗しました");
    } finally {
      if (showSpinner) setIsLoading(false);
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
  }, [fetchData, isAuthenticated, isInitialized, user, router]);

  const resetForm = () => {
    setForm({ title: "", description: "", price: "", stock: "", lpId: "", redirectUrl: "", thanksLpId: "", isAvailable: true });
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
    if (target instanceof HTMLInputElement && target.type === "checkbox") value = target.checked;
    setForm((prev) => ({ ...prev, [name]: value }));
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
      if (description) payload.description = description;
      else if (editingProduct) payload.description = null;

      if (form.stock !== "") payload.stock_quantity = Number(form.stock);
      else if (editingProduct) payload.stock_quantity = null;

      if (form.lpId) payload.lp_id = form.lpId;
      else if (editingProduct) payload.lp_id = null;

      const redirect = form.redirectUrl.trim();
      if (redirect) payload.redirect_url = redirect;
      else if (editingProduct) payload.redirect_url = null;

      if (form.thanksLpId) payload.thanks_lp_id = form.thanksLpId;
      else if (editingProduct) payload.thanks_lp_id = null;

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
    if (!confirm("選択した商品を削除しますか？")) return;
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--canvas)" }}>
        <div className="text-lg" style={{ color: "var(--muted)" }}>
          読み込み中...
        </div>
      </div>
    );
  }

  return (
    <DashboardShell
      title="商品管理"
      subtitle="CTAで紐づける商品の作成・編集・公開設定"
      actions={
        <Button size="sm" onClick={openCreateModal}>
          <PlusIcon />
          <span className="hidden sm:inline">新しい商品を追加</span>
        </Button>
      }
    >
      {error ? (
        <div className="rounded-xl border px-4 py-3 text-sm" style={{ background: "var(--danger-tint)", borderColor: "#fcc", color: "var(--danger-ink)" }}>
          {error}
        </div>
      ) : products.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "var(--surface-tint)", color: "var(--brand)" }}>
            <ShoppingBagIcon className="h-6 w-6" aria-hidden="true" />
          </span>
          <h2 className="text-lg font-bold" style={{ color: "var(--ink)" }}>
            まだ商品がありません
          </h2>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            CTAに紐づける商品を作成し、決済モーダルで販売しましょう。
          </p>
          <Button size="sm" onClick={openCreateModal}>
            商品を作成する
          </Button>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="登録済み商品" value={productStats.total} sub={`公開 ${productStats.published} / 下書き ${productStats.draft}`} />
            <StatCard label="販売実績" value={`${productStats.totalSales.toLocaleString()} 件`} sub="CTA決済の累計成約数" tone="success" />
            <StatCard label="リンク済みLP" value={lpOptions.length} sub="紐づけ可能なLP" tone="brand" />
            <StatCard label="要補充" value={productStats.limitedStock} sub="在庫5個以下の商品" tone="warn" />
          </div>

          {/* Product cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => {
              const lpTitle = product.lp_id ? lpTitleMap.get(product.lp_id) : undefined;
              const isLimitedStock =
                product.stock_quantity !== null &&
                product.stock_quantity !== undefined &&
                product.stock_quantity <= 5 &&
                product.stock_quantity >= 0;

              return (
                <div key={product.id} className="card card-pad flex h-full flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="line-clamp-2 text-base font-bold" style={{ color: "var(--ink)" }}>
                        {product.title}
                      </h3>
                      {product.description && (
                        <p className="mt-2 line-clamp-3 text-xs" style={{ color: "var(--muted)" }}>
                          {product.description}
                        </p>
                      )}
                    </div>
                    <Badge tone={product.is_available ? "live" : "draft"} small dot={product.is_available}>
                      {product.is_available ? "販売中" : "非公開"}
                    </Badge>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm">
                    <Row label="価格" value={`${product.price_in_points.toLocaleString()} P`} />
                    <Row
                      label="在庫"
                      value={
                        product.stock_quantity === null || product.stock_quantity === undefined
                          ? "無制限"
                          : `${product.stock_quantity.toLocaleString()} 個`
                      }
                      highlight={isLimitedStock ? "warn" : undefined}
                    />
                    <Row label="累計成約" value={`${product.total_sales.toLocaleString()} 件`} highlight="brand" />
                    <Row label="紐づけLP" value={lpTitle ?? "-"} />
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4" style={{ borderColor: "var(--line)" }}>
                    <button onClick={() => handleToggleAvailability(product)} className="btn btn-secondary btn-sm">
                      {product.is_available ? "非公開にする" : "販売を再開"}
                    </button>
                    <button onClick={() => openEditModal(product)} className="btn btn-primary btn-sm flex-1">
                      編集
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="btn btn-sm" style={{ background: "var(--danger-tint)", color: "var(--danger-ink)" }}>
                      削除
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(11,31,58,.45)" }}>
          <div className="card w-full max-w-xl p-6 shadow-2xl" style={{ maxHeight: "90vh", overflowY: "auto" }}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ color: "var(--ink)" }}>
                {editingProduct ? "商品を編集" : "新しい商品を作成"}
              </h2>
              <button onClick={closeModal} aria-label="閉じる" style={{ color: "var(--muted)" }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="field">
                <label className="field-label">
                  商品タイトル <span className="req">*</span>
                </label>
                <input name="title" value={form.title} onChange={handleInputChange} className="input" placeholder="例: 有料メルマガ会員権" required />
              </div>

              <div className="field">
                <label className="field-label">商品説明</label>
                <textarea name="description" value={form.description} onChange={handleInputChange} className="textarea" rows={4} placeholder="LP CTAから遷移して購入される商品の概要を記載しましょう" />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="field">
                  <label className="field-label">
                    価格（ポイント） <span className="req">*</span>
                  </label>
                  <input name="price" value={form.price} onChange={handleInputChange} type="number" min="0" className="input" placeholder="1000" required />
                </div>
                <div className="field">
                  <label className="field-label">在庫数</label>
                  <input name="stock" value={form.stock} onChange={handleInputChange} type="number" min="0" className="input" placeholder="空欄で無制限" />
                </div>
              </div>

              <div className="field">
                <label className="field-label">紐づけるLP</label>
                <select name="lpId" value={form.lpId} onChange={handleInputChange} className="select">
                  <option value="">選択しない</option>
                  {lpOptions.map((lp) => (
                    <option key={lp.id} value={lp.id}>
                      {lp.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="field">
                  <label className="field-label">購入後リダイレクトURL</label>
                  <input name="redirectUrl" value={form.redirectUrl} onChange={handleInputChange} className="input" placeholder="https://example.com/thanks" />
                </div>
                <div className="field">
                  <label className="field-label">サンクスページLP</label>
                  <select name="thanksLpId" value={form.thanksLpId} onChange={handleInputChange} className="select">
                    <option value="">選択しない</option>
                    {lpOptions.map((lp) => (
                      <option key={lp.id} value={lp.id}>
                        {lp.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border px-4 py-3" style={{ borderColor: "var(--line)", background: "var(--surface-2)" }}>
                <div>
                  <div className="text-sm font-bold" style={{ color: "var(--ink)" }}>
                    販売ステータス
                  </div>
                  <div className="text-xs" style={{ color: "var(--muted)" }}>
                    チェックを外すとCTA経由の決済モーダルに表示されません。
                  </div>
                </div>
                <label className="inline-flex items-center gap-2 text-sm" style={{ color: "var(--text)" }}>
                  <input type="checkbox" name="isAvailable" checked={form.isAvailable} onChange={handleInputChange} className="h-4 w-4" />
                  {form.isAvailable ? "販売中" : "非公開"}
                </label>
              </div>

              {formError && (
                <div className="rounded-lg border px-3 py-2 text-sm" style={{ background: "var(--danger-tint)", borderColor: "#fcc", color: "var(--danger-ink)" }}>
                  {formError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={closeModal} disabled={saving}>
                  キャンセル
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "保存中..." : editingProduct ? "更新する" : "作成する"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

function StatCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  sub: string;
  tone?: "success" | "brand" | "warn";
}) {
  const valueColor =
    tone === "success" ? "var(--success-ink)" : tone === "brand" ? "var(--brand)" : tone === "warn" ? "var(--warning-ink)" : "var(--ink)";
  return (
    <div className="card card-pad">
      <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
        {label}
      </p>
      <p className="mt-2 text-2xl font-extrabold tabular-nums" style={{ color: valueColor }}>
        {value}
      </p>
      <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
        {sub}
      </p>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: "warn" | "brand" }) {
  const color = highlight === "warn" ? "var(--warning-ink)" : highlight === "brand" ? "var(--brand)" : "var(--ink)";
  return (
    <div className="flex items-center justify-between rounded-lg border px-3 py-2" style={{ borderColor: "var(--line)", background: "var(--surface-2)" }}>
      <span className="text-xs" style={{ color: "var(--muted)" }}>
        {label}
      </span>
      <span className="truncate text-right font-semibold" style={{ color }}>
        {value}
      </span>
    </div>
  );
}
