import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from("envasado")
      .select(`
        id_envasado,
        productos_id_producto,
        usuario_id_usuario,
        cantidad_objetivo,
        cantidad_completada,
        estado,
        observacion,
        creado_en,
        iniciado_en,
        finalizado_en,
        productos:productos_id_producto (
          id_producto,
          codigo,
          nombre,
          unidad_medida
        ),
        usuario:usuario_id_usuario (
          id_usuario,
          nombre,
          apellido,
          rol
        )
      `)
      .order("id_envasado", { ascending: false });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 }
      );
    }

    const tareas = (data || []).map((item: any) => {
      const objetivo = Number(item.cantidad_objetivo || 0);
      const completado = Number(item.cantidad_completada || 0);

      const avance =
        objetivo > 0 ? Math.round((completado / objetivo) * 100) : 0;

      return {
        id_envasado: item.id_envasado,
        productos_id_producto: item.productos_id_producto,
        usuario_id_usuario: item.usuario_id_usuario,
        producto: item.productos?.nombre || "Producto no encontrado",
        codigo_producto: item.productos?.codigo || "",
        unidad_medida: item.productos?.unidad_medida || "",
        trabajador: item.usuario
          ? `${item.usuario.nombre} ${item.usuario.apellido}`
          : "Trabajador no encontrado",
        rol: item.usuario?.rol || "",
        cantidad_objetivo: objetivo,
        cantidad_completada: completado,
        avance,
        estado: item.estado,
        observacion: item.observacion,
        creado_en: item.creado_en,
        iniciado_en: item.iniciado_en,
        finalizado_en: item.finalizado_en,
      };
    });

    return NextResponse.json({
      ok: true,
      data: tareas,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Error al consultar tareas de envasado",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const supabase = createSupabaseServerClient();

    const productos_id_producto = Number(payload.productos_id_producto);
    const usuario_id_usuario = Number(payload.usuario_id_usuario);
    const cantidad_objetivo = Number(payload.cantidad_objetivo);
    const observacion = String(payload.observacion || "").trim();

    if (!productos_id_producto) {
      return NextResponse.json(
        { ok: false, error: "Debes seleccionar un producto." },
        { status: 400 }
      );
    }

    if (!usuario_id_usuario) {
      return NextResponse.json(
        { ok: false, error: "Debes seleccionar un trabajador." },
        { status: 400 }
      );
    }

    if (!cantidad_objetivo || cantidad_objetivo <= 0) {
      return NextResponse.json(
        { ok: false, error: "La cantidad objetivo debe ser mayor a cero." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("envasado")
      .insert({
        productos_id_producto,
        usuario_id_usuario,
        cantidad_objetivo,
        cantidad_completada: 0,
        estado: "PENDIENTE",
        observacion: observacion || null,
      })
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
        message: "Tarea de envasado creada correctamente",
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
            : "Error al crear tarea de envasado",
      },
      { status: 500 }
    );
  }
}