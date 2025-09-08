"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {

  const router = useRouter();
  const search = useSearchParams();
  const debug = search?.has("debugAuth") ?? false;

  const { loading, user, signInWithPassword, signUpWithPassword } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Prevent multiple navigations
  const navigatingRef = useRef(false);

  // One-time redirect after session is ready
  useEffect(() => {
    if (!loading && user && !navigatingRef.current) {
      navigatingRef.current = true;
      router.replace("/entries");
    }
  }, [loading, user, router]);

  // Optional debug logs
  useEffect(() => {
    if (!debug) return;
    // eslint-disable-next-line no-console
    console.log("[login:state]", { loading, hasUser: !!user, navigating: navigatingRef.current });
  }, [debug, loading, user]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (mode === "signin") {
        await signInWithPassword(email, password);
      } else {
        await signUpWithPassword(email, password);
      }
      // Backup: confirm session then navigate once
      const { data } = await supabase.auth.getSession();
      if (data.session && !navigatingRef.current) {
        navigatingRef.current = true;
        router.replace("/entries");
      }
    } catch (err: any) {
      alert(err?.message || "로그인 실패");
    }
  }

  if (loading) return <div className="p-6">로딩 중…</div>;
  if (user && debug) return <div className="p-6">/entries로 이동 중…</div>;
  if (user) return null; // navigating to /entries

  return (
    <section className="max-w-md mx-auto space-y-6">
      {debug && (
        <div className="card">
          <div className="text-xs opacity-80">DEBUG MODE</div>
          <pre className="text-xs whitespace-pre-wrap break-all">{JSON.stringify({ loading, userId: (user as any)?.id ?? null }, null, 2)}</pre>
        </div>
      )}

      <h1 className="text-2xl font-bold">{mode === "signin" ? "로그인" : "회원가입"}</h1>

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="input w-full"
          type="email"
          required
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="input w-full"
          type="password"
          required
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="btn btn-primary w-full" type="submit">
          {mode === "signin" ? "로그인" : "회원가입"}
        </button>
      </form>

      <button
        className="btn btn-ghost w-full"
        onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
      >
        {mode === "signin" ? "회원가입으로" : "이미 계정이 있어요"}
      </button>
    </section>
  );
}