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

export async function GET(request: Request) {
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

    const productosAcumulados: LiorenProducto[] = [];
    let paginaActual = 1;
    let ultimaPagina = 1;


    const { searchParams } = new URL(request.url);
    const debug = searchParams.get("debug") === "1";
    const busqueda = searchParams.get("q") || "";

    do {
      const url = new URL(`${baseUrl}${productosEndpoint}`);
      
      if (busqueda) {
        url.searchParams.set("q", busqueda);
        url.searchParams.set("buscar", busqueda);
        url.searchParams.set("search", busqueda);
      }

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (debug) {
        return NextResponse.json({
          ok: true,
          debug: true,
          paginaConsultada: paginaActual,
          responseOk: response.ok,
          status: response.status,
          headersRespuesta: Object.fromEntries(response.headers.entries()),
          resultEsArray: Array.isArray(result),
          clavesRespuesta: Array.isArray(result) ? [] : Object.keys(result || {}),
          totalRecibido: Array.isArray(result)
            ? result.length
            : Array.isArray(result.data)
              ? result.data.length
              : Array.isArray(result.productos)
                ? result.productos.length
                : null,
          ejemploRespuesta: result,
        });
      }


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

      const productosPagina = Array.isArray(result)
        ? result
        : result.data || result.productos || [];

      productosAcumulados.push(...productosPagina);

      ultimaPagina = Number(
        result.last_page ||
          result.meta?.last_page ||
          result.pagination?.last_page ||
          paginaActual
      );

      paginaActual++;
    } while (paginaActual <= ultimaPagina && paginaActual <= 100);

    const productos = productosAcumulados.map((producto: LiorenProducto) => ({
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
      total: productos.length,
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