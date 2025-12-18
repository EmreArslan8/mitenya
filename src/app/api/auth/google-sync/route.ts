import { supabaseAdmin } from "@/lib/supabase/admin";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { provider_id, full_name, email } = body;

    if (!provider_id || !email) {
      return Response.json({ error: "Missing provider_id or email" }, { status: 400 });
    }

    // Var olan kullanıcıyı bul
    const { data: existing } = await supabaseAdmin
      .from("customers")
      .select("id")
      .eq("provider_id", provider_id)
      .single();

    if (existing) {
      return Response.json({ supabase_id: existing.id }, { status: 200 });
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
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ supabase_id: data.id }, { status: 201 });
    

  } catch (err) {
    console.error("Google Sync error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
