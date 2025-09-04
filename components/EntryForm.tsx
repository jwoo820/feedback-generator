// components/EntryForm.tsx
"use client";

import { useState } from "react";
import type { Row } from "./types";

type Props = { onAdd: (row: Row) => void | Promise<any> };

export default function EntryForm({ onAdd }: Props) {
  const [reflect, setReflect] = useState<Row["reflect"]>("미반영");
  const [item, setItem] = useState("");
  const [app, setApp] = useState(true);
  const [web, setWeb] = useState(false);
  const [service, setService] = useState(false);
  const [tablet, setTablet] = useState(false);
  const [content, setContent] = useState("");
  const [owner, setOwner] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!item.trim()) return alert("항목을 입력하세요.");
    const row: Row = {
      id: Math.random().toString(36).slice(2),
      reflect,
      item: item.trim(),
      platform: [app && "APP", web && "Web", service && "Service", tablet && "Tablet"].filter(Boolean) as ("APP" | "Web" | "Service" | "Tablet")[],
      content,
      owner,
      createdAt: new Date().toISOString().replace("T", " ").slice(0, 16),
    };
    await onAdd(row);
    // reset(입력 UX에 맞게 필요시 유지)
    setItem(""); setContent(""); setOwner("");
  }

  return (
    <form onSubmit={submit} className="card space-y-3 mb-4">
      <div className="flex flex-wrap gap-3">
        <select value={reflect} onChange={(e) => setReflect(e.target.value)} className="input">
          <option>미반영</option>
          <option>검토중</option>
          <option>반영완료</option>
        </select>
        <input value={item} onChange={(e) => setItem(e.target.value)} placeholder="항목" className="input flex-1 min-w-[200px]" />
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={app} onChange={(e) => setApp(e.target.checked)} />
          <span>APP</span>
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={web} onChange={(e) => setWeb(e.target.checked)} />
          <span>Web</span>
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={service} onChange={(e) => setService(e.target.checked)} />
          <span>Service</span>
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={tablet} onChange={(e) => setTablet(e.target.checked)} />
          <span>Tablet</span>
        </label>
        <input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="담당자" className="input w-40" />
      </div>
      <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="내용" rows={2} className="input w-full" />
      <div className="text-right">
        <button className="btn btn-primary">추가</button>
      </div>
    </form>
  );
}