// utils/xlsx.ts
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
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Entries");
  const dateTag = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `entries_${dateTag}.xlsx`);
}