import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { randomUUID } from "crypto";


type ProductoPedidoPayload = {
  lioren_producto_id: number | string | null;
  producto_codigo: string;
  producto_nombre: string;
  producto_unidad: string;
  cantidad: number | string;
};


export async function POST(request: Request) {
  try {
    const payload = await request.json();

    const usuario_id_usuario = Number(payload.usuario_id_usuario);
    const tiendas_id_tienda = Number(payload.tiendas_id_tienda);
    const enviado_por_rol = String(payload.enviado_por_rol || "").trim().toUpperCase();

    const productos: ProductoPedidoPayload[] = Array.isArray(payload.productos)
      ? payload.productos
      : payload.lioren_producto_id
        ? [
            {
              lioren_producto_id: payload.lioren_producto_id,
              producto_codigo: payload.producto_codigo,
              producto_nombre: payload.producto_nombre,
              producto_unidad: payload.producto_unidad,
              cantidad: payload.cantidad,
            },
          ]
        : [];

    if (!usuario_id_usuario) {
      return NextResponse.json(
        { ok: false, error: "El usuario es obligatorio." },
        { status: 400 }
      );
    }

    if (!tiendas_id_tienda) {
      return NextResponse.json(
        { ok: false, error: "La tienda es obligatoria." },
        { status: 400 }
      );
    }

    if (productos.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Debes agregar al menos un producto a la lista." },
        { status: 400 }
      );
    }

    const ahoraChile = new Date();

    const partesChile = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Santiago",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }).formatToParts(ahoraChile);

    const getParte = (tipo: string) =>
      partesChile.find((parte) => parte.type === tipo)?.value || "";

    const fechaPedido = `${getParte("year")}-${getParte("month")}-${getParte("day")}`;
    const horaPedido = `${getParte("hour")}:${getParte("minute")}:${getParte("second")}`;

    const hora = Number(getParte("hour"));
    const minuto = Number(getParte("minute"));
    const minutosActuales = hora * 60 + minuto;

    const inicioPedidos = 9 * 60;
    const finPedidos = 15 * 60;

    if (minutosActuales < inicioPedidos || minutosActuales > finPedidos) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Los pedidos de reposición solo se pueden enviar entre 09:00 y 15:00 hrs.",
        },
        { status: 403 }
      );
    }

    const grupo_pedido_id = randomUUID();

    const registros = productos.map((producto) => {
      const liorenProductoRaw = producto.lioren_producto_id;

      const lioren_producto_id =
        liorenProductoRaw === null ||
        liorenProductoRaw === undefined ||
        liorenProductoRaw === ""
          ? null
          : Number(liorenProductoRaw);

      const producto_codigo = String(producto.producto_codigo || "").trim();
      const producto_nombre = String(producto.producto_nombre || "").trim();
      const producto_unidad = String(producto.producto_unidad || "").trim();
      const cantidad = Number(producto.cantidad);

      if (lioren_producto_id !== null && Number.isNaN(lioren_producto_id)) {
        throw new Error("Uno de los productos tiene un ID de Lioren inválido.");
      }

      if (!producto_codigo) {
        throw new Error("Uno de los productos no tiene código.");
      }

      if (!producto_nombre) {
        throw new Error("Uno de los productos no tiene nombre.");
      }

      if (!cantidad || cantidad <= 0) {
        throw new Error("Todas las cantidades deben ser mayores a 0.");
      }

      return {
        usuario_id_usuario,
        tiendas_id_tienda,
        lioren_producto_id,
        producto_codigo,
        producto_nombre,
        producto_unidad,
        cantidad,
        fecha: fechaPedido,
        hora_pedido: horaPedido,
        grupo_pedido_id,
        enviado_por_rol: enviado_por_rol || null,
        estado: "NO_REVISADO",
      };
    });

    const supabase = createSupabaseServerClient();

    const { error: grupoError } = await supabase
      .from("pedidos_reposicion_grupos")
      .insert({
        grupo_pedido_id,
        usuario_id_usuario,
        tiendas_id_tienda,
        fecha: fechaPedido,
        hora_pedido: horaPedido,
        estado: "NO_REVISADO",
      });

    if (grupoError) {
      return NextResponse.json(
        { ok: false, error: grupoError.message },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("pedidos_reposicion")
      .insert(registros)
      .select();

    if (error) {
      await supabase
        .from("pedidos_reposicion_grupos")
        .delete()
        .eq("grupo_pedido_id", grupo_pedido_id);

      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        message: "Lista de reposición enviada correctamente.",
        grupo_pedido_id,
        fecha: fechaPedido,
        hora: horaPedido,
        total_productos: registros.length,
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
            : "Error al crear pedido de reposición.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from("pedidos_reposicion")
      .select(`
        id_pedido,
        usuario_id_usuario,
        tiendas_id_tienda,
        lioren_producto_id,
        producto_codigo,
        producto_nombre,
        producto_unidad,
        cantidad,
        fecha,
        estado,
        creado_en,
        usuario (
          nombre,
          apellido,
          correo
        ),
        tiendas (
          nombre
        )
      `)
      .order("creado_en", { ascending: false });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 }
      );
    }

    const pedidos = (data || []).map((pedido) => {
    const usuario = Array.isArray(pedido.usuario)
      ? pedido.usuario[0]
      : pedido.usuario;

    const tienda = Array.isArray(pedido.tiendas)
      ? pedido.tiendas[0]
      : pedido.tiendas;

    return {
      id_pedido: pedido.id_pedido,
      usuario_id_usuario: pedido.usuario_id_usuario,
      tiendas_id_tienda: pedido.tiendas_id_tienda,
      lioren_producto_id: pedido.lioren_producto_id,
      producto_codigo: pedido.producto_codigo,
      producto_nombre: pedido.producto_nombre,
      producto_unidad: pedido.producto_unidad,
      cantidad: pedido.cantidad,
      fecha: pedido.fecha,
      estado: pedido.estado,
      creado_en: pedido.creado_en,
      vendedor: usuario
        ? `${usuario.nombre} ${usuario.apellido}`
        : "Sin vendedor",
      correo_vendedor: usuario?.correo || "",
      tienda: tienda?.nombre || "Sin tienda",
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
            : "Error al consultar pedidos de reposición.",
      },
      { status: 500 }
    );
  }
}