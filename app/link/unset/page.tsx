export const metadata = {
  title: 'リンクが設定されていません',
};

export default function LinkUnsetPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-16 text-slate-100">
      <div className="max-w-md space-y-6 rounded-3xl border border-white/10 bg-white/5 p-10 text-center shadow-xl backdrop-blur">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-3xl">
          ⚠️
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">リンクが未設定です</h1>
          <p className="text-sm leading-relaxed text-slate-300">
            販売者によってまだ遷移先が設定されていません。設定が完了するまで今しばらくお待ちください。
          </p>
        </div>
        <div className="space-y-2 text-sm text-slate-400">
          <p>このページは自動で閉じません。</p>
          <p>お手数ですがブラウザの戻るボタンで前のページにお戻りください。</p>
        </div>
      </div>
    </main>
  );
}
