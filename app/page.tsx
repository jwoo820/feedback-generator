// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl sm:text-3xl font-bold">피드백/기능 항목 관리</h1>
      <p className="text-slate-600 dark:text-slate-400">
        APP/Web 항목을 추가하고, 실시간으로 Supabase와 동기화하며, 엑셀로 내보낼 수 있습니다.
      </p>
      <div>
        <Link href="/entries" className="btn btn-primary">Entries 보러가기</Link>
      </div>
    </section>
  );
}