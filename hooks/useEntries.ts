// hooks/useEntries.ts
"use client";

import { useEffect, useState } from "react";
import type { Row } from "@/components/types";
import { entriesRepo } from "@/repositories/entriesRepo";

export function useEntries(enabled = true) {
    const [rows, setRows] = useState<Row[]>([]);

    useEffect(() => {
        if (!enabled) return;

        let disposed = false;

        (async () => {
            try {
                const list = await entriesRepo.list();
                if (!disposed) setRows(list);
            } catch (e) {
                console.error(e);
            }
        })();

        const unsub = entriesRepo.subscribe(
            (r) => setRows((prev) => [r, ...prev]),
            (r) => setRows((prev) => prev.map((x) => (x.id === r.id ? r : x))),
            (id) => setRows((prev) => prev.filter((x) => x.id !== id))
        );

        return () => {
            disposed = true;
            unsub();
        };
    }, [enabled]);

    return {
        rows,
        setRows,
        createRow: (row: Omit<Row, "id" | "createdAt" | "_editing">) => entriesRepo.create(row),
        saveRow: (row: Row) => entriesRepo.update(row),
        deleteRow: (id: string) => entriesRepo.remove(id),
    } as const;
}