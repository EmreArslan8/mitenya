import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { user_id, total_amount, status } = await req.json();

    if (!user_id) {
      return NextResponse.json({ error: "User ID missing" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id,
        total_amount,
        status: status || "pending"
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ order: data });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
