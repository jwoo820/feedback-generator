// hooks/useAuth.ts
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useAuth() {
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]>(null);
    const user = session?.user ?? null;

    useEffect(() => {
        let mounted = true;

        (async () => {
            const { data } = await supabase.auth.getSession();
            if (mounted) setSession(data.session);
            setLoading(false);
        })();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, sess) => {
            if (mounted) setSession(sess);
        });

        return () => {
            mounted = false;
            authListener.subscription.unsubscribe();
        };
    }, []);

    async function signInWithPassword(email: string, password: string) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
    }
    async function signUpWithPassword(email: string, password: string) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
    }
    async function signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    }

    return { loading, session, user, signInWithPassword, signUpWithPassword, signOut } as const;
}