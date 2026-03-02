import { createServerSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();

    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("for_user", profile.username)
      .order("ts", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ notifications: data });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, read } = await request.json();

    if (id === "all") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      if (profile) {
        await supabase
          .from("notifications")
          .update({ read: true })
          .eq("for_user", profile.username);
      }
    } else {
      await supabase.from("notifications").update({ read }).eq("id", id);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
