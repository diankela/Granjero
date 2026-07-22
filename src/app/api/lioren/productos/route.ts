import { NextResponse } from "next/server";

type LiorenProducto = {
  id: number;
  nombre: string;
  codigo: string;
  unidad?: string;
  activo?: number;
  descripcion?: string | null;
  preciocompraneto?: number;
  precioventabruto?: number;
};

export async function GET() {
  try {
    const baseUrl = process.env.LIOREN_API_BASE_URL;
    const token = process.env.LIOREN_API_TOKEN;
    const productosEndpoint = process.env.LIOREN_PRODUCTOS_ENDPOINT;

    if (!baseUrl || !token || !productosEndpoint) {
      return NextResponse.json(
        {
          ok: false,
          error: "Faltan variables de entorno de Lioren.",
        },
        { status: 500 }
      );
    }

    const url = `${baseUrl}${productosEndpoint}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "Error al consultar productos en Lioren.",
          detalle: result,
        },
        { status: response.status }
      );
    }

    const productosRaw = Array.isArray(result)
      ? result
      : result.data || result.productos || [];

    const productos = productosRaw.map((producto: LiorenProducto) => ({
      id_producto: producto.id,
      codigo: producto.codigo,
      nombre: producto.nombre,
      unidad_medida: producto.unidad || "Unidad",
      activo: producto.activo,
      descripcion: producto.descripcion || "",
      precio_compra_neto: producto.preciocompraneto || 0,
      precio_venta_bruto: producto.precioventabruto || 0,
    }));

    return NextResponse.json({
      ok: true,
      data: productos,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Error interno al consultar productos de Lioren.",
      },
      { status: 500 }
    );
  }
}