import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const ROLES_CON_TIENDA = ["VENDEDOR", "ENCARGADO_TIENDA"];

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
        direccion,
        rol,
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
      } else if (
        trabajador.rol === "BODEGA" ||
        trabajador.rol === "ENVASADO"
      ) {
        tienda = "Bodega Central";
      }

      return {
        id_usuario: trabajador.id_usuario,
        rut: trabajador.rut,
        nombre: trabajador.nombre,
        apellido: trabajador.apellido,
        telefono: trabajador.telefono,
        correo: trabajador.correo,
        direccion: trabajador.direccion,
        rol: trabajador.rol,
        tienda,
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

    const activo =
      payload.estado === "Inactivo" || payload.estado === "N" ? "N" : "S";

    let tiendas_id_tienda: number | null = null;

    if (ROLES_CON_TIENDA.includes(rol)) {
      if (!payload.asignacion) {
        return NextResponse.json(
          { error: "Debe seleccionar una tienda para este rol." },
          { status: 400 }
        );
      }

      tiendas_id_tienda = Number(payload.asignacion);
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

    const { data: trabajadoresExistentes, error: buscarError } = await supabase
      .from("usuario")
      .select("id_usuario, rut, correo, eliminado")
      .or(`rut.eq.${rut},correo.eq.${correo}`);

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

    if (trabajadorExistente && trabajadorExistente.eliminado === true) {
      const { data, error } = await supabase
        .from("usuario")
        .update({
          rut,
          nombre,
          apellido,
          telefono,
          correo,
          direccion: direccion || null,
          rol,
          activo,
          tiendas_id_tienda,
          eliminado: false,
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
        correo,
        direccion: direccion || null,
        rol,
        activo,
        tiendas_id_tienda,
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
