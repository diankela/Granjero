import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from("roles")
      .select("id_rol, nombre, activo, creado_en")
      .eq("activo", "S")
      .order("nombre", { ascending: true });

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
            : "Error al consultar roles.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const supabase = createSupabaseServerClient();

    const nombre = String(payload.nombre || "").trim().toUpperCase();

    if (!nombre) {
      return NextResponse.json(
        { ok: false, error: "El nombre del rol es obligatorio." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("roles")
      .insert({
        nombre,
        activo: "S",
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
        message: "Rol creado correctamente.",
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
            : "Error al crear rol.",
      },
      { status: 500 }
    );
  }
}