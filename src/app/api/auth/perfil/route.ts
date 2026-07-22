import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const correo = String(payload.correo || "").trim().toLowerCase();

    if (!correo) {
      return NextResponse.json(
        { ok: false, error: "El correo es obligatorio." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from("usuario")
      .select(`
        id_usuario,
        tiendas_id_tienda,
        rut,
        nombre,
        apellido,
        correo,
        rol,
        activo
      `)
      .eq("correo", correo)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { ok: false, error: "Usuario no registrado en el sistema." },
        { status: 403 }
      );
    }

    if (data.activo !== "S") {
      return NextResponse.json(
        { ok: false, error: "El usuario se encuentra inactivo." },
        { status: 403 }
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
            : "Error al validar perfil.",
      },
      { status: 500 }
    );
  }
}