import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const ROLES_CON_TIENDA = ["VENDEDOR"];
const ROLES_CON_CORREO_OBLIGATORIO = ["ADMINISTRADOR", "OPERADOR"];

async function resolveTiendaId(supabase: any, asignacion?: string | number | null) {
  const valor = String(asignacion || "").trim();

  if (!valor || valor === "Sin asignación" || valor === "Bodega Central") {
    return null;
  }

  const valorNumerico = Number(valor);

  if (!Number.isNaN(valorNumerico) && valorNumerico > 0) {
    const { data, error } = await supabase
      .from("tiendas")
      .select("id_tienda")
      .eq("id_tienda", valorNumerico)
      .eq("activa", "S")
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data?.id_tienda ?? null;
  }

  const { data, error } = await supabase
    .from("tiendas")
    .select("id_tienda")
    .eq("nombre", valor)
    .eq("activa", "S")
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
    const correo_personal = String(payload.correo_personal || "").trim().toLowerCase();
    const cargo = String(payload.cargo || "").trim();
    const horario_inicio = String(payload.horario_inicio || "").trim();
    const horario_fin = String(payload.horario_fin || "").trim();
    const dias_trabajo = String(payload.dias_trabajo || "").trim();
    const fecha_ingreso = String(payload.fecha_ingreso || "").trim();


    let tiendas_id_tienda: number | null = null;

    const asignacionRaw = payload.asignacion ?? payload.tiendas_id_tienda ?? "";
    const asignacionTexto = String(asignacionRaw).trim();

    if (ROLES_CON_TIENDA.includes(rol) && !asignacionTexto) {
      return NextResponse.json(
        { error: "Debe seleccionar una tienda válida para este rol." },
        { status: 400 }
      );
    }

    if (asignacionTexto) {
      tiendas_id_tienda = await resolveTiendaId(supabase, asignacionTexto);

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

    if (!nombre || !apellido || !telefono || !rol) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios." },
        { status: 400 }
      );
    }

    if (ROLES_CON_CORREO_OBLIGATORIO.includes(rol) && !correo) {
      return NextResponse.json(
        { error: "Este rol necesita un correo de acceso al sistema." },
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
      correo: correo || null,
      correo_personal: correo_personal || null,
      direccion: direccion || null,
      rol,
      cargo: cargo || null,
      horario_inicio: horario_inicio || null,
      horario_fin: horario_fin || null,
      dias_trabajo: dias_trabajo || null,
      fecha_ingreso: fecha_ingreso || null,
      activo,
      tiendas_id_tienda,
    };

    if (correo) {
      const { data: correoExistente, error: correoError } = await supabase
        .from("usuario")
        .select("id_usuario, rut, correo")
        .eq("correo", correo)
        .neq("rut", rut)
        .eq("eliminado", false)
        .maybeSingle();

      if (correoError) {
        return NextResponse.json(
          { error: correoError.message },
          { status: 400 }
        );
      }

      if (correoExistente) {
        return NextResponse.json(
          { error: "Este correo ya está asignado a otro trabajador." },
          { status: 400 }
        );
      }
    }

    const aplicarExclusionTrabajadorActual = (query: any) => {
      if (id_usuario) {
        return query.neq("id_usuario", id_usuario);
      }

      return query.neq("rut", routeRut);
    };

    if (cargo === "Jefe de tienda" && tiendas_id_tienda) {
      let queryJefe = supabase
        .from("usuario")
        .select("id_usuario, nombre, apellido")
        .eq("tiendas_id_tienda", tiendas_id_tienda)
        .eq("cargo", "Jefe de tienda")
        .eq("activo", "S")
        .eq("eliminado", false);

      queryJefe = aplicarExclusionTrabajadorActual(queryJefe);

      const { data: jefeExistente, error: jefeError } =
        await queryJefe.maybeSingle();

      if (jefeError) {
        return NextResponse.json(
          { error: jefeError.message },
          { status: 400 }
        );
      }

      if (jefeExistente) {
        return NextResponse.json(
          {
            error: `Esta tienda ya tiene un jefe asignado: ${jefeExistente.nombre} ${jefeExistente.apellido}.`,
          },
          { status: 400 }
        );
      }
    }

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
