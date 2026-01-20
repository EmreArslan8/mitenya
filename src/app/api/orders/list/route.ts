import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServer } from "@/lib/supabase/server";
import { validateSameOrigin, validateCsrfToken } from "@/lib/api/security";
import { rateLimit } from "@/lib/api/rateLimit";
import { getClientIp } from "@/lib/api/getClientIp";

export async function POST(req: NextRequest) {
  try {
    const csrfError = validateSameOrigin(req);
    if (csrfError) return csrfError;
    const csrfTokenError = validateCsrfToken(req);
    if (csrfTokenError) return csrfTokenError;

    const userIp = getClientIp(req);
    if (!(await rateLimit(`orders_list:${userIp}`))) {
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

    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("*")
      .or(
        [
          `user_id.eq.${user.id}`,
          user.email ? `user_email.eq.${user.email}` : null,
        ]
          .filter(Boolean)
          .join(",")
      )
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ orders: data });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
