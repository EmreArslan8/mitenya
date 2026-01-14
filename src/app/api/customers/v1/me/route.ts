import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextRequest } from "next/server";

// Helper: Get user from Authorization header
async function getUserFromToken(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    console.log("🟥 [BACKEND] Token validation error:", error?.message);
    return null;
  }

  return user;
}

export async function GET(req: NextRequest) {
  console.log("🟦 [BACKEND] GET /api/customers/v1/me");

  const user = await getUserFromToken(req);
  console.log("🟪 [BACKEND] User:", user?.id, user?.email);

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Önce provider_id ile ara
  let { data, error } = await supabaseAdmin
    .from("customers")
    .select("*")
    .eq("provider_id", user.id)
    .maybeSingle();

  // provider_id ile bulunamadıysa email ile ara
  if (!data && user.email) {
    console.log("🟡 [BACKEND] provider_id ile bulunamadı, email ile aranıyor...");
    const emailResult = await supabaseAdmin
      .from("customers")
      .select("*")
      .eq("email", user.email)
      .maybeSingle();

    if (emailResult.data) {
      // Email ile bulundu, provider_id'yi güncelle
      console.log("🟢 [BACKEND] Email ile bulundu, provider_id güncelleniyor...");
      const updateResult = await supabaseAdmin
        .from("customers")
        .update({ provider_id: user.id })
        .eq("email", user.email)
        .select()
        .single();

      data = updateResult.data;
      error = updateResult.error;
    }
  }

  console.log("🟩 [BACKEND] Supabase GET Result:", data);

  if (error) {
    console.log("🟥 [BACKEND] Supabase GET ERROR:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ customer: data ?? null }, { status: 200 });
}

export async function POST(req: NextRequest) {
  console.log("🟦 [BACKEND] POST /api/customers/v1/me");

  const user = await getUserFromToken(req);
  console.log("🟪 [BACKEND] User:", user?.id, user?.email);

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  console.log("🟧 [BACKEND] Request body:", body);

  // Önce provider_id ile ara
  let { data: existing } = await supabaseAdmin
    .from("customers")
    .select("*")
    .eq("provider_id", user.id)
    .maybeSingle();

  // provider_id ile bulunamadıysa email ile ara
  if (!existing && (body.email || user.email)) {
    const emailToCheck = body.email || user.email;
    console.log("🟡 [BACKEND] provider_id ile bulunamadı, email ile aranıyor:", emailToCheck);

    const emailResult = await supabaseAdmin
      .from("customers")
      .select("*")
      .eq("email", emailToCheck)
      .maybeSingle();

    existing = emailResult.data;
  }

  let data, error;

  if (existing) {
    // Update existing customer (provider_id'yi de güncelle)
    console.log("🟢 [BACKEND] Mevcut müşteri güncelleniyor...");
    const result = await supabaseAdmin
      .from("customers")
      .update({
        provider_id: user.id, // Her zaman güncel provider_id'yi set et
        email: body.email || user.email || existing.email,
        name: body.name || existing.name,
        surname: body.surname || existing.surname,
        culture: body.culture || existing.culture,
      })
      .eq("id", existing.id)
      .select()
      .single();
    data = result.data;
    error = result.error;
  } else {
    // Insert new customer
    console.log("🟢 [BACKEND] Yeni müşteri oluşturuluyor...");
    const result = await supabaseAdmin
      .from("customers")
      .insert({
        provider_id: user.id,
        email: body.email || user.email,
        name: body.name || "",
        surname: body.surname || "",
        culture: body.culture || "tr",
      })
      .select()
      .single();
    data = result.data;
    error = result.error;
  }

  console.log("🟩 [BACKEND] Supabase Result:", data);

  if (error) {
    console.log("🟥 [BACKEND] Supabase ERROR:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ customer: data }, { status: 200 });
}