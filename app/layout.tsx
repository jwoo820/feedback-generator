import "./../styles/globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "항목 입력 → 엑셀 내보내기",
  description: "간단 입력/필터/엑셀 내보내기 툴",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 text-slate-900 dark:text-slate-100">
        <div className="max-w-6xl mx-auto p-6 space-y-6">{children}</div>
      </body>
    </html>
  );
}
