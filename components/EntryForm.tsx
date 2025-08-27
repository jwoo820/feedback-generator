"use client";

import { useState } from "react";
import type { Row } from "./types";

type Props = {
  onAdd: (row: Row) => void;
};

export default function EntryForm({ onAdd }: Props) {
  const [reflect, setReflect] = useState<Row["reflect"]>("미반영");
  const [item, setItem] = useState("");
  const [app, setApp] = useState(false);
  const [web, setWeb] = useState(false);
  const [owner, setOwner] = useState("");
  const [content, setContent] = useState("");

  const clear = () => {
    setReflect("미반영");
    setItem("");
    setApp(false);
    setWeb(false);
    setOwner("");
    setContent("");
  };

  const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
  const nowISO = () => new Date().toISOString().replace("T", " ").slice(0, 16);

  const add = () => {
    if (!item.trim()) {
      alert("항목을 입력하세요");
      return;
    }
    const row: Row = {
      id: uid(),
      reflect,
      item: item.trim(),
      platform: [app ? "APP" : null, web ? "Web" : null].filter(Boolean) as ("APP" | "Web")[],
      content: content.trim(),
      owner: owner.trim(),
      createdAt: nowISO(),
    };
    onAdd(row);
    clear();
  };

  return (
    <section className="card">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">반영 여부</label>
          <select
            value={reflect}
            onChange={(e) => setReflect(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            <option value="미반영">미반영</option>
            <option value="검토중">검토중</option>
            <option value="반영완료">반영완료</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">항목</label>
          <input
            value={item}
            onChange={(e) => setItem(e.target.value)}
            type="text"
            placeholder="예: 로그인 개선"
            className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">플랫폼</label>
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" className="scale-110" checked={app} onChange={(e) => setApp(e.target.checked)} />
              <span>APP</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" className="scale-110" checked={web} onChange={(e) => setWeb(e.target.checked)} />
              <span>Web</span>
            </label>
          </div>
        </div>
        <div className="space-y-2 md:col-span-1">
          <label className="block text-sm font-medium">담당자 (선택)</label>
          <input
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            type="text"
            placeholder="예: 최승훈"
            className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-medium">내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            placeholder="세부 내용을 입력하세요"
            className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={add} className="btn btn-primary">추가</button>
        <button onClick={clear} className="btn btn-ghost" title="폼 리셋">리셋</button>
      </div>
    </section>
  );
}
