import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/createSupabaseServerClient";

export async function GET() {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
  .from("tiendas")
  .select("*");

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          message: "Error consultando Supabase",
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Conexión exitosa con Supabase",
      data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: "Error interno al conectar con Supabase",
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
