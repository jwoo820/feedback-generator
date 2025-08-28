// app/settings/page.tsx
export default function SettingsPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
      <p className="text-slate-600 dark:text-slate-400">
        환경변수, 데이터 내보내기/백업, 권한 정책 안내 등을 여기에 정리할 수 있어요.
      </p>
    </section>
  );
}