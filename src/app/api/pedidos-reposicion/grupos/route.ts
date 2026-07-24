import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type Relacion<T> = T | T[] | null;

type UsuarioRelacion = {
  nombre: string;
  apellido: string;
  correo: string;
};

type TiendaRelacion = {
  nombre: string;
};

type GrupoPedidoRaw = {
  grupo_pedido_id: string;
  usuario_id_usuario: number;
  tiendas_id_tienda: number;
  fecha: string;
  hora_pedido: string;
  estado: string;
  comentario_operador: string | null;
  creado_en: string;
  actualizado_en: string;
  usuario: Relacion<UsuarioRelacion>;
  tiendas: Relacion<TiendaRelacion>;
};

type ProductoPedidoRaw = {
  id_pedido: number;
  grupo_pedido_id: string;
  producto_codigo: string;
  producto_nombre: string;
  producto_unidad: string;
  cantidad: number;
  estado: string;
};

function obtenerPrimero<T>(valor: Relacion<T>) {
  if (Array.isArray(valor)) {
    return valor[0] || null;
  }

  return valor;
}

export async function GET() {
  try {
    const supabase = createSupabaseServerClient();

    const { data: gruposData, error: gruposError } = await supabase
      .from("pedidos_reposicion_grupos")
      .select(`
        grupo_pedido_id,
        usuario_id_usuario,
        tiendas_id_tienda,
        fecha,
        hora_pedido,
        estado,
        comentario_operador,
        creado_en,
        actualizado_en,
        usuario:usuario_id_usuario (
          nombre,
          apellido,
          correo
        ),
        tiendas:tiendas_id_tienda (
          nombre
        )
      `)
      .order("creado_en", { ascending: false });

    if (gruposError) {
      return NextResponse.json(
        { ok: false, error: gruposError.message },
        { status: 400 }
      );
    }

    const grupos = (gruposData || []) as GrupoPedidoRaw[];

    const gruposIds = grupos.map((grupo) => grupo.grupo_pedido_id);

    if (gruposIds.length === 0) {
      return NextResponse.json({
        ok: true,
        data: [],
      });
    }

    const { data: productosData, error: productosError } = await supabase
      .from("pedidos_reposicion")
      .select(`
        id_pedido,
        grupo_pedido_id,
        producto_codigo,
        producto_nombre,
        producto_unidad,
        cantidad,
        estado
      `)
      .in("grupo_pedido_id", gruposIds)
      .order("id_pedido", { ascending: true });

    if (productosError) {
      return NextResponse.json(
        { ok: false, error: productosError.message },
        { status: 400 }
      );
    }

    const productos = (productosData || []) as ProductoPedidoRaw[];

    const pedidos = grupos.map((grupo) => {
      const usuario = obtenerPrimero(grupo.usuario);
      const tienda = obtenerPrimero(grupo.tiendas);

      const productosDelGrupo = productos.filter(
        (producto) => producto.grupo_pedido_id === grupo.grupo_pedido_id
      );

      return {
        grupo_pedido_id: grupo.grupo_pedido_id,
        usuario_id_usuario: grupo.usuario_id_usuario,
        tiendas_id_tienda: grupo.tiendas_id_tienda,
        fecha: grupo.fecha,
        hora_pedido: grupo.hora_pedido,
        estado: grupo.estado,
        comentario_operador: grupo.comentario_operador || "",
        creado_en: grupo.creado_en,
        actualizado_en: grupo.actualizado_en,
        vendedor: usuario
          ? `${usuario.nombre} ${usuario.apellido}`
          : "Sin vendedor",
        correo_vendedor: usuario?.correo || "",
        tienda: tienda?.nombre || "Sin tienda",
        productos: productosDelGrupo.map((producto) => ({
          id_pedido: producto.id_pedido,
          producto_codigo: producto.producto_codigo,
          producto_nombre: producto.producto_nombre,
          producto_unidad: producto.producto_unidad,
          cantidad: producto.cantidad,
          estado: producto.estado,
        })),
      };
    });

    return NextResponse.json({
      ok: true,
      data: pedidos,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Error al consultar grupos de pedidos.",
      },
      { status: 500 }
    );
  }
}