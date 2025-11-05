"use client";

import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from "react";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";

import AdminShell from "@/components/admin/AdminShell";
import { adminPaymentSettingsApi } from "@/lib/api";
import { redirectToLogin } from "@/lib/navigation";
import type {
  PlatformPaymentSettings,
  PlatformPaymentSettingsUpdatePayload,
} from "@/types/api";
import { useAuthStore } from "@/store/authStore";

type FormState = {
  exchange_rate_usd_jpy: string;
  spread_jpy: string;
  platform_fee_percent: string;
};

const numberFormatter = new Intl.NumberFormat("ja-JP", {
  style: "decimal",
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});

export default function AdminPaymentSettingsPage() {
  const router = useRouter();
  const { isAdmin, isAuthenticated, isInitialized } = useAuthStore();

  const [settings, setSettings] = useState<PlatformPaymentSettings | null>(null);
  const [formState, setFormState] = useState<FormState>({
    exchange_rate_usd_jpy: "",
    spread_jpy: "",
    platform_fee_percent: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated) {
      redirectToLogin(router, "/admin/payment-settings");
      return;
    }
    if (!isAdmin) {
      router.replace("/dashboard");
    }
  }, [isAdmin, isAuthenticated, isInitialized, router]);

  const hydrateForm = useCallback((payload: PlatformPaymentSettings) => {
    setSettings(payload);
    setFormState({
      exchange_rate_usd_jpy: String(payload.exchange_rate_usd_jpy ?? ""),
      spread_jpy: String(payload.spread_jpy ?? ""),
      platform_fee_percent: String(payload.platform_fee_percent ?? ""),
    });
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const response = await adminPaymentSettingsApi.get();
      const payload = response.data as PlatformPaymentSettings;
      hydrateForm(payload);
    } catch (error) {
      console.error("Failed to load payment settings", error);
      if (isAxiosError(error)) {
        setErrorMessage(error.response?.data?.detail ?? "決済設定の取得に失敗しました");
      } else {
        setErrorMessage("決済設定の取得に失敗しました");
      }
    } finally {
      setLoading(false);
    }
  }, [hydrateForm]);

  useEffect(() => {
    if (!isInitialized || !isAuthenticated || !isAdmin) return;
    void fetchSettings();
  }, [fetchSettings, isAdmin, isAuthenticated, isInitialized]);

  const effectiveRate = useMemo(() => {
    const base = Number(formState.exchange_rate_usd_jpy || settings?.exchange_rate_usd_jpy || 0);
    const spread = Number(formState.spread_jpy || settings?.spread_jpy || 0);
    if (Number.isFinite(base) && Number.isFinite(spread)) {
      return numberFormatter.format(base + spread);
    }
    return "-";
  }, [formState.exchange_rate_usd_jpy, formState.spread_jpy, settings]);

  const handleInputChange = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, [field]: event.target.value }));
    setSuccessMessage(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const payload: PlatformPaymentSettingsUpdatePayload = {
      exchange_rate_usd_jpy: Number(formState.exchange_rate_usd_jpy || settings?.exchange_rate_usd_jpy || 0),
      spread_jpy: Number(formState.spread_jpy || settings?.spread_jpy || 0),
      platform_fee_percent: Number(formState.platform_fee_percent || settings?.platform_fee_percent || 0),
    };

    if (payload.exchange_rate_usd_jpy <= 0 || payload.platform_fee_percent < 0 || payload.spread_jpy < 0) {
      setErrorMessage("入力値を確認してください");
      setSaving(false);
      return;
    }

    try {
      const response = await adminPaymentSettingsApi.update(payload);
      const updated = response.data as PlatformPaymentSettings;
      hydrateForm(updated);
      setSuccessMessage("決済設定を保存しました");
    } catch (error) {
      console.error("Failed to update payment settings", error);
      if (isAxiosError(error)) {
        setErrorMessage(error.response?.data?.detail ?? "決済設定の更新に失敗しました");
      } else {
        setErrorMessage("決済設定の更新に失敗しました");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell
      pageTitle="決済設定"
      pageSubtitle="ONE.lat 決済向けの為替レート・スプレッド・プラットフォーム手数料を管理します"
    >
      <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6">
        {loading ? (
          <div className="rounded-2xl border border-dashed border-blue-200 bg-white p-10 text-center text-sm text-blue-600">
            読み込み中です...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <header className="mb-6 space-y-1">
                <h2 className="text-lg font-semibold text-slate-900">為替レート設定</h2>
                <p className="text-sm text-slate-600">
                  実勢のドル円レートと運営が上乗せするスプレッドを入力してください。実効レートは決済計算に利用されます。
                </p>
              </header>
              <div className="grid gap-5 md:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-700">実勢のUSD/JPYレート</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={formState.exchange_rate_usd_jpy}
                    onChange={handleInputChange("exchange_rate_usd_jpy")}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    required
                  />
                  <span className="text-xs text-slate-500">例: 152.35</span>
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-700">スプレッド（円）</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formState.spread_jpy}
                    onChange={handleInputChange("spread_jpy")}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    required
                  />
                  <span className="text-xs text-slate-500">例: 3.5。実効レート = 実勢 + スプレッド</span>
                </label>
              </div>
              <div className="mt-6 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">現在の実効レート</span>
                  <span className="font-mono text-base">1 USD = {effectiveRate} 円</span>
                </div>
              </div>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <header className="mb-6 space-y-1">
                <h2 className="text-lg font-semibold text-slate-900">プラットフォーム手数料</h2>
                <p className="text-sm text-slate-600">
                  ONE.lat での販売に適用する手数料率です。支払いレポートおよびダッシュボード表示に利用されます。
                </p>
              </header>
              <div className="grid gap-5 md:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-700">決済手数料（%）</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formState.platform_fee_percent}
                    onChange={handleInputChange("platform_fee_percent")}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    required
                  />
                  <span className="text-xs text-slate-500">例: 10.0</span>
                </label>
                <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <p className="font-medium text-slate-700">運用メモ</p>
                  <ul className="mt-2 space-y-1 text-xs leading-5">
                    <li>・日本円決済、プラットフォーム手数料計算の両方に適用されます。</li>
                    <li>・支払い生成バッチではこの値が既定として利用されます。</li>
                  </ul>
                </div>
              </div>
            </section>

            {settings?.updated_at && (
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">
                最終更新: {new Date(settings.updated_at).toLocaleString("ja-JP")}（更新者: {settings.updated_by ?? "不明"}）
              </div>
            )}

            {errorMessage && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
                {successMessage}
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setSuccessMessage(null);
                  void fetchSettings();
                }}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
                disabled={saving}
              >
                再読み込み
              </button>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                disabled={saving}
              >
                {saving ? "保存中..." : "設定を保存"}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminShell>
  );
}
