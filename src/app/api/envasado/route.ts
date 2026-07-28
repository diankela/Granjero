// import { NextResponse } from "next/server";
// import { createSupabaseServerClient } from "@/lib/supabase-server";

// export async function GET() {
//   try {
//     const supabase = createSupabaseServerClient();

//     const { data, error } = await supabase
//       .from("envasado")
//       .select(`
//         id_envasado,
//         productos_id_producto,
//         usuario_id_usuario,
//         cantidad_objetivo,
//         cantidad_completada,
//         estado,
//         observacion,
//         creado_en,
//         iniciado_en,
//         finalizado_en,
//         productos:productos_id_producto (
//           id_producto,
//           codigo,
//           nombre,
//           unidad_medida
//         ),
//         usuario:usuario_id_usuario (
//           id_usuario,
//           nombre,
//           apellido,
//           rol
//         )
//       `)
//       .order("id_envasado", { ascending: false });

//     if (error) {
//       return NextResponse.json(
//         { ok: false, error: error.message },
//         { status: 400 }
//       );
//     }

//     const tareas = (data || []).map((item: any) => {
//       const objetivo = Number(item.cantidad_objetivo || 0);
//       const completado = Number(item.cantidad_completada || 0);

//       const avance =
//         objetivo > 0 ? Math.round((completado / objetivo) * 100) : 0;

//       return {
//         id_envasado: item.id_envasado,
//         productos_id_producto: item.productos_id_producto,
//         usuario_id_usuario: item.usuario_id_usuario,
//         producto: item.productos?.nombre || "Producto no encontrado",
//         codigo_producto: item.productos?.codigo || "",
//         unidad_medida: item.productos?.unidad_medida || "",
//         trabajador: item.usuario
//           ? `${item.usuario.nombre} ${item.usuario.apellido}`
//           : "Trabajador no encontrado",
//         rol: item.usuario?.rol || "",
//         cantidad_objetivo: objetivo,
//         cantidad_completada: completado,
//         avance,
//         estado: item.estado,
//         observacion: item.observacion,
//         creado_en: item.creado_en,
//         iniciado_en: item.iniciado_en,
//         finalizado_en: item.finalizado_en,
//       };
//     });

//     return NextResponse.json({
//       ok: true,
//       data: tareas,
//     });
//   } catch (error) {
//     return NextResponse.json(
//       {
//         ok: false,
//         error:
//           error instanceof Error
//             ? error.message
//             : "Error al consultar tareas de envasado",
//       },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(request: Request) {
//   try {
//     const payload = await request.json();
//     const supabase = createSupabaseServerClient();

//     const productos_id_producto = Number(payload.productos_id_producto);
//     const usuario_id_usuario = Number(payload.usuario_id_usuario);
//     const cantidad_objetivo = Number(payload.cantidad_objetivo);
//     const observacion = String(payload.observacion || "").trim();

//     if (!productos_id_producto) {
//       return NextResponse.json(
//         { ok: false, error: "Debes seleccionar un producto." },
//         { status: 400 }
//       );
//     }

//     if (!usuario_id_usuario) {
//       return NextResponse.json(
//         { ok: false, error: "Debes seleccionar un trabajador." },
//         { status: 400 }
//       );
//     }

//     if (!cantidad_objetivo || cantidad_objetivo <= 0) {
//       return NextResponse.json(
//         { ok: false, error: "La cantidad objetivo debe ser mayor a cero." },
//         { status: 400 }
//       );
//     }

//     const { data, error } = await supabase
//       .from("envasado")
//       .insert({
//         productos_id_producto,
//         usuario_id_usuario,
//         cantidad_objetivo,
//         cantidad_completada: 0,
//         estado: "PENDIENTE",
//         observacion: observacion || null,
//       })
//       .select()
//       .single();

//     if (error) {
//       return NextResponse.json(
//         { ok: false, error: error.message },
//         { status: 400 }
//       );
//     }

//     return NextResponse.json(
//       {
//         ok: true,
//         message: "Tarea de envasado creada correctamente",
//         data,
//       },
//       { status: 201 }
//     );
//   } catch (error) {
//     return NextResponse.json(
//       {
//         ok: false,
//         error:
//           error instanceof Error
//             ? error.message
//             : "Error al crear tarea de envasado",
//       },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type UsuarioRelacion = {
  nombre: string;
  apellido: string;
  rol: string;
};

type ProductoRelacion = {
  codigo: string;
  nombre: string;
  unidad_medida: string;
};

type EnvasadoRaw = {
  id_envasado: number;
  productos_id_producto: number | null;
  usuario_id_usuario: number;
  lioren_producto_id: number | null;
  producto_codigo: string | null;
  producto_nombre: string | null;
  producto_unidad: string | null;
  cantidad_objetivo: number;
  cantidad_completada: number;
  estado: string;
  observacion: string | null;
  creado_en: string;
  iniciado_en: string | null;
  finalizado_en: string | null;
  productos: ProductoRelacion | ProductoRelacion[] | null;
  usuario: UsuarioRelacion | UsuarioRelacion[] | null;
};

