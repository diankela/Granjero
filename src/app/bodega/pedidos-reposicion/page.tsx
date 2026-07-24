"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type UsuarioPerfil = {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: string;
  activo: string;
};

type ProductoPedido = {
  id_pedido: number;
  producto_codigo: string;
  producto_nombre: string;
  producto_unidad: string;
  cantidad: number;
  estado: string;
};

type PedidoReposicionGrupo = {
  grupo_pedido_id: string;
  usuario_id_usuario: number;
  tiendas_id_tienda: number;
  fecha: string;
  hora_pedido: string;
  estado: string;
  comentario_operador: string;
  creado_en: string;
  actualizado_en: string;
  vendedor: string;
  correo_vendedor: string;
  tienda: string;
  productos: ProductoPedido[];
};

type InfoTienda = {
  nombre: string;
  telefono: string;
  jefeLocal: string;
  direccion: string;
  turnos: {
    trabajador: string;
    horario: string;
  }[];
};

export default function PedidosReposicionOperacionesPage() {
  const router = useRouter();

  const [usuario, setUsuario] = useState<UsuarioPerfil | null>(null);
  const [pedidos, setPedidos] = useState<PedidoReposicionGrupo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [estadosEditados, setEstadosEditados] = useState<Record<string, string>>({});
  const [comentariosEditados, setComentariosEditados] = useState<Record<string, string>>({});
  const [guardandoPedidoId, setGuardandoPedidoId] = useState<string | null>(null);
  const [mensajeActualizacion, setMensajeActualizacion] = useState("");

  const [seccionActiva, setSeccionActiva] = useState<
    "LA_CONCEPCION" | "BILBAO" | "PROVIDENCIA" | "BODEGA"
  >("LA_CONCEPCION");

  useEffect(() => {
    async function cargarVista() {
      try {
        if (!supabase) {
          router.push("/login");
          return;
        }

        const { data, error } = await supabase.auth.getUser();

        if (error || !data.user?.email) {
          router.push("/login");
          return;
        }

        const perfilResponse = await fetch("/api/auth/perfil", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            correo: data.user.email,
          }),
        });

        const perfilResult = await perfilResponse.json();

        if (!perfilResponse.ok) {
          await supabase.auth.signOut();
          router.push("/login");
          return;
        }

        const rol = perfilResult.data.rol;

        if (rol === "VENDEDOR") {
          router.push("/bodega/pedidos-tienda");
          return;
        }

        if (rol !== "ADMINISTRADOR" && rol !== "JEFE_OPERACIONES") {
          await supabase.auth.signOut();
          router.push("/login");
          return;
        }

        setUsuario(perfilResult.data);

        const pedidosResponse = await fetch("/api/pedidos-reposicion/grupos");
        const pedidosResult = await pedidosResponse.json();

        if (!pedidosResponse.ok) {
          throw new Error(
            pedidosResult.error || "Error al cargar pedidos de reposición."
          );
        }

        setPedidos(pedidosResult.data || []);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Error al cargar la vista."
        );
      } finally {
        setCargando(false);
      }
    }

    cargarVista();
  }, [router]);

  async function cerrarSesion() {
    if (supabase) {
      await supabase.auth.signOut();
    }

    router.push("/login");
  }

  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f5f5]">
        <p className="text-gray-600">Cargando pedidos...</p>
      </main>
    );
  }



  function obtenerClaseEstado(estado: string) {
    if (estado === "NO REVISADO") {
      return "bg-red-100 text-red-700";
    }

    if (estado === "EN PREPARACION") {
      return "bg-yellow-100 text-yellow-700";
    }

    if (estado === "EN CAMINO") {
      return "bg-blue-100 text-blue-700";
    }

    // if (estado === "ENTREGADO") {
    //   return "bg-emerald-100 text-emerald-700";
    // }

    if (estado === "RECHAZADO") {
      return "bg-gray-200 text-gray-700";
    }

    return "bg-gray-100 text-gray-700";
  }

  function formatearEstado(estado: string) {
    return estado.replaceAll("_", " ");
  }

  async function actualizarPedido(grupoPedidoId: string) {
    setError("");
    setMensajeActualizacion("");

    const pedido = pedidos.find(
      (item) => item.grupo_pedido_id === grupoPedidoId
    );

    if (!pedido) {
      setError("No se encontró el pedido seleccionado.");
      return;
    }

    const estado = estadosEditados[grupoPedidoId] || pedido.estado;
    const comentario_operador =
      comentariosEditados[grupoPedidoId] ?? pedido.comentario_operador ?? "";

    try {
      setGuardandoPedidoId(grupoPedidoId);

      const response = await fetch(
        `/api/pedidos-reposicion/grupos/${grupoPedidoId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            estado,
            comentario_operador,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al actualizar el pedido.");
      }

      setPedidos((prev) =>
        prev.map((item) =>
          item.grupo_pedido_id === grupoPedidoId
            ? {
              ...item,
              estado,
              comentario_operador,
              actualizado_en: new Date().toISOString(),
            }
            : item
        )
      );

      setMensajeActualizacion("Pedido actualizado correctamente.");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Error al actualizar el pedido."
      );
    } finally {
      setGuardandoPedidoId(null);
    }
  }

  function renderTarjetaTienda(nombreTienda: string, pedidosTienda: PedidoReposicionGrupo[]) {
    const infoTienda = infoTiendas[nombreTienda];
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-3">
          {infoTienda ? (
            <div className="mb-6 w-full rounded-2xl border border-emerald-100 bg-emerald-50 p-6">
              <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="rounded-xl bg-white px-5 py-4 lg:min-w-[280px]">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                    Tienda
                  </p>

                  <h3 className="mt-2 text-2xl font-bold text-gray-800">
                    {nombreTienda}
                  </h3>
                </div>

                <div className="rounded-full bg-white px-5 py-3 text-sm font-bold text-emerald-700 shadow-sm">
                  {pedidosTienda.length} pedidos
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-3">
                <div className="rounded-xl bg-white px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                    Jefe local
                  </p>
                  <p className="mt-2 text-base font-semibold text-gray-800">
                    {infoTienda.jefeLocal}
                  </p>
                </div>

                <div className="rounded-xl bg-white px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                    Teléfono
                  </p>
                  <p className="mt-2 text-base font-semibold text-gray-800">
                    {infoTienda.telefono}
                  </p>
                </div>

                <div className="rounded-xl bg-white px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                    Dirección
                  </p>
                  <p className="mt-2 text-base font-semibold text-gray-800">
                    {infoTienda.direccion}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                  Turnos tienda
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                  {infoTienda.turnos.map((turno) => (
                    <div
                      key={`${turno.trabajador}-${turno.horario}`}
                      className="rounded-xl bg-white px-5 py-4"
                    >
                      <p className="text-base font-semibold text-gray-800">
                        {turno.trabajador}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {turno.horario}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {pedidosTienda.length === 0 ? (
          <p className="rounded-xl bg-gray-50 px-4 py-5 text-center text-sm text-gray-500">
            No hay pedidos registrados para esta tienda.
          </p>
        ) : (
          <div className="space-y-4">
            {pedidosTienda.map((pedido) => (
              <div
                key={pedido.grupo_pedido_id}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4"
              >
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Pedido #{pedido.grupo_pedido_id.slice(0, 8)}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {pedido.fecha} · {pedido.hora_pedido.slice(0, 5)} hrs · {pedido.vendedor}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${obtenerClaseEstado(
                      pedido.estado
                    )}`}
                  >
                    {formatearEstado(pedido.estado)}
                  </span>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                  <table className="min-w-full text-left text-xs">
                    <thead className="bg-emerald-50 text-emerald-800">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Código</th>
                        <th className="px-3 py-2 font-semibold">Producto</th>
                        <th className="px-3 py-2 font-semibold">Cantidad</th>
                      </tr>
                    </thead>

                    <tbody>
                      {pedido.productos.map((producto) => (
                        <tr
                          key={producto.id_pedido}
                          className="border-t border-gray-100"
                        >
                          <td className="px-3 py-2">{producto.producto_codigo}</td>
                          <td className="px-3 py-2">{producto.producto_nombre}</td>
                          <td className="px-3 py-2">
                            {producto.cantidad} {producto.producto_unidad}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Estado del pedido
                      </label>

                      <select
                        value={estadosEditados[pedido.grupo_pedido_id] || pedido.estado}
                        onChange={(event) =>
                          setEstadosEditados((prev) => ({
                            ...prev,
                            [pedido.grupo_pedido_id]: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                      >
                        <option value="NO_REVISADO">No revisado</option>
                        <option value="EN_PREPARACION">En preparación</option>
                        <option value="EN_CAMINO">En camino</option>
                        {/* <option value="ENTREGADO">Entregado</option> */}
                        <option value="RECHAZADO">Rechazado</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Comentario para vendedor
                      </label>

                      <textarea
                        value={
                          comentariosEditados[pedido.grupo_pedido_id] ??
                          pedido.comentario_operador ??
                          ""
                        }
                        onChange={(event) =>
                          setComentariosEditados((prev) => ({
                            ...prev,
                            [pedido.grupo_pedido_id]: event.target.value,
                          }))
                        }
                        placeholder="Ej: Se enviará en el despacho de la tarde."
                        rows={3}
                        className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => actualizarPedido(pedido.grupo_pedido_id)}
                      disabled={guardandoPedidoId === pedido.grupo_pedido_id}
                      className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:bg-emerald-300"
                    >
                      {guardandoPedidoId === pedido.grupo_pedido_id
                        ? "Guardando..."
                        : "Guardar cambios"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const pedidosLaConcepcion = pedidos.filter(
    (pedido) => pedido.tienda === "La Concepción"
  );

  const pedidosBilbao = pedidos.filter(
    (pedido) => pedido.tienda === "Bilbao"
  );

  const pedidosProvidencia = pedidos.filter(
    (pedido) => pedido.tienda === "Providencia"
  );

  const opcionesMenu = [
    {
      id: "LA_CONCEPCION",
      titulo: "La Concepción",
      subtitulo: "Pedidos solicitados por la tienda La Concepción",
      cantidad: pedidosLaConcepcion.length,
    },
    {
      id: "BILBAO",
      titulo: "Bilbao",
      subtitulo: "Pedidos solicitados por la tienda Bilbao",
      cantidad: pedidosBilbao.length,
    },
    {
      id: "PROVIDENCIA",
      titulo: "Providencia",
      subtitulo: "Pedidos solicitados por la tienda Providencia",
      cantidad: pedidosProvidencia.length,
    },
    {
      id: "BODEGA",
      titulo: "Stock Bodega",
      subtitulo: "Stock disponible en bodega central",
      cantidad: null,
    },
  ] as const;

  const infoTiendas: Record<string, InfoTienda> = {
    "La Concepción": {
      nombre: "La Concepción",
      telefono: "Por definir",
      jefeLocal: "Por definir",
      direccion: "La Concepción",
      turnos: [
        {
          trabajador: "Andreina N",
          horario: "08:00 - 18:00 hrs",
        },
        {
          trabajador: "Carolina N",
          horario: "18:01 - 21:00 hrs",
        },
      ],
    },
    Bilbao: {
      nombre: "Bilbao",
      telefono: "Por definir",
      jefeLocal: "Por definir",
      direccion: "Bilbao",
      turnos: [
        {
          trabajador: "Por definir",
          horario: "08:00 - 18:00 hrs",
        },
        {
          trabajador: "Por definir",
          horario: "18:01 - 21:00 hrs",
        },
      ],
    },
    Providencia: {
      nombre: "Providencia",
      telefono: "Por definir",
      jefeLocal: "Por definir",
      direccion: "Providencia",
      turnos: [
        {
          trabajador: "Por definir",
          horario: "08:00 - 18:00 hrs",
        },
        {
          trabajador: "Por definir",
          horario: "18:01 - 21:00 hrs",
        },
      ],
    },
  };

  {/* ******************************Renderizado de la página**************************************** */ }

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-gray-800">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Operaciones
            </p>
            <h1 className="text-2xl font-bold text-emerald-700">
              Pedidos de reposición
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <p className="hidden text-sm text-gray-600 sm:block">
              {usuario?.nombre} {usuario?.apellido}
            </p>

            <button
              type="button"
              onClick={cerrarSesion}
              className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10">
        <section className="rounded-3xl border border-white/40 bg-white/80 p-8 shadow-[0_10px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <div className="mb-6">
            <h2 className="text-3xl font-semibold text-gray-800">
              Solicitudes pendientes de tiendas
            </h2>
            <p className="mt-2 text-gray-600">
              Aquí el jefe de operaciones puede revisar los productos faltantes solicitados por los vendedores.
            </p>
          </div>

          {error ? (
            <p className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </p>
          ) : null}

          {mensajeActualizacion ? (
            <p className="mb-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {mensajeActualizacion}
            </p>
          ) : null}

          {/* ******************************Tarjetas de tiendas**************************************** */}

          <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {opcionesMenu.map((opcion) => {
              const activa = seccionActiva === opcion.id;

              return (
                <button
                  key={opcion.id}
                  type="button"
                  onClick={() => setSeccionActiva(opcion.id)}
                  className={`rounded-2xl border p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${activa
                    ? "border-emerald-400 bg-emerald-50"
                    : "border-gray-200 bg-white"
                    }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                    {opcion.id === "BODEGA" ? "Bodega" : "Tienda"}
                  </p>

                  <h3 className="mt-2 text-xl font-bold text-gray-800">
                    {opcion.titulo}
                  </h3>

                  <p className="mt-2 text-sm leading-5 text-gray-600">
                    {opcion.subtitulo}
                  </p>

                  <div className="mt-4">
                    {opcion.cantidad === null ? (
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                        Pendiente
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {opcion.cantidad} pedidos
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div>
            {seccionActiva === "LA_CONCEPCION"
              ? renderTarjetaTienda("La Concepción", pedidosLaConcepcion)
              : null}

            {seccionActiva === "BILBAO"
              ? renderTarjetaTienda("Bilbao", pedidosBilbao)
              : null}

            {seccionActiva === "PROVIDENCIA"
              ? renderTarjetaTienda("Providencia", pedidosProvidencia)
              : null}

            {seccionActiva === "BODEGA" ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
                    Bodega
                  </p>

                  <h3 className="mt-1 text-xl font-bold text-gray-800">
                    Stock bodega
                  </h3>
                </div>

                <p className="rounded-xl bg-gray-50 px-4 py-5 text-center text-sm text-gray-500">
                  Stock disponible pendiente de integrar con Lioren.
                </p>
              </div>
            ) : null}
          </div>

        </section>
      </main>
    </div>
  );
}