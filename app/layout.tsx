// app/layout.tsx
// import "../styles/globals.css";
import Link from "next/link";
import "@/styles/globals.css";


export const metadata = {
  title: "Feedback Generator",
  description: "Entries → Excel with realtime Supabase sync",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-white dark:bg-slate-900 text-slate-100">
        <header className="border-b border-slate-200/60 dark:border-slate-800/60">
          <nav className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-bold text-lg">Feedback Generator</Link>
            <div className="flex gap-4 text-sm">
              <Link href="/entries" className="hover:underline">Entries</Link>
              <Link href="/settings" className="hover:underline">Settings</Link>
              <Link href="/login" className="hover:underline">Login</Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}