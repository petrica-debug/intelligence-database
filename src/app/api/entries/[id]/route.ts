import { createServerSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const entryId = parseInt(id);
    const { data: entry, error } = await supabase
      .from("entries")
      .select("*")
      .eq("id", entryId)
      .single();

    if (error || !entry) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data: links } = await supabase
      .from("entry_links")
      .select("entry_a, entry_b")
      .or(`entry_a.eq.${entryId},entry_b.eq.${entryId}`);

    const linkedTo = (links || []).map((l) =>
      l.entry_a === entryId ? l.entry_b : l.entry_a
    );

    return NextResponse.json({ entry: { ...entry, linkedTo } });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const entryId = parseInt(id);
    const body = await request.json();
    const { linkedTo, ...updateData } = body;

    const { data: entry, error } = await supabase
      .from("entries")
      .update(updateData)
      .eq("id", entryId)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (linkedTo !== undefined) {
      await supabase
        .from("entry_links")
        .delete()
        .or(`entry_a.eq.${entryId},entry_b.eq.${entryId}`);

      if (linkedTo.length > 0) {
        const linkRows = linkedTo.map((targetId: number) => ({
          entry_a: Math.min(entryId, targetId),
          entry_b: Math.max(entryId, targetId),
        }));
        await supabase.from("entry_links").upsert(linkRows, { onConflict: "entry_a,entry_b" });
      }
    }

    return NextResponse.json({ entry: { ...entry, linkedTo: linkedTo || [] } });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { error } = await supabase.from("entries").delete().eq("id", parseInt(id));
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
