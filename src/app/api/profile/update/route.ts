import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { user_id, name, avatar_url } = await req.json();

    const { data, error } = await supabaseAdmin
      .from("customers")
      .update({
        name,
        avatar_url
      })
      .eq("id", user_id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ user: data });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
