import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  try {
    const supabase = createSupabaseServerClient();

    const { searchParams } = new URL(request.url);
    const q = String(searchParams.get("q") || "")
      .trim()
      .replaceAll(",", "")
      .replaceAll("%", "");

    let query = supabase
      .from("lioren_productos_cache")
      .select(`
        lioren_producto_id,
        codigo,
        nombre,
        unidad_medida,
        activo,
        descripcion,
        precio_compra_neto,
        precio_venta_bruto,
        actualizado_en
      `)
      .eq("activo", 1)
      .order("nombre", { ascending: true })
      .limit(2000);

    if (q) {
      query = query.or(`codigo.ilike.%${q}%,nombre.ilike.%${q}%`);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 }
      );
    }

    const productos = (data || []).map((producto) => ({
      id_producto: producto.lioren_producto_id,
      codigo: producto.codigo,
      nombre: producto.nombre,
      unidad_medida: producto.unidad_medida || "Unidad",
      activo: producto.activo,
      descripcion: producto.descripcion || "",
      precio_compra_neto: producto.precio_compra_neto || 0,
      precio_venta_bruto: producto.precio_venta_bruto || 0,
      actualizado_en: producto.actualizado_en,
    }));

    return NextResponse.json({
      ok: true,
      total: productos.length,
      data: productos,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Error al consultar productos desde caché.",
      },
      { status: 500 }
    );
  }
}