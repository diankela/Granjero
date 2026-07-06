import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from("productos")
      .select("*")
      .order("id_producto", { ascending: true });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Error al consultar productos",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const supabase = createSupabaseServerClient();

    const codigo = String(payload.codigo || "").trim().toUpperCase();
    const nombre = String(payload.nombre || "").trim();
    const descripcion = String(payload.descripcion || "").trim();
    const unidad_medida = String(payload.unidad_medida || "").trim().toUpperCase();

    const precio_unitario = Number(payload.precio_unitario || 0);
    const precio_venta = Number(payload.precio_venta || 0);

    if (!codigo || !nombre || !unidad_medida) {
      return NextResponse.json(
        { ok: false, error: "Código, nombre y unidad de medida son obligatorios." },
        { status: 400 }
      );
    }

    if (precio_unitario < 0 || precio_venta < 0) {
      return NextResponse.json(
        { ok: false, error: "Los precios no pueden ser negativos." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("productos")
      .insert({
        codigo,
        nombre,
        descripcion: descripcion || null,
        unidad_medida,
        precio_unitario,
        precio_venta,
        activo: "S",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        message: "Producto creado correctamente",
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
            : "Error al guardar producto",
      },
      { status: 500 }
    );
  }
}