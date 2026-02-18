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

    const { data: byUserId, error: byUserIdError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (byUserIdError) {
      console.error("Orders list error:", byUserIdError.code);
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }

    let data = byUserId || [];
    if (user.email) {
      const { data: byEmail, error: byEmailError } = await supabaseAdmin
        .from("orders")
        .select("*")
        .eq("user_email", user.email)
        .order("created_at", { ascending: false });

      if (byEmailError) {
        console.error("Orders list error:", byEmailError.code);
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
      }

      const merged = new Map<string, { id: string; created_at: string } & Record<string, unknown>>();
      for (const order of data) merged.set(order.id, order);
      for (const order of byEmail || []) merged.set(order.id, order);
      data = Array.from(merged.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    const orders = (data || []).filter((order) => {
      const paymentMethod = String(order.payment_method || "").toLowerCase();
      const paymentStatus = String(order.payment_status || "").toLowerCase();
      const isCardPayment = paymentMethod === "paytr" || paymentMethod === "stripe";
      return !(isCardPayment && paymentStatus !== "paid");
    });

    return NextResponse.json({ orders });

  } catch (err: unknown) {
    console.error("Orders list error:", err instanceof Error ? err.message : "Unknown error");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
