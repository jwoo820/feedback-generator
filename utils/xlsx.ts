import type { Row } from "@/components/types";

export async function exportExcel(rows: Row[]) {
  if (!rows.length) {
    alert("내보낼 데이터가 없습니다.");
    return;
  }
  const XLSX = await import("xlsx");
  const data = rows.map((r) => ({
    "반영 여부": r.reflect,
    "항목": r.item,
    "플랫폼": r.platform.join(", "),
    "내용": r.content,
    "담당자": r.owner || "",
    "생성일시": r.createdAt,
  }));
  const ws = XLSX.utils.json_to_sheet(data, { origin: 0 });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Entries");
  const dateTag = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `entries_${dateTag}.xlsx`);
}

export async function importExcel(file: File): Promise<Row[]> {
  const arrayBuffer = await file.arrayBuffer();
  const XLSX = await import("xlsx");
  const wb = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const json: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" });
  const nowISO = () => new Date().toISOString().replace("T", " ").slice(0, 16);
  const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);

  const imported: Row[] = json
    .map((r) => ({
      id: uid(),
      reflect: String(r["반영 여부"] ?? r["반영여부"] ?? r["상태"] ?? "미반영"),
      item: String(r["항목"] ?? r["타이틀"] ?? r["제목"] ?? ""),
      platform: String(r["플랫폼"] ?? r["APP/Web"] ?? "")
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean) as ("APP" | "Web")[],
      content: String(r["내용"] ?? r["설명"] ?? ""),
      owner: String(r["담당자"] ?? ""),
      createdAt: nowISO(),
    }))
    .filter((x) => x.item);
  return imported;
}
