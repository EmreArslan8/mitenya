import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServer } from "@/lib/supabase/server";

const cancellableStatuses = new Set(["processing", "preparing"]);

export async function POST(
  req: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const supabase = await createSupabaseServer();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderNumber } = params;
    if (!orderNumber) {
      return NextResponse.json({ error: "Order number gerekli" }, { status: 400 });
    }

    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderNumber);

    let query = supabaseAdmin
      .from("orders")
      .select("id, user_id, user_email, status")
      .limit(1);

    query = isUUID ? query.eq("id", orderNumber) : query.eq("order_number", orderNumber);

    const { data: order, error: orderError } = await query.single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Siparis bulunamadi" }, { status: 404 });
    }

    const isOwner =
      order.user_id === user.id ||
      (!!order.user_email && !!user.email && order.user_email === user.email);

    if (!isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (order.status === "cancelled") {
      return NextResponse.json({ error: "Siparis zaten iptal edildi" }, { status: 400 });
    }

    if (!cancellableStatuses.has(order.status)) {
      return NextResponse.json(
        { error: "Bu siparis iptal edilemez" },
        { status: 400 }
      );
    }

    let reason: string | undefined;
    try {
      const body = await req.json();
      if (body?.reason) reason = String(body.reason).slice(0, 200);
    } catch {
      // ignore
    }

    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", order.id);

    if (updateError) {
      console.error("Order cancel update error:", updateError);
      return NextResponse.json({ error: "Siparis iptal edilemedi" }, { status: 500 });
    }

    const description = reason
      ? `Siparis iptal edildi: ${reason}`
      : "Siparis iptal edildi";

    const { error: eventError } = await supabaseAdmin.from("order_events").insert({
      order_id: order.id,
      status: "cancelled",
      description,
    });

    if (eventError) {
      console.error("Order cancel event error:", eventError);
    }

    return NextResponse.json({ success: true, status: "cancelled" });
  } catch (err: any) {
    console.error("Order cancel error:", err);
    return NextResponse.json({ error: "Sunucu hatasi" }, { status: 500 });
  }
}
