// repositories/entriesRepo.ts
import { supabase } from "@/lib/supabaseClient";
import type { Row } from "@/components/types";

const mapRow = (d: any): Row => ({
    id: d.id,
    reflect: d.reflect,
    item: d.item,
    platform: d.platform ?? [],
    content: d.content ?? "",
    owner: d.owner ?? "",
    createdAt: (d.created_at || "").replace("T", " ").slice(0, 16),
    completedAt: d.completedAt || null
});

export const entriesRepo = {
    async list(): Promise<Row[]> {
        const { data, error } = await supabase.from("entries").select("*").order("created_at", { ascending: false });
        if (error) throw new Error(error.message);
        return (data || []).map(mapRow);
    },
    async create(row: Omit<Row, "id" | "createdAt" | "_editing">): Promise<Row> {
        const { data, error } = await supabase
            .from("entries")
            .insert({ reflect: row.reflect, item: row.item, platform: row.platform, content: row.content, owner: row.owner })
            .select()
            .single();
        if (error) throw new Error(error.message);
        return mapRow(data);
    },
    async update(row: Row): Promise<Row> {
        const { data, error } = await supabase
            .from("entries")
            .update({ reflect: row.reflect, item: row.item, platform: row.platform, content: row.content, owner: row.owner })
            .eq("id", row.id)
            .select()
            .single();
        if (error) throw new Error(error.message);
        return mapRow(data);
    },
    async remove(id: string): Promise<void> {
        const { error } = await supabase.from("entries").delete().eq("id", id);
        if (error) throw new Error(error.message);
    },
    subscribe(onInsert: (r: Row) => void, onUpdate: (r: Row) => void, onDelete: (id: string) => void) {
        const channel = supabase
            .channel("entries-realtime")
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "entries" }, (payload) => onInsert(mapRow(payload.new)))
            .on("postgres_changes", { event: "UPDATE", schema: "public", table: "entries" }, (payload) => onUpdate(mapRow(payload.new)))
            .on("postgres_changes", { event: "DELETE", schema: "public", table: "entries" }, (payload) => onDelete(payload.old?.id as string))
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    },
};