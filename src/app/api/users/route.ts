import { createServerSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("profiles")
      .select("username, role, access, clearance, active, full_name, department, created_at")
      .order("created_at", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ users: data });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
