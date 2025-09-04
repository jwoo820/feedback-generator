// app/layout.tsx
import "../styles/globals.css";
import Link from "next/link";

export const metadata = { title: "Feedback Generator" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <header>
          <nav className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-bold text-lg">Feedback Generator</Link>
            <div className="flex gap-4 text-sm">
              <Link href="/entries">Entries</Link>
              <Link href="/settings">Settings</Link>
              <Link href="/login">Login</Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}