import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const ROLES_CON_TIENDA = ["VENDEDOR", "ENCARGADO_TIENDA"];

async function resolveTiendaId(supabase: any, tiendaNombre?: string | null) {
  const nombre = String(tiendaNombre || "").trim();

  if (!nombre || nombre === "Sin asignación" || nombre === "Bodega Central") {
    return null;
  }

  const { data, error } = await supabase
    .from("tiendas")
    .select("id_tienda")
    .eq("nombre", nombre)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.id_tienda ?? null;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ rut: string }> }
) {
  try {
    const payload = await request.json();
    const supabase = createSupabaseServerClient();
    const { rut: routeRut } = await params;

    const id_usuario = payload.id_usuario ? Number(payload.id_usuario) : null;
    const rut = String(payload.rut || routeRut || "").trim().toUpperCase();
    const nombre = String(payload.nombre || "").trim();
    const apellido = String(payload.apellido || "").trim();
    const telefono = String(payload.telefono || "").trim();
    const correo = String(payload.correo || "").trim().toLowerCase();
    const direccion = String(payload.direccion || "").trim();
    const rol = String(payload.rol || "").trim().toUpperCase();
    const activo = payload.estado === "Inactivo" || payload.estado === "N" ? "N" : "S";

    let tiendas_id_tienda: number | null = null;

    if (ROLES_CON_TIENDA.includes(rol)) {
      const tiendaNombre = payload.asignacion ?? payload.tienda;
      tiendas_id_tienda = await resolveTiendaId(supabase, tiendaNombre);

      if (!tiendas_id_tienda) {
        return NextResponse.json(
          { error: "Debe seleccionar una tienda válida para este rol." },
          { status: 400 }
        );
      }
    }

    if (!rut || rut.length > 9) {
      return NextResponse.json(
        { error: "El RUT es obligatorio y debe tener máximo 9 caracteres." },
        { status: 400 }
      );
    }

    if (!nombre || !apellido || !telefono || !correo || !rol) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios." },
        { status: 400 }
      );
    }

    if (!/^\d{9}$/.test(telefono)) {
      return NextResponse.json(
        { error: "El teléfono debe tener exactamente 9 dígitos." },
        { status: 400 }
      );
    }

    const updatePayload = {
      rut,
      nombre,
      apellido,
      telefono,
      correo,
      direccion: direccion || null,
      rol,
      activo,
      tiendas_id_tienda,
    };

    let query = supabase.from("usuario").update(updatePayload);

    if (id_usuario) {
      query = query.eq("id_usuario", id_usuario);
    } else {
      query = query.eq("rut", rut);
    }

    const { data, error } = await query.select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Trabajador actualizado correctamente",
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error al actualizar el trabajador",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ rut: string }> }
) {
  try {
    const { rut } = await context.params;

    if (!rut) {
      return NextResponse.json(
        { ok: false, error: "El RUT es obligatorio." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from("usuario")
      .update({
        eliminado: true,
        activo: "N",
      })
      .eq("rut", rut)
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
      message: "Trabajador eliminado correctamente.",
      data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Error al eliminar trabajador.",
      },
      { status: 500 }
    );
  }
}
