import { createServerSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(request.url);
    const category = url.searchParams.get("category");
    const search = url.searchParams.get("q");
    const limit = parseInt(url.searchParams.get("limit") || "200");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    let query = supabase.from("entries").select("*", { count: "exact" });

    if (category) query = query.eq("category", category);
    if (search) query = query.ilike("name", `%${search}%`);

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const entryIds = (data || []).map((e) => e.id);
    let links: { entry_a: number; entry_b: number }[] = [];
    if (entryIds.length > 0) {
      const { data: linkData } = await supabase
        .from("entry_links")
        .select("entry_a, entry_b")
        .or(`entry_a.in.(${entryIds.join(",")}),entry_b.in.(${entryIds.join(",")})`);
      links = linkData || [];
    }

    const entriesWithLinks = (data || []).map((entry) => ({
      ...entry,
      linkedTo: links
        .filter((l) => l.entry_a === entry.id || l.entry_b === entry.id)
        .map((l) => (l.entry_a === entry.id ? l.entry_b : l.entry_a)),
    }));

    return NextResponse.json({ entries: entriesWithLinks, total: count });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { linkedTo, ...entryData } = body;

    const { data: entry, error } = await supabase
      .from("entries")
      .insert(entryData)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (linkedTo?.length > 0) {
      const linkRows = linkedTo.map((targetId: number) => ({
        entry_a: Math.min(entry.id, targetId),
        entry_b: Math.max(entry.id, targetId),
      }));
      await supabase.from("entry_links").upsert(linkRows, { onConflict: "entry_a,entry_b" });
    }

    return NextResponse.json({ entry: { ...entry, linkedTo: linkedTo || [] } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
