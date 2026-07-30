import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const ROLES_CON_TIENDA = ["VENDEDOR"];
const ROLES_CON_CORREO_OBLIGATORIO = ["ADMINISTRADOR", "OPERADOR"];

export async function GET() {
  try {
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from("usuario")
      .select(`
  id_usuario,
  rut,
  nombre,
  apellido,
  telefono,
  correo,
  correo_personal,
  direccion,
  rol,
  cargo,
  horario_inicio,
  horario_fin,
  dias_trabajo,
  fecha_ingreso,
  activo,
  tiendas_id_tienda,
  tiendas:tiendas_id_tienda (
    id_tienda,
    nombre
  )
`)
      .eq("eliminado", false)
      .order("id_usuario", { ascending: true });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 }
      );
    }

    const trabajadores = data.map((trabajador: any) => {
      let tienda = "Sin asignación";

      if (trabajador.tiendas?.nombre) {
        tienda = trabajador.tiendas.nombre;
      }

      return {
        id_usuario: trabajador.id_usuario,
        rut: trabajador.rut,
        nombre: trabajador.nombre,
        apellido: trabajador.apellido,
        telefono: trabajador.telefono,
        correo: trabajador.correo,
        correo_personal: trabajador.correo_personal,
        direccion: trabajador.direccion,
        rol: trabajador.rol,
        cargo: trabajador.cargo,
        horario_inicio: trabajador.horario_inicio,
        horario_fin: trabajador.horario_fin,
        dias_trabajo: trabajador.dias_trabajo,
        fecha_ingreso: trabajador.fecha_ingreso,
        tienda,
        tiendas_id_tienda: trabajador.tiendas_id_tienda,
        estado: trabajador.activo === "S" ? "Activo" : "Inactivo",
      };
    });

    return NextResponse.json({
      ok: true,
      data: trabajadores,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Error al consultar trabajadores",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const supabase = createSupabaseServerClient();

    const rut = String(payload.rut || "").trim().toUpperCase();
    const nombre = String(payload.nombre || "").trim();
    const apellido = String(payload.apellido || "").trim();
    const telefono = String(payload.telefono || "").trim();
    const correo = String(payload.correo || "").trim().toLowerCase();
    const direccion = String(payload.direccion || "").trim();
    const rol = String(payload.rol || "").trim().toUpperCase();
    const correo_personal = String(payload.correo_personal || "")
      .trim()
      .toLowerCase();

    const cargo = String(payload.cargo || "").trim();

    const horario_inicio = String(payload.horario_inicio || "").trim();
    const horario_fin = String(payload.horario_fin || "").trim();

    const dias_trabajo = String(payload.dias_trabajo || "").trim();
    const fecha_ingreso = String(payload.fecha_ingreso || "").trim();

    const activo =
      payload.estado === "Inactivo" || payload.estado === "N" ? "N" : "S";

    let tiendas_id_tienda: number | null = null;

    const asignacionRaw = payload.asignacion ?? payload.tiendas_id_tienda ?? "";
    const asignacionTexto = String(asignacionRaw).trim();

    if (ROLES_CON_TIENDA.includes(rol) && !asignacionTexto) {
      return NextResponse.json(
        { error: "Debe seleccionar una tienda para este rol." },
        { status: 400 }
      );
    }

    if (asignacionTexto) {
      const asignacionNumero = Number(asignacionTexto);

      if (Number.isNaN(asignacionNumero) || asignacionNumero <= 0) {
        return NextResponse.json(
          { error: "Debe seleccionar una tienda válida." },
          { status: 400 }
        );
      }

      const { data: tienda, error: tiendaError } = await supabase
        .from("tiendas")
        .select("id_tienda")
        .eq("id_tienda", asignacionNumero)
        .eq("activa", "S")
        .single();

      if (tiendaError || !tienda) {
        return NextResponse.json(
          { error: "Debe seleccionar una tienda válida." },
          { status: 400 }
        );
      }

      tiendas_id_tienda = tienda.id_tienda;
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

    const filtrosBusqueda = correo
      ? `rut.eq.${rut},correo.eq.${correo}`
      : `rut.eq.${rut}`;

    const { data: trabajadoresExistentes, error: buscarError } = await supabase
      .from("usuario")
      .select("id_usuario, rut, correo, eliminado")
      .or(filtrosBusqueda);

    if (buscarError) {
      return NextResponse.json(
        { error: buscarError.message },
        { status: 400 }
      );
    }

    const trabajadorExistente = trabajadoresExistentes?.[0];

    if (trabajadorExistente && trabajadorExistente.eliminado === false) {
      return NextResponse.json(
        { error: "El trabajador ya existe en Recursos Humanos." },
        { status: 400 }
      );
    }

    if (cargo === "Jefe de tienda" && tiendas_id_tienda) {
      const { data: jefeExistente, error: jefeError } = await supabase
        .from("usuario")
        .select("id_usuario, nombre, apellido")
        .eq("tiendas_id_tienda", tiendas_id_tienda)
        .eq("cargo", "Jefe de tienda")
        .eq("activo", "S")
        .eq("eliminado", false)
        .maybeSingle();

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

    if (trabajadorExistente && trabajadorExistente.eliminado === true) {
      const { data, error } = await supabase
        .from("usuario")
        .update({
          rut,
          nombre,
          apellido,
          telefono,
          correo: correo || null,
          direccion: direccion || null,
          rol,
          activo,
          tiendas_id_tienda,
          eliminado: false,
          correo_personal: correo_personal || null,
          cargo: cargo || null,
          horario_inicio: horario_inicio || null,
          horario_fin: horario_fin || null,
          dias_trabajo: dias_trabajo || null,
          fecha_ingreso: fecha_ingreso || null,
        })
        .eq("id_usuario", trabajadorExistente.id_usuario)
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: "Trabajador restaurado correctamente",
          data,
        },
        { status: 200 }
      );
    }



    const { data, error } = await supabase
      .from("usuario")
      .insert({
        rut,
        nombre,
        apellido,
        telefono,
        correo: correo || null,
        direccion: direccion || null,
        rol,
        activo,
        tiendas_id_tienda,
        correo_personal: correo_personal || null,
        cargo: cargo || null,
        horario_inicio: horario_inicio || null,
        horario_fin: horario_fin || null,
        dias_trabajo: dias_trabajo || null,
        fecha_ingreso: fecha_ingreso || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Trabajador guardado correctamente",
        data,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error al guardar el trabajador",
      },
      { status: 500 }
    );
  }
}
