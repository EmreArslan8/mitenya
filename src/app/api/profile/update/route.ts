import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServer } from "@/lib/supabase/server";
import { validateSameOrigin, validateCsrfToken } from "@/lib/api/security";
import { rateLimit } from "@/lib/api/rateLimit";
import { getClientIp } from "@/lib/api/getClientIp";
import { z } from "zod";

// Input validation schema
const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "İsim en az 2 karakter olmalı")
    .max(100, "İsim en fazla 100 karakter olabilir")
    .regex(
      /^[a-zA-ZğüşıöçĞÜŞİÖÇ\s'-]+$/,
      "İsim sadece harf ve boşluk içerebilir"
    )
    .optional(),
  avatar_url: z
    .string()
    .url("Geçerli bir URL giriniz")
    .max(500, "URL çok uzun")
    .nullable()
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    const csrfError = validateSameOrigin(req);
    if (csrfError) return csrfError;
    const csrfTokenError = validateCsrfToken(req);
    if (csrfTokenError) return csrfTokenError;

    const userIp = getClientIp(req);
    if (!(await rateLimit(`profile_update:${userIp}`))) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const supabase = await createSupabaseServer();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Input validation with Zod
    const body = await req.json();
    const validationResult = updateProfileSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { name, avatar_url } = validationResult.data;

    const { data, error } = await supabaseAdmin
      .from("customers")
      .update({
        name,
        avatar_url
      })
      .eq("id", user.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ user: data });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
