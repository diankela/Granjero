import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: Request) {

  
    
  try {
    const payload = await request.json();

    const correo = String(payload.correo || "").trim().toLowerCase();

    if (!correo) {
      return NextResponse.json(
        {
          ok: false,
          error: "El correo es obligatorio.",
        },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();

    const { data: trabajador, error: trabajadorError } = await supabase
  .from("usuario")
  .select("id_usuario, correo, nombre, apellido, rol, activo")
  .eq("correo", correo)
  .single();

if (trabajadorError || !trabajador) {
  return NextResponse.json(
    {
      ok: false,
      error: "El trabajador no existe en Recursos Humanos.",
    },
    { status: 404 }
  );
}

if (trabajador.activo !== "S") {
  return NextResponse.json(
    {
      ok: false,
      error: "El trabajador está inactivo y no puede recibir acceso.",
    },
    { status: 400 }
  );
}

    const { data, error } = await supabase.auth.admin.inviteUserByEmail(
      correo
    );

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Invitación enviada correctamente.",
      data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Error al enviar la invitación.",
      },
      { status: 500 }
    );
  }
}