function obtenerPrimero<T>(valor: T | T[] | null) {
  if (Array.isArray(valor)) return valor[0] || null;
  return valor;
}

export async function GET() {
  try {
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from("envasado")
      .select(`
        id_envasado,
        productos_id_producto,
        usuario_id_usuario,
        lioren_producto_id,
        producto_codigo,
        producto_nombre,
        producto_unidad,
        cantidad_objetivo,
        cantidad_completada,
        estado,
        observacion,
        creado_en,
        iniciado_en,
        finalizado_en,
        productos:productos_id_producto (
          codigo,
          nombre,
          unidad_medida
        ),
        usuario:usuario_id_usuario (
          nombre,
          apellido,
          rol
        )
      `)
      .order("creado_en", { ascending: false });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 }
      );
    }

    const tareas = ((data || []) as EnvasadoRaw[]).map((tarea) => {
      const productoManual = obtenerPrimero(tarea.productos);
      const trabajador = obtenerPrimero(tarea.usuario);

      const cantidadObjetivo = Number(tarea.cantidad_objetivo || 0);
      const cantidadCompletada = Number(tarea.cantidad_completada || 0);

      const avance =
        cantidadObjetivo > 0
          ? Math.round((cantidadCompletada / cantidadObjetivo) * 100)
          : 0;

      return {
        id_envasado: tarea.id_envasado,
        productos_id_producto: tarea.productos_id_producto,
        usuario_id_usuario: tarea.usuario_id_usuario,
        lioren_producto_id: tarea.lioren_producto_id,
        producto: tarea.producto_nombre || productoManual?.nombre || "Sin producto",
        codigo_producto:
          tarea.producto_codigo || productoManual?.codigo || "Sin código",
        unidad_medida:
          tarea.producto_unidad || productoManual?.unidad_medida || "Unidad",
        trabajador: trabajador
          ? `${trabajador.nombre} ${trabajador.apellido}`
          : "Sin trabajador",
        rol: trabajador?.rol || "",
        cantidad_objetivo: cantidadObjetivo,
        cantidad_completada: cantidadCompletada,
        avance: Math.min(avance, 100),
        estado: tarea.estado,
        observacion: tarea.observacion,
        creado_en: tarea.creado_en,
        iniciado_en: tarea.iniciado_en,
        finalizado_en: tarea.finalizado_en,
      };
    });

    return NextResponse.json({ ok: true, data: tareas });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Error al consultar tareas de envasado.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseServerClient();
    const payload = await request.json();

    const productoCodigo = String(payload.producto_codigo || "").trim();
    const usuarioId = Number(payload.usuario_id_usuario);
    const cantidadObjetivo = Number(payload.cantidad_objetivo);
    const observacion = String(payload.observacion || "").trim();

    if (!productoCodigo) {
      return NextResponse.json(
        { ok: false, error: "Debes seleccionar un producto." },
        { status: 400 }
      );
    }

    if (!usuarioId) {
      return NextResponse.json(
        { ok: false, error: "Debes seleccionar un envasador." },
        { status: 400 }
      );
    }

    if (!cantidadObjetivo || cantidadObjetivo <= 0) {
      return NextResponse.json(
        { ok: false, error: "El objetivo debe ser mayor a cero." },
        { status: 400 }
      );
    }

    const { data: producto, error: productoError } = await supabase
      .from("lioren_productos_cache")
      .select(`
        lioren_producto_id,
        codigo,
        nombre,
        unidad_medida,
        activo
      `)
      .eq("codigo", productoCodigo)
      .eq("activo", 1)
      .single();

    if (productoError || !producto) {
      return NextResponse.json(
        { ok: false, error: "No se encontró el producto en la base Lioren." },
        { status: 404 }
      );
    }

    const { data: trabajador, error: trabajadorError } = await supabase
      .from("usuario")
      .select("id_usuario, nombre, apellido, rol, activo")
      .eq("id_usuario", usuarioId)
      .eq("activo", "S")
      .single();

    if (trabajadorError || !trabajador) {
      return NextResponse.json(
        { ok: false, error: "No se encontró el trabajador asignado." },
        { status: 404 }
      );
    }

    if (trabajador.rol !== "ENVASADO") {
      return NextResponse.json(
        {
          ok: false,
          error: "Solo puedes asignar tareas a trabajadores con rol ENVASADO.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("envasado")
      .insert({
        productos_id_producto: null,
        lioren_producto_id: producto.lioren_producto_id || null,
        producto_codigo: producto.codigo,
        producto_nombre: producto.nombre,
        producto_unidad: producto.unidad_medida || "Unidad",
        usuario_id_usuario: usuarioId,
        cantidad_objetivo: cantidadObjetivo,
        cantidad_completada: 0,
        estado: "PENDIENTE",
        observacion: observacion || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Tarea de envasado creada correctamente.",
      data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Error al crear tarea de envasado.",
      },
      { status: 500 }
    );
  }
}