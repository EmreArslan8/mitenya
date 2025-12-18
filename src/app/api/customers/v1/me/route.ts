import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export async function GET(req: NextRequest) {
  console.log("🟦 [BACKEND] GET /api/customers/v1/me");

  const session = await getServerSession(authOptions);
  console.log("🟪 [BACKEND] Session:", session?.user?.id);

  if (!session || !session.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("customers")
    .select("*")
    .eq("provider_id", session.user.id)
    .maybeSingle();

  console.log("🟩 [BACKEND] Supabase GET Result:", data);

  if (error) {
    console.log("🟥 [BACKEND] Supabase GET ERROR:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ customer: data ?? null }, { status: 200 });
}

export async function POST(req: NextRequest) {
    console.log("🟦 [BACKEND] POST /api/customers/v1/me");
  
    const session = await getServerSession(authOptions);
    console.log("🟪 [BACKEND] Session:", session?.user?.id);
  
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  
    const body = await req.json();
    console.log("🟧 [BACKEND] Incoming Body:", body);
  
    // FE → BE payload ile birebir eşleşmesi gereken alanlar
    const {
      full_name,   // FE tam olarak bunu gönderiyor
      email,
      culture,
      phone
    } = body;
  
    // Müşteri var mı?
    const { data: existing, error: existingError } = await supabaseAdmin
      .from("customers")
      .select("*")
      .eq("provider_id", session.user.id)
      .maybeSingle();
  
    if (existingError) {
      console.log("🟥 [BACKEND] Supabase SELECT ERROR:", existingError);
      return Response.json({ error: existingError.message }, { status: 500 });
    }
  
    let result;
  
    if (!existing) {
      // CREATE
      console.log("🟦 [BACKEND] Creating NEW customer...");
  
      const insertPayload = {
        provider_id: session.user.id,
        full_name,
        email,
        culture,
        phone,
      };
  
      const { data: inserted, error: insertErr } = await supabaseAdmin
        .from("customers")
        .insert(insertPayload)
        .select("*")
        .single();
  
      if (insertErr) {
        console.log("🟥 INSERT ERROR:", insertErr);
        return Response.json({ error: insertErr.message }, { status: 500 });
      }
  
      result = inserted;
    } else {
      // UPDATE
      console.log("🟦 [BACKEND] Updating existing customer...");
  
      const updatePayload = {
        full_name,
        email,
        culture,
        phone,
      };
  
      const { data: updated, error: updateErr } = await supabaseAdmin
        .from("customers")
        .update(updatePayload)
        .eq("provider_id", session.user.id)
        .select("*")
        .single();
  
      if (updateErr) {
        console.log("🟥 UPDATE ERROR:", updateErr);
        return Response.json({ error: updateErr.message }, { status: 500 });
      }
  
      result = updated;
    }
  
    console.log("🟩 [BACKEND] Final Customer Response:", result);
    return Response.json({ customer: result }, { status: 200 });
  }
  
