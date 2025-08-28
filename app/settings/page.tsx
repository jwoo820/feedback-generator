// app/settings/page.tsx
export default function SettingsPage() {
    return (
        <section className="space-y-4">
            <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
            <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300">
                <li>.env.local 에 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                <li>Supabase Auth Email/Password 활성화</li>
                <li>entries.user_id 컬럼 + RLS( user_id = auth.uid() )</li>
                <li>Database → Replication → entries 실시간 체크</li>
            </ul>
        </section>
    );
}