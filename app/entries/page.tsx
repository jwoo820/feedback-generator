"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import EntryForm from "@/components/EntryForm";
import EntryTable from "@/components/EntryTable";
import type { Row } from "@/components/types";
import { exportExcel } from "@/utils/xlsx";

const mapRow = (d: any): Row => ({
  id: d.id,
  reflect: d.reflect,
  item: d.item,
  platform: d.platform ?? [],
  content: d.content ?? "",
  owner: d.owner ?? "",
  createdAt: (d.created_at || "").replace("T", " ").slice(0, 16),
});

export default function EntriesPage() {
  const [rows, setRows] = useState<Row[]>([]);

  // 초기 로드 + 실시간 구독
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("entries")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) setRows(data.map(mapRow));
    })();

    const channel = supabase
      .channel("entries-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "entries" }, (payload) => {
        const r = mapRow(payload.new);
        setRows((prev) => {
          const i = prev.findIndex((x) => x.id === r.id);
          if (i >= 0) { const next = [...prev]; next[i] = r; return next; }
          return [r, ...prev];
        });
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "entries" }, (payload) => {
        const r = mapRow(payload.new);
        setRows((prev) => prev.map((x) => (x.id === r.id ? r : x)));
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "entries" }, (payload) => {
        const id = payload.old?.id as string;
        setRows((prev) => prev.filter((x) => x.id !== id));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // CRUD 콜백 – 수정/삭제 즉시 DB 반영
  async function createRow(row: Row) {
    const { data, error } = await supabase
      .from("entries")
      .insert({
        reflect: row.reflect,
        item: row.item,
        platform: row.platform,
        content: row.content,
        owner: row.owner,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapRow(data); // setRows는 실시간 구독이 처리
  }

  async function saveRow(row: Row) {
    const { data, error } = await supabase
      .from("entries")
      .update({
        reflect: row.reflect,
        item: row.item,
        platform: row.platform,
        content: row.content,
        owner: row.owner,
      })
      .eq("id", row.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapRow(data); // setRows는 실시간 구독이 처리
  }

  async function deleteRow(id: string) {
    const { error } = await supabase.from("entries").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }

  return (
    <>
      <header className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Entries</h1>
        <div className="flex gap-2">
          <button onClick={() => exportExcel(rows)} className="btn btn-primary">
            엑셀로 내보내기 (.xlsx)
          </button>
        </div>
      </header>

      {/* 입력 즉시 DB 저장 */}
      <EntryForm onAdd={createRow} />

      <EntryTable
        rows={rows}
        setRows={setRows}
        onSaveRow={saveRow}
        onDeleteRow={deleteRow}
      />
    </>
  );
}