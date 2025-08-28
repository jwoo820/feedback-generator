"use client";

import { useMemo, useState } from "react";
import type { Row } from "./types";

type Props = {
  rows: Row[];
  setRows: (rows: Row[]) => void;
  onSaveRow: (row: Row) => Promise<Row>;
  onDeleteRow: (id: string) => Promise<void>;
};

function escapeHtml(s = "") {
  return s.replace(/[&<>"']/g, (c) => (
    {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c] as string
  ));
}

export default function EntryTable({ rows, setRows, onSaveRow, onDeleteRow }: Props) {
  const [q, setQ] = useState("");
  const [fReflect, setFReflect] = useState("");
  const [fApp, setFApp] = useState(false);
  const [fWeb, setFWeb] = useState(false);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return rows.filter((r) => {
      const matchText = !qq || [r.item, r.content, r.owner ?? ""].join(" ").toLowerCase().includes(qq);
      const matchRef = !fReflect || r.reflect === fReflect;
      const matchApp = !fApp || r.platform.includes("APP");
      const matchWeb = !fWeb || r.platform.includes("Web");
      return matchText && matchRef && matchApp && matchWeb;
    });
  }, [rows, q, fReflect, fApp, fWeb]);

  const updateRowLocal = (id: string, patch: Partial<Row>) => {
    setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  async function onSave(id: string) {
    const r = rows.find((x) => x.id === id);
    if (!r) return;
    try {
      const saved = await onSaveRow({ ...r, _editing: false });
      updateRowLocal(id, { ...saved, _editing: false }); // 실시간 구독이 있어도 UX 즉시 반영
    } catch (e: any) {
      alert(e?.message || "저장 실패");
    }
  }

  async function onDelete(id: string) {
    if (!confirm("삭제하시겠습니까?")) return;
    try {
      await onDeleteRow(id);
      // 실시간 구독에 의해 제거되지만, 즉시 UX 반영
      setRows(rows.filter((r) => r.id !== id));
    } catch (e: any) {
      alert(e?.message || "삭제 실패");
    }
  }

  const resetFilter = () => {
    setQ(""); setFReflect(""); setFApp(false); setFWeb(false);
  };

  return (
    <>
      {/* 검색/필터 */}
      <section className="card">
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="text"
            placeholder="검색: 항목/내용/담당자"
            className="flex-1 min-w-[240px] px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <select
            value={fReflect}
            onChange={(e) => setFReflect(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            <option value="">모두</option>
            <option value="미반영">미반영</option>
            <option value="검토중">검토중</option>
            <option value="반영완료">반영완료</option>
          </select>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" className="scale-110" checked={fApp} onChange={(e)=>setFApp(e.target.checked)} />
            <span>APP만</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" className="scale-110" checked={fWeb} onChange={(e)=>setFWeb(e.target.checked)} />
            <span>Web만</span>
          </label>
          <button onClick={resetFilter} className="btn btn-ghost">필터 초기화</button>
        </div>
      </section>

      {/* 리스트 */}
      <section className="card">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-slate-600 dark:text-slate-400">총 <span>{filtered.length}</span>건</div>
        </div>
        <div className="overflow-auto max-h-[60vh] rounded-xl border border-slate-200 dark:border-slate-700">
          <table>
            <thead>
              <tr>
                <th className="w-28">반영 여부</th>
                <th className="w-64">항목</th>
                <th className="w-32">플랫폼</th>
                <th>내용</th>
                <th className="w-32">담당자</th>
                <th className="w-40">생성일시</th>
                <th className="w-36">작업</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  {r._editing ? (
                    <>
                      <td>
                        <select
                          className="w-full px-2 py-1 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                          value={r.reflect}
                          onChange={(e)=>updateRowLocal(r.id, { reflect: e.target.value })}
                        >
                          <option>미반영</option>
                          <option>검토중</option>
                          <option>반영완료</option>
                        </select>
                      </td>
                      <td>
                        <input
                          value={r.item}
                          onChange={(e)=>updateRowLocal(r.id, { item: e.target.value })}
                          className="w-full px-2 py-1 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        />
                      </td>
                      <td>
                        <label className="inline-flex items-center gap-2 mr-2">
                          <input
                            type="checkbox"
                            checked={r.platform.includes("APP")}
                            onChange={(e)=>{
                              const set = new Set(r.platform);
                              e.target.checked ? set.add("APP") : set.delete("APP");
                              updateRowLocal(r.id, { platform: Array.from(set) as any });
                            }}
                          />
                          <span>APP</span>
                        </label>
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={r.platform.includes("Web")}
                            onChange={(e)=>{
                              const set = new Set(r.platform);
                              e.target.checked ? set.add("Web") : set.delete("Web");
                              updateRowLocal(r.id, { platform: Array.from(set) as any });
                            }}
                          />
                          <span>Web</span>
                        </label>
                      </td>
                      <td>
                        <textarea
                          value={r.content}
                          onChange={(e)=>updateRowLocal(r.id, { content: e.target.value })}
                          rows={2}
                          className="w-full px-2 py-1 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        />
                      </td>
                      <td>
                        <input
                          value={r.owner || ""}
                          onChange={(e)=>updateRowLocal(r.id, { owner: e.target.value })}
                          className="w-full px-2 py-1 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        />
                      </td>
                      <td className="text-xs text-slate-500">{r.createdAt}</td>
                      <td className="space-x-2">
                        <button className="btn btn-primary" onClick={()=>onSave(r.id)}>저장</button>
                        <button className="btn btn-ghost" onClick={()=>updateRowLocal(r.id, { _editing: false })}>취소</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td><span className="chip">{r.reflect}</span></td>
                      <td className="font-medium">{escapeHtml(r.item)}</td>
                      <td>{(r.platform || []).map((p) => <span key={p} className="chip mr-1">{p}</span>) || "-"}</td>
                      <td className="whitespace-pre-wrap">{escapeHtml(r.content)}</td>
                      <td>{escapeHtml(r.owner || "-")}</td>
                      <td className="text-xs text-slate-500">{r.createdAt}</td>
                      <td className="space-x-2">
                        <button className="btn btn-ghost" onClick={()=>updateRowLocal(r.id, { _editing: true })}>수정</button>
                        {/* 복제 버튼 제거 */}
                        <button className="btn btn-ghost" onClick={()=>onDelete(r.id)}>삭제</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}