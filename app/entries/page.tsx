// app/entries/page.tsx
"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useEntries } from "@/hooks/useEntries";
import EntryForm from "@/components/EntryForm";
import EntryTable from "@/components/EntryTable";
import type { Row } from "@/components/types";
import { exportExcel } from "@/utils/xlsx";

export default function EntriesPage() {
  const router = useRouter();
  const { loading, user, signOut } = useAuth();
  const redirectingRef = useRef(false);

  // 세션 준비 후에만 데이터 훅 실행
  const enabled = useMemo(() => !loading && !!user, [loading, user]);
  const { rows, setRows, createRow, saveRow, deleteRow } = useEntries(enabled);

  useEffect(() => {
    if (!loading && !user && !redirectingRef.current) {
      redirectingRef.current = true;
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading) return <div className="p-6">로딩 중…</div>;
  if (!user) return null; // 이동 중

  return (
    <>
      <header className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Entries</h1>
        <div className="flex gap-2">
          <button onClick={() => exportExcel(rows)} className="btn btn-primary">엑셀로 내보내기 (.xlsx)</button>
          <button onClick={() => signOut().then(() => router.replace("/login"))} className="btn btn-ghost">로그아웃</button>
        </div>
      </header>

      <EntryForm onAdd={createRow as unknown as (row: Row) => void} />
      <EntryTable rows={rows} setRows={setRows} onSaveRow={saveRow} onDeleteRow={deleteRow} />
    </>
  );
}