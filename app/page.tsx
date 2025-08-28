// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl sm:text-3xl font-bold">피드백/기능 항목 관리</h1>
      <p className="text-slate-700 dark:text-slate-300">
        APP/Web 항목을 추가하고, 실시간으로 Supabase와 동기화하며, 엑셀로 내보낼 수 있습니다.
        로그인 후 사용하세요.
      </p>
      <div className="flex gap-2">
        <Link href="/login" className="btn btn-primary">로그인</Link>
        <Link href="/entries" className="btn btn-ghost">Entries로 이동</Link>
      </div>
    </section>
  );
}