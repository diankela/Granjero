import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

async function validarAdministrador(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return { autorizado: false, error: "No autorizado." };
  }

  const supabase = createSupabaseServerClient();

  const { data: authData, error: authError } =
    await supabase.auth.getUser(token);

  if (authError || !authData.user?.email) {
    return { autorizado: false, error: "Sesión inválida." };
  }

  const { data: usuario, error: usuarioError } = await supabase
    .from("usuario")
    .select("id_usuario, rol, activo")
    .eq("correo", authData.user.email)
    .eq("activo", "S")
    .single();

  if (usuarioError || !usuario) {
    return { autorizado: false, error: "Usuario no encontrado." };
  }

  if (usuario.rol !== "ADMINISTRADOR") {
    return { autorizado: false, error: "Solo administrador puede acceder a datos RRHH." };
  }

  return { autorizado: true, usuario };
}

export async function GET(
  request: Request,
  context: { params: Promise<{ rut: string }> }
) {
  try {
    const validacion = await validarAdministrador(request);

    if (!validacion.autorizado) {
      return NextResponse.json(
        { ok: false, error: validacion.error },
        { status: 401 }
      );
    }

    const { rut } = await context.params;
    const supabase = createSupabaseServerClient();

    const { data: trabajador, error: trabajadorError } = await supabase
      .from("usuario")
      .select("id_usuario, rut, nombre, apellido")
      .eq("rut", rut)
      .single();

    if (trabajadorError || !trabajador) {
      return NextResponse.json(
        { ok: false, error: "Trabajador no encontrado." },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from("usuario_rrhh")
      .select("*")
      .eq("usuario_id_usuario", trabajador.id_usuario)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      trabajador,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Error al consultar datos RRHH.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ rut: string }> }
) {
  try {
    const validacion = await validarAdministrador(request);

    if (!validacion.autorizado) {
      return NextResponse.json(
        { ok: false, error: validacion.error },
        { status: 401 }
      );
    }

    const { rut } = await context.params;
    const payload = await request.json();
    const supabase = createSupabaseServerClient();

    const { data: trabajador, error: trabajadorError } = await supabase
      .from("usuario")
      .select("id_usuario")
      .eq("rut", rut)
      .single();

    if (trabajadorError || !trabajador) {
      return NextResponse.json(
        { ok: false, error: "Trabajador no encontrado." },
        { status: 404 }
      );
    }

    const datosRrhh = {
      usuario_id_usuario: trabajador.id_usuario,

      nacionalidad: payload.nacionalidad || null,
      fecha_nacimiento: payload.fecha_nacimiento || null,
      estado_civil: payload.estado_civil || null,

      tipo_contrato: payload.tipo_contrato || null,
      jornada_semanal_horas: payload.jornada_semanal_horas
        ? Number(payload.jornada_semanal_horas)
        : null,
      remuneracion_base: payload.remuneracion_base
        ? Number(payload.remuneracion_base)
        : null,
      forma_pago: payload.forma_pago || null,

      banco: payload.banco || null,
      tipo_cuenta: payload.tipo_cuenta || null,
      numero_cuenta: payload.numero_cuenta || null,

      contacto_emergencia_nombre:
        payload.contacto_emergencia_nombre || null,
      contacto_emergencia_telefono:
        payload.contacto_emergencia_telefono || null,
      contacto_emergencia_parentesco:
        payload.contacto_emergencia_parentesco || null,

      observacion_rrhh: payload.observacion_rrhh || null,
      actualizado_en: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("usuario_rrhh")
      .upsert(datosRrhh, {
        onConflict: "usuario_id_usuario",
      })
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
      message: "Datos RRHH guardados correctamente.",
      data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Error al guardar datos RRHH.",
      },
      { status: 500 }
    );
  }
}