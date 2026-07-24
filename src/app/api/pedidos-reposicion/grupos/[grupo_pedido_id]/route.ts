import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const ESTADOS_PERMITIDOS = [
  "NO_REVISADO",
  "EN_PREPARACION",
  "EN_CAMINO",
  "ENTREGADO",
  "RECHAZADO",
];

export async function PATCH(
  request: Request,
  context: { params: Promise<{ grupo_pedido_id: string }> }
) {
  try {
    const { grupo_pedido_id } = await context.params;
    const payload = await request.json();

    const estado = String(payload.estado || "").trim().toUpperCase();
    const comentario_operador = String(
      payload.comentario_operador || ""
    ).trim();

    if (!grupo_pedido_id) {
      return NextResponse.json(
        { ok: false, error: "El grupo del pedido es obligatorio." },
        { status: 400 }
      );
    }

    if (!estado) {
      return NextResponse.json(
        { ok: false, error: "El estado es obligatorio." },
        { status: 400 }
      );
    }

    if (!ESTADOS_PERMITIDOS.includes(estado)) {
      return NextResponse.json(
        { ok: false, error: "El estado no es válido." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from("pedidos_reposicion_grupos")
      .update({
        estado,
        comentario_operador: comentario_operador || null,
        actualizado_en: new Date().toISOString(),
      })
      .eq("grupo_pedido_id", grupo_pedido_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Pedido actualizado correctamente.",
      data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Error al actualizar pedido.",
      },
      { status: 500 }
    );
  }
}