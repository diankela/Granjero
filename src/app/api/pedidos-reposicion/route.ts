import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    const usuario_id_usuario = Number(payload.usuario_id_usuario);
    const tiendas_id_tienda = Number(payload.tiendas_id_tienda);
    const lioren_producto_id = Number(payload.lioren_producto_id);
    const producto_codigo = String(payload.producto_codigo || "").trim();
    const producto_nombre = String(payload.producto_nombre || "").trim();
    const producto_unidad = String(payload.producto_unidad || "").trim();
    const cantidad = Number(payload.cantidad);
    const fecha = String(payload.fecha || "").trim();

    if (!usuario_id_usuario) {
      return NextResponse.json(
        { ok: false, error: "El usuario es obligatorio." },
        { status: 400 }
      );
    }

    if (!tiendas_id_tienda) {
      return NextResponse.json(
        { ok: false, error: "La tienda es obligatoria." },
        { status: 400 }
      );
    }

    if (!lioren_producto_id) {
      return NextResponse.json(
        { ok: false, error: "El producto de Lioren es obligatorio." },
        { status: 400 }
      );
    }

    if (!producto_codigo) {
      return NextResponse.json(
        { ok: false, error: "El código del producto es obligatorio." },
        { status: 400 }
      );
    }

    if (!producto_nombre) {
      return NextResponse.json(
        { ok: false, error: "El nombre del producto es obligatorio." },
        { status: 400 }
      );
    }

    if (!cantidad || cantidad <= 0) {
      return NextResponse.json(
        { ok: false, error: "La cantidad debe ser mayor a 0." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();

    const pedido: Record<string, unknown> = {
      usuario_id_usuario,
      tiendas_id_tienda,
      lioren_producto_id,
      producto_codigo,
      producto_nombre,
      producto_unidad,
      cantidad,
      estado: "PENDIENTE",
    };

    if (fecha) {
      pedido.fecha = fecha;
    }

    const { data, error } = await supabase
      .from("pedidos_reposicion")
      .insert(pedido)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        message: "Pedido de reposición creado correctamente.",
        data,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Error al crear pedido de reposición.",
      },
      { status: 500 }
    );
  }
}