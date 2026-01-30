import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextRequest } from "next/server";
import { rateLimit } from "@/lib/api/rateLimit";
import { getClientIp } from "@/lib/api/getClientIp";
import { z } from "zod";

// Input validation schema for POST
const customerUpdateSchema = z.object({
  email: z.string().email().max(255).optional(),
  name: z.string().min(1).max(100).regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s'-]*$/).optional(),
  surname: z.string().min(1).max(100).regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s'-]*$/).optional(),
  culture: z.enum(["tr", "en", "de", "fr"]).optional(),
  phone: z.string().max(30).nullable().optional(),
  phoneCode: z.string().max(10).nullable().optional(),
  phoneNumber: z.string().max(20).nullable().optional(),
});

// Production-safe logging (only in development)
const isDev = process.env.NODE_ENV === "development";
const safeLog = (...args: unknown[]) => {
  if (isDev) console.log(...args);
};

// Helper: Get user from Authorization header
async function getUserFromToken(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    safeLog("Token validation error");
    return null;
  }

  return user;
}

export async function GET(req: NextRequest) {
  // Rate limiting
  const userIp = getClientIp(req);
  if (!(await rateLimit(`customers_me_get:${userIp}`))) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  safeLog("GET /api/customers/v1/me");

  const user = await getUserFromToken(req);

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
    safeLog("provider_id ile bulunamadı, email ile aranıyor...");
    const emailResult = await supabaseAdmin
      .from("customers")
      .select("*")
      .eq("email", user.email)
      .maybeSingle();

    if (emailResult.data) {
      // Email ile bulundu, provider_id'yi güncelle
      safeLog("Email ile bulundu, provider_id güncelleniyor...");
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

  if (error) {
    console.error("Supabase GET ERROR:", error.code);
    return Response.json({ error: "Failed to fetch customer data" }, { status: 500 });
  }

  return Response.json({ customer: data ?? null }, { status: 200 });
}

export async function POST(req: NextRequest) {
  // Rate limiting
  const userIp = getClientIp(req);
  if (!(await rateLimit(`customers_me_post:${userIp}`))) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  safeLog("POST /api/customers/v1/me");

  const user = await getUserFromToken(req);

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Input validation
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const validation = customerUpdateSchema.safeParse(body);
  if (!validation.success) {
    return Response.json(
      { error: "Validation failed", details: validation.error.flatten() },
      { status: 400 }
    );
  }

  const validatedData = validation.data;
  const combinedPhone =
    validatedData.phone ??
    (validatedData.phoneCode || validatedData.phoneNumber
      ? `${validatedData.phoneCode ?? ""}${validatedData.phoneNumber ?? ""}`
      : undefined);

  // Önce provider_id ile ara
  let { data: existing } = await supabaseAdmin
    .from("customers")
    .select("*")
    .eq("provider_id", user.id)
    .maybeSingle();

  // provider_id ile bulunamadıysa email ile ara
  if (!existing && (validatedData.email || user.email)) {
    const emailToCheck = validatedData.email || user.email;
    safeLog("provider_id ile bulunamadı, email ile aranıyor");

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
    safeLog("Mevcut müşteri güncelleniyor...");
    const result = await supabaseAdmin
      .from("customers")
      .update({
        provider_id: user.id,
        email: validatedData.email || user.email || existing.email,
        name: validatedData.name || existing.name,
        surname: validatedData.surname || existing.surname,
        culture: validatedData.culture || existing.culture,
        phone: combinedPhone ?? existing.phone,
      })
      .eq("id", existing.id)
      .select()
      .single();
    data = result.data;
    error = result.error;
  } else {
    // Insert new customer
    safeLog("Yeni müşteri oluşturuluyor...");
    const result = await supabaseAdmin
      .from("customers")
      .insert({
        provider_id: user.id,
        email: validatedData.email || user.email,
        name: validatedData.name || "",
        surname: validatedData.surname || "",
        culture: validatedData.culture || "tr",
        phone: combinedPhone ?? null,
      })
      .select()
      .single();
    data = result.data;
    error = result.error;
  }

  if (error) {
    console.error("Supabase ERROR:", error.code);
    return Response.json({ error: "Failed to update customer data" }, { status: 500 });
  }

  return Response.json({ customer: data }, { status: 200 });
}
