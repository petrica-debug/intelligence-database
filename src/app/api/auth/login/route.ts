import { createServerSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const supabase = await createServerSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 200 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (profile && !profile.active) {
      await supabase.auth.signOut();
      return NextResponse.json({ error: "Account disabled" }, { status: 200 });
    }

    return NextResponse.json({ user: data.user, profile });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
