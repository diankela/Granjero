import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type Tienda = {
  id_tienda: number;
  nombre: string;
  direccion: string;
  telefono: string;
  activa: string;
};

type Trabajador = {
  id_usuario: number;
  tiendas_id_tienda: number | null;
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  rol: string;
  cargo: string | null;
  horario_inicio: string | null;
  horario_fin: string | null;
  dias_trabajo: string | null;
  activo: string;
  eliminado: boolean;
};

function normalizarTexto(valor: string | null | undefined) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
}

function esJefeDeTienda(trabajador: Trabajador) {
  const cargo = normalizarTexto(trabajador.cargo);

  return cargo.includes("JEFE") && cargo.includes("TIENDA");
}

function esTrabajadorVisibleEnTienda(trabajador: Trabajador) {
  const cargo = normalizarTexto(trabajador.cargo);
  const rol = normalizarTexto(trabajador.rol);

  if (rol !== "VENDEDOR") {
    return false;
  }

  return cargo === "JEFE DE TIENDA" || cargo === "APOYO";
}

function formatearNombreTrabajador(trabajador: Trabajador) {
  return `${trabajador.nombre} ${trabajador.apellido}`.trim();
}

function formatearHorario(trabajador: Trabajador) {
  if (!trabajador.horario_inicio && !trabajador.horario_fin) {
    return "Horario por definir";
  }

  const inicio = trabajador.horario_inicio
    ? trabajador.horario_inicio.slice(0, 5)
    : "--:--";

  const fin = trabajador.horario_fin
    ? trabajador.horario_fin.slice(0, 5)
    : "--:--";

  return `${inicio} - ${fin} hrs`;
}

export async function GET() {
  try {
    const supabase = createSupabaseServerClient();

    const { data: tiendas, error: tiendasError } = await supabase
      .from("tiendas")
      .select("id_tienda, nombre, direccion, telefono, activa")
      .eq("activa", "S")
      .order("id_tienda", { ascending: true });

    if (tiendasError) {
      return NextResponse.json(
        { ok: false, error: tiendasError.message },
        { status: 400 }
      );
    }

    const { data: trabajadores, error: trabajadoresError } = await supabase
      .from("usuario")
      .select(`
    id_usuario,
    tiendas_id_tienda,
    nombre,
    apellido,
    telefono,
    correo,
    rol,
    cargo,
    horario_inicio,
    horario_fin,
    dias_trabajo,
    activo,
    eliminado
  `)
      .eq("activo", "S")
      .eq("eliminado", false)
      .eq("rol", "VENDEDOR")
      .not("tiendas_id_tienda", "is", null)
      .order("nombre", { ascending: true });

    if (trabajadoresError) {
      return NextResponse.json(
        { ok: false, error: trabajadoresError.message },
        { status: 400 }
      );
    }

    const resumen = (tiendas || []).map((tienda: Tienda) => {
      const trabajadoresTienda = (trabajadores || []).filter(
        (trabajador: Trabajador) =>
          trabajador.tiendas_id_tienda === tienda.id_tienda &&
          esTrabajadorVisibleEnTienda(trabajador)
      );

      const jefe = trabajadoresTienda.find(esJefeDeTienda);

      const turnos = trabajadoresTienda
        .sort((a: Trabajador, b: Trabajador) => {
          const aEsJefe = esJefeDeTienda(a) ? 0 : 1;
          const bEsJefe = esJefeDeTienda(b) ? 0 : 1;

          if (aEsJefe !== bEsJefe) return aEsJefe - bEsJefe;

          return a.nombre.localeCompare(b.nombre);
        })
        .map((trabajador: Trabajador) => ({
          id_usuario: trabajador.id_usuario,
          nombre: formatearNombreTrabajador(trabajador),
          nombre_completo: `${trabajador.nombre} ${trabajador.apellido}`,
          cargo: trabajador.cargo || "Sin cargo definido",
          rol: trabajador.rol,
          horario: formatearHorario(trabajador),
          dias_trabajo: trabajador.dias_trabajo || "Días por definir",
        }));

      return {
        id_tienda: tienda.id_tienda,
        nombre: tienda.nombre,
        direccion: tienda.direccion,
        telefono: tienda.telefono,
        jefe_local: jefe
          ? formatearNombreTrabajador(jefe)
          : "Por definir",
        jefe_local_completo: jefe
          ? `${jefe.nombre} ${jefe.apellido}`
          : null,
        total_trabajadores: trabajadoresTienda.length,
        turnos,
      };
    });

    return NextResponse.json({
      ok: true,
      data: resumen,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Error al cargar resumen de tiendas.",
      },
      { status: 500 }
    );
  }
}