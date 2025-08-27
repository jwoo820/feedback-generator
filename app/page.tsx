"use client";

import { useEffect, useRef, useState } from "react";
import EntryForm from "@/components/EntryForm";
import EntryTable from "@/components/EntryTable";
import type { Row } from "@/components/types";
import { exportExcel, importExcel } from "@/utils/xlsx";

const STORAGE_KEY = "entry_rows_v1";

export default function Page() {
  const [rows, setRows] = useState<Row[]>([]);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // restore
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setRows(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    // persist
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  }, [rows]);

  const onAdd = (row: Row) => setRows([row, ...rows]);

  const onImport = async (file: File) => {
    const imported = await importExcel(file);
    if (!imported.length) { alert("가져올 유효한 데이터가 없습니다."); return; }
    setRows([...imported, ...rows]);
    alert(`${imported.length}건을 불러왔습니다.`);
  };

  const clearAll = () => {
    if (!confirm("모든 데이터를 지우시겠습니까?")) return;
    setRows([]);
  };

  return (
    <>
      <header className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">항목 입력 → 엑셀 내보내기</h1>
        <div className="flex gap-2">
          <button onClick={()=>exportExcel(rows)} className="btn btn-primary">엑셀로 내보내기 (.xlsx)</button>
          <label className="btn btn-ghost cursor-pointer">
            엑셀 불러오기
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e)=>{
                const f = e.target.files?.[0];
                if (f) onImport(f);
                if (fileRef.current) fileRef.current.value = "";
              }}
            />
          </label>
        </div>
      </header>

      <EntryForm onAdd={onAdd} />
      <EntryTable rows={rows} setRows={setRows} />

      <section className="card">
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500">로컬에만 저장됩니다. 엑셀로 내보내어 백업하세요.</div>
          <div className="space-x-2">
            <button className="btn btn-ghost" onClick={()=>{localStorage.setItem(STORAGE_KEY, JSON.stringify(rows)); alert("로컬 저장 완료");}}>로컬 저장</button>
            <button className="btn btn-ghost" onClick={()=>{ const raw = localStorage.getItem(STORAGE_KEY); setRows(raw ? JSON.parse(raw) : []); alert("로컬에서 불러왔습니다"); }}>불러오기</button>
            <button className="btn btn-ghost" onClick={clearAll}>전체 비우기</button>
          </div>
        </div>
      </section>
    </>
  );
}
