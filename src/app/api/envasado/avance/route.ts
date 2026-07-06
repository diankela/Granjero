import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const supabase = createSupabaseServerClient();

    const envasado_id_envasado = Number(payload.envasado_id_envasado);
    const usuario_id_usuario = Number(payload.usuario_id_usuario);
    const cantidad_agregada = Number(payload.cantidad_agregada);
    const observacion = String(payload.observacion || "").trim();

    if (!envasado_id_envasado) {
      return NextResponse.json(
        { ok: false, error: "Debes seleccionar una tarea de envasado." },
        { status: 400 }
      );
    }

    if (!usuario_id_usuario) {
      return NextResponse.json(
        { ok: false, error: "Debes seleccionar un trabajador." },
        { status: 400 }
      );
    }

    if (!cantidad_agregada || cantidad_agregada <= 0) {
      return NextResponse.json(
        { ok: false, error: "La cantidad agregada debe ser mayor a cero." },
        { status: 400 }
      );
    }

    const { data: tarea, error: tareaError } = await supabase
      .from("envasado")
      .select(`
        id_envasado,
        usuario_id_usuario,
        cantidad_objetivo,
        cantidad_completada,
        estado,
        iniciado_en
      `)
      .eq("id_envasado", envasado_id_envasado)
      .single();

    if (tareaError || !tarea) {
      return NextResponse.json(
        { ok: false, error: "No se encontró la tarea de envasado." },
        { status: 404 }
      );
    }

    if (tarea.estado === "FINALIZADA") {
      return NextResponse.json(
        { ok: false, error: "Esta tarea ya está finalizada." },
        { status: 400 }
      );
    }

    if (tarea.estado === "CANCELADA") {
      return NextResponse.json(
        { ok: false, error: "Esta tarea está cancelada." },
        { status: 400 }
      );
    }

    if (Number(tarea.usuario_id_usuario) !== usuario_id_usuario) {
      return NextResponse.json(
        { ok: false, error: "El trabajador no corresponde a esta tarea." },
        { status: 400 }
      );
    }

    const cantidadObjetivo = Number(tarea.cantidad_objetivo);
    const cantidadActual = Number(tarea.cantidad_completada);
    const nuevaCantidad = cantidadActual + cantidad_agregada;

    if (nuevaCantidad > cantidadObjetivo) {
      return NextResponse.json(
        {
          ok: false,
          error: `El avance supera la cantidad objetivo. Faltan solo ${
            cantidadObjetivo - cantidadActual
          } unidades.`,
        },
        { status: 400 }
      );
    }

    const nuevoEstado =
      nuevaCantidad === cantidadObjetivo ? "FINALIZADA" : "EN_PROCESO";

    const ahora = new Date().toISOString();

    const { data: avance, error: avanceError } = await supabase
      .from("envasado_avance")
      .insert({
        envasado_id_envasado,
        usuario_id_usuario,
        cantidad_agregada,
        observacion: observacion || null,
      })
      .select()
      .single();

    if (avanceError) {
      return NextResponse.json(
        { ok: false, error: avanceError.message },
        { status: 400 }
      );
    }

    const { data: tareaActualizada, error: updateError } = await supabase
      .from("envasado")
      .update({
        cantidad_completada: nuevaCantidad,
        estado: nuevoEstado,
        iniciado_en: tarea.iniciado_en || ahora,
        finalizado_en: nuevoEstado === "FINALIZADA" ? ahora : null,
      })
      .eq("id_envasado", envasado_id_envasado)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { ok: false, error: updateError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Avance registrado correctamente",
      data: {
        avance,
        tarea: tareaActualizada,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Error al registrar avance",
      },
      { status: 500 }
    );
  }
}