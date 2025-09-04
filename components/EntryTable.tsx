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
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string
  ));
}

function ReflectBadge({ value }: { value: Row["reflect"] }) {
  const base =
    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border whitespace-nowrap";
  if (value === "반영완료")
    return <span className={`${base} border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300`}>{value}</span>;
  if (value === "검토중")
    return <span className={`${base} border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300`}>{value}</span>;
  return <span className={`${base} border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200`}>{value}</span>;
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
      updateRowLocal(id, { ...saved, _editing: false });
    } catch (e: any) {
      alert(e?.message || "저장 실패");
    }
  }

  async function onDelete(id: string) {
    if (!confirm("삭제하시겠습니까?")) return;
    try {
      await onDeleteRow(id);
      setRows(rows.filter((r) => r.id !== id));
    } catch (e: any) {
      alert(e?.message || "삭제 실패");
    }
  }

  const resetFilter = () => { setQ(""); setFReflect(""); setFApp(false); setFWeb(false); };

  return (
    <>
      {/* Filters */}
      <section className="card">
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="text"
            placeholder="검색: 항목/내용/담당자"
            className="input flex-1 min-w-[240px]"
          />
          <select value={fReflect} onChange={(e) => setFReflect(e.target.value)} className="input">
            <option value="">모두</option>
            <option value="미반영">미반영</option>
            <option value="검토중">검토중</option>
            <option value="반영완료">반영완료</option>
          </select>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" className="scale-110" checked={fApp} onChange={(e) => setFApp(e.target.checked)} />
            <span>APP만</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" className="scale-110" checked={fWeb} onChange={(e) => setFWeb(e.target.checked)} />
            <span>Web만</span>
          </label>
          <button onClick={resetFilter} className="btn btn-ghost">필터 초기화</button>
        </div>
      </section>

      {/* Table */}
      <section className="card">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-slate-600 dark:text-slate-400">총 <span>{filtered.length}</span>건</div>
        </div>
        <div className="overflow-auto max-h-[70vh] rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur dark:bg-slate-800/80">
              <tr>
                <th className="px-3 py-2 text-left w-28">반영 여부</th>
                <th className="px-3 py-2 text-left w-64">항목</th>
                <th className="px-3 py-2 text-left w-36">플랫폼</th>
                <th className="px-3 py-2 text-left w-[560px]">내용</th>
                <th className="px-3 py-2 text-left w-32">담당자</th>
                <th className="px-3 py-2 text-left w-40">생성일시</th>
                <th className="px-3 py-2 text-left w-40">완료일시</th>
                <th className="px-3 py-2 text-left w-36">작업</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, idx) => (
                <tr key={r.id} className={idx % 2 ? "bg-slate-50/60 dark:bg-slate-900/40" : undefined}>
                  {r._editing ? (
                    <>
                      <td className="px-3 py-2 align-top">
                        <select className="input" value={r.reflect} onChange={(e) => updateRowLocal(r.id, { reflect: e.target.value })}>
                          <option>미반영</option>
                          <option>검토중</option>
                          <option>반영완료</option>
                        </select>
                      </td>
                      <td className="px-3 py-2 align-top">
                        <input value={r.item} onChange={(e) => updateRowLocal(r.id, { item: e.target.value })} className="input w-full" />
                      </td>
                      <td className="px-3 py-2 align-top">
                        <label className="inline-flex items-center gap-2 mr-2">
                          <input
                            type="checkbox"
                            checked={r.platform.includes("APP")}
                            onChange={(e) => {
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
                            onChange={(e) => {
                              const set = new Set(r.platform);
                              e.target.checked ? set.add("Web") : set.delete("Web");
                              updateRowLocal(r.id, { platform: Array.from(set) as any });
                            }}
                          />
                          <span>Web</span>
                        </label>
                      </td>
                      <td className="px-3 py-2 align-top w-[560px]">
                        <textarea
                          value={r.content}
                          onChange={(e) => updateRowLocal(r.id, { content: e.target.value })}
                          className="input w-full h-36 resize-y overflow-auto"
                          rows={6}
                        />
                      </td>
                      <td className="px-3 py-2 align-top">
                        <input value={r.owner || ""} onChange={(e) => updateRowLocal(r.id, { owner: e.target.value })} className="input w-full" />
                      </td>
                      <td className="px-3 py-2 align-top text-xs text-slate-500">{r.createdAt}</td>
                      <td className="px-3 py-2 align-top text-xs text-slate-500 whitespace-nowrap">{r.completedAt || "-"}</td>
                      <td className="px-3 py-2 align-top">
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <button
                            className="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800"
                            onClick={() => onSave(r.id)}
                          >저장</button>
                          <button
                            className="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium border border-slate-300 bg-white hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700"
                            onClick={() => updateRowLocal(r.id, { _editing: false })}
                          >취소</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-3 py-2 align-top"><ReflectBadge value={r.reflect} /></td>
                      <td className="px-3 py-2 align-top font-medium">{escapeHtml(r.item)}</td>
                      <td className="px-3 py-2 align-top">
                        <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap pr-1">
                          {(r.platform || []).map((p) => (
                            <span key={p} className="chip">{p}</span>
                          )) || "-"}
                        </div>
                      </td>
                      <td className="px-3 py-2 align-top w-[560px]">
                        <div className="max-h-36 overflow-auto whitespace-pre-wrap pr-1">
                          {escapeHtml(r.content)}
                        </div>
                      </td>
                      <td className="px-3 py-2 align-top">{escapeHtml(r.owner || "-")}</td>
                      <td className="px-3 py-2 align-top text-xs text-slate-500">{r.createdAt}</td>
                      <td className="px-3 py-2 align-top text-xs text-slate-500 whitespace-nowrap">{r.completedAt || "-"}</td>
                      <td className="px-3 py-2 align-top">
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          {!r.completedAt && (
                            <button
                              className="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800"
                              onClick={async () => {
                                const now = new Date().toISOString().replace("T", " ").slice(0, 16);
                                // optimistic update
                                updateRowLocal(r.id, { completedAt: now });
                                try {
                                  const saved = await onSaveRow({ ...r, completedAt: now });
                                  updateRowLocal(r.id, saved);
                                } catch (e: any) {
                                  alert(e?.message || "완료 저장 실패");
                                  // revert if failed
                                  updateRowLocal(r.id, { completedAt: undefined });
                                }
                              }}
                            >완료</button>
                          )}

                          <button
                            className="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
                            onClick={() => updateRowLocal(r.id, { _editing: true })}
                          >수정</button>
                          <button
                            className="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800"
                            onClick={() => onDelete(r.id)}
                          >삭제</button>
                        </div>
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