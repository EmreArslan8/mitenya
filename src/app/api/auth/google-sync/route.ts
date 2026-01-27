import { supabaseAdmin } from "@/lib/supabase/admin";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const expectedSecret = process.env.GOOGLE_SYNC_SECRET;
    const authHeader = req.headers.get("authorization");

    if (!expectedSecret) {
      console.warn("⚠️ GOOGLE_SYNC_SECRET missing");
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const provided = authHeader.replace("Bearer ", "").trim();
    if (provided !== expectedSecret) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { provider_id, full_name, email } = body;

    if (!provider_id || !email) {
      return NextResponse.json({ error: "Missing provider_id or email" }, { status: 400 });
    }

    // Var olan kullanıcıyı bul
    const { data: existing } = await supabaseAdmin
      .from("customers")
      .select("id")
      .eq("provider_id", provider_id)
      .single();

    if (existing) {
      return NextResponse.json({ supabase_id: existing.id }, { status: 200 });
    }

    // Yeni kullanıcı oluştur
    const { data, error } = await supabaseAdmin
      .from("customers")
      .insert({
        id: randomUUID(),
        provider_id,
        email,
        full_name: full_name ?? null,
      })
      .select()
      .single();

      console.log("SYNC BODY:", body);
      console.log("EXISTING:", existing);
      console.log("INSERT DATA:", data, "ERROR:", error);
      
    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ supabase_id: data.id }, { status: 201 });
    

  } catch (err) {
    console.error("Google Sync error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
