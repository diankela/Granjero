"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const features = [
  {
    title: "Tiendas",
    href: "/tiendas",
    description:
      "Gestiona todos tiendas, monitorea su crecimiento y organizalas.",
  },
  {
    title: "Compras",
    href: "/compras",
    description:
      "Control de compras. Optimiza los recursos.",
  },
  {
    title: "Despacho",
    href: "/despacho",
    description:
      "Visualiza reportes detallados sobre las entregas a cada tienda.",
  },
  {
    title: "Bodega",
    href: "/bodega",
    description:
      "Gestiona el flujo de productos, almacena información y coordina los movimientos internos.",
  },
  {
    title: "Recursos Humanos",
    href: "/recursos-humanos",
    description:
      "Administra el personal, roles, asignaciones y estado de los trabajadores.",
  },
];

// Validacion de infomración del usuario

type UsuarioPerfil = {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: string;
  activo: string;
};

type TareaEnvasadoDashboard = {
  id_envasado: number;
  producto: string;
  codigo_producto: string;
  trabajador: string;
  cantidad_objetivo: number;
  cantidad_completada: number;
  avance: number;
  estado: string;
  observacion: string | null;
  creado_en: string;
  iniciado_en: string | null;
  finalizado_en: string | null;
};

type PedidoDashboard = {
  grupo_pedido_id: string;
  tienda: string;
  estado: string;
};

export default function DashboardPage() {

  const router = useRouter();
  const [usuario, setUsuario] = useState<UsuarioPerfil | null>(null);
  const [cargando, setCargando] = useState(true);

  const [tareasEnvasado, setTareasEnvasado] = useState<
    TareaEnvasadoDashboard[]
  >([]);
  const [pedidosDashboard, setPedidosDashboard] = useState<PedidoDashboard[]>([]);
  const [cargandoTareasEnvasado, setCargandoTareasEnvasado] = useState(false);


  async function cargarPedidosDashboard() {
    try {
      const response = await fetch("/api/pedidos-reposicion/grupos");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al cargar pedidos.");
      }

      setPedidosDashboard(result.data || []);
    } catch (error) {
      console.error(error);
      setPedidosDashboard([]);
    }
  }
  useEffect(() => {
    async function cargarUsuario() {
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

        const response = await fetch("/api/auth/perfil", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            correo: data.user.email,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          await supabase.auth.signOut();
          router.push("/login");
          return;
        }

        if (result.data.rol === "VENDEDOR") {
          router.push("/bodega/pedidos-tienda");
          return;
        }

        if (result.data.rol !== "ADMINISTRADOR") {
          await supabase.auth.signOut();
          router.push("/login");
          return;
        }
        setUsuario(result.data);
        cargarTareasEnvasadoDashboard();
        cargarPedidosDashboard();
      } catch (error) {
        console.error(error);
        router.push("/login");
      } finally {
        setCargando(false);
      }
    }

    cargarUsuario();
  }, [router]);

  async function cerrarSesion() {
    if (supabase) {
      await supabase.auth.signOut();
    }

    router.push("/login");
  }

  const nombreUsuario = usuario
    ? `${usuario.nombre} ${usuario.apellido}`
    : "Usuario";

  const inicialUsuario = usuario?.nombre
    ? usuario.nombre.charAt(0).toUpperCase()
    : "U";

  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f5f5]">
        <p className="text-gray-600">Cargando sesión...</p>
      </main>
    );
  }

  async function cargarTareasEnvasadoDashboard() {
    try {
      setCargandoTareasEnvasado(true);

      const response = await fetch("/api/envasado");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al cargar tareas de envasado.");
      }

      setTareasEnvasado(result.data || []);
    } catch (error) {
      console.error(error);
      setTareasEnvasado([]);
    } finally {
      setCargandoTareasEnvasado(false);
    }
  }

  function formatearEstadoEnvasado(estado: string) {
    return estado.replaceAll("_", " ");
  }

  function obtenerColorAvanceEnvasador(avance: number) {
    if (avance <= 25) {
      return "bg-red-500";
    }

    if (avance <= 75) {
      return "bg-orange-500";
    }

    if (avance <= 98) {
      return "bg-yellow-400";
    }

    return "bg-emerald-500";
  }

  function obtenerIndicadoresEnvasadores() {
    const resumen = new Map<
      string,
      {
        trabajador: string;
        cantidad_objetivo: number;
        cantidad_completada: number;
        tareas: number;
      }
    >();

    tareasEnvasado.forEach((tarea) => {
      const trabajador = tarea.trabajador || "Sin asignar";

      const actual = resumen.get(trabajador) || {
        trabajador,
        cantidad_objetivo: 0,
        cantidad_completada: 0,
        tareas: 0,
      };

      actual.cantidad_objetivo += Number(tarea.cantidad_objetivo || 0);
      actual.cantidad_completada += Number(tarea.cantidad_completada || 0);
      actual.tareas += 1;

      resumen.set(trabajador, actual);
    });

    return Array.from(resumen.values()).map((item) => {
      const avance =
        item.cantidad_objetivo > 0
          ? Math.round((item.cantidad_completada / item.cantidad_objetivo) * 100)
          : 0;

      return {
        ...item,
        avance: Math.min(avance, 100),
      };
    });
  }

  const indicadoresEnvasadores = obtenerIndicadoresEnvasadores();

  function obtenerColorEstadoPedidos(estado: string) {
    if (estado === "NO_REVISADO") {
      return "bg-red-100 text-red-700";
    }

    if (estado === "EN_PREPARACION") {
      return "bg-orange-100 text-orange-700";
    }

    if (estado === "REVISADA") {
      return "bg-emerald-100 text-emerald-700";
    }

    return "bg-gray-100 text-gray-600";
  }

  function obtenerResumenPedidosTiendas() {
    const tiendas = ["La Concepción", "Bilbao", "Providencia"];

    return tiendas.map((tienda) => {
      const pedidosTienda = pedidosDashboard.filter(
        (pedido) => pedido.tienda === tienda
      );

      const noRevisados = pedidosTienda.filter(
        (pedido) => pedido.estado === "NO_REVISADO"
      ).length;

      const enPreparacion = pedidosTienda.filter(
        (pedido) => pedido.estado === "EN_PREPARACION"
      ).length;

      const revisados = pedidosTienda.filter(
        (pedido) =>
          pedido.estado !== "NO_REVISADO" &&
          pedido.estado !== "EN_PREPARACION"
      ).length;

      let estadoPrincipal = "SIN_PEDIDOS";

      if (enPreparacion > 0) {
        estadoPrincipal = "EN_PREPARACION";
      } else if (noRevisados > 0) {
        estadoPrincipal = "NO_REVISADO";
      } else if (revisados > 0) {
        estadoPrincipal = "REVISADA";
      }

      return {
        tienda,
        total: pedidosTienda.length,
        noRevisados,
        enPreparacion,
        revisados,
        estadoPrincipal,
      };
    });
  }

  function formatearEstadoResumenPedidos(estado: string) {
    if (estado === "NO_REVISADO") return "No revisada";
    if (estado === "EN_PREPARACION") return "En preparación";
    if (estado === "REVISADA") return "Revisada";
    return "Sin pedidos";
  }

  const resumenPedidosTiendas = obtenerResumenPedidosTiendas();


















  return (

    // _______________________________________HEADER_____________________________________________________________________



    <div className="min-h-screen bg-[#f5f5f5] text-gray-800">
      <header className="relative overflow-hidden bg-transparent px-8 pb-6 pt-6 text-white">
        <nav className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/granjero-1.png" alt="Granjero logo" className="h-20 w-auto" />
          </div>
          <div className="flex items-center gap-9">
            <Link
              href="/profile"
              className="flex items-center gap-3 rounded-full bg-emerald-500 px-3 py-2 text-white shadow-sm transition hover:bg-emerald-600"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 font-bold text-white">
                {inicialUsuario}
              </div>

              <span className="font-medium">{nombreUsuario}</span>
            </Link>

            <button
              type="button"
              onClick={cerrarSesion}
              className="rounded-lg bg-emerald-500 px-6 py-4 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-600"
            >
              Cerrar Sesión
            </button>
          </div>
        </nav>
      </header>

      {/* _________________________________________________________________________________________________________________________________ */}
      {/* ________________________________________BOX BIENVENIDA____________________________________________________________________________________ */}

      <main className="mx-auto max-w-7xl px-5 py-10">
        <section className="box1-glass mb-8 rounded-2xl border border-white/40 bg-white/40 p-8 shadow-[0_8px_32px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <h2 className="mb-3 text-3xl font-semibold text-black-200">
            ¡Bienvenido, {usuario?.nombre}!
          </h2>
          <p className="max-w-2xl text-gray-700">
            Has iniciado sesión correctamente en el sistema de gestión Granjero. Desde aquí puedes acceder a todas las funcionalidades de la plataforma.
          </p>
        </section>

        {/* ___________________________________________________________________________________________________________________________________ */}
        {/* ________________________________________INDICADORES DE ENVASADO____________________________________________________________________________________ */}
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <section className="w-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
                  Indicadores de envasado
                </p>

                <h2 className="mt-1 text-xl font-bold text-gray-800">
                  Avance por envasador
                </h2>

                <p className="mt-1 text-xs text-gray-600">
                  Avance según unidades completadas versus objetivo asignado.
                </p>
              </div>
            </div>

            {indicadoresEnvasadores.length === 0 ? (
              <p className="rounded-xl bg-gray-50 px-4 py-4 text-center text-sm text-gray-500">
                Todavía no hay tareas de envasado asignadas.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <div className="flex min-h-[210px] min-w-[320px] gap-3">
                  <div className="flex h-40 flex-col justify-between py-1 text-[10px] font-semibold text-gray-500">
                    <span>100%</span>
                    <span>75%</span>
                    <span>50%</span>
                    <span>25%</span>
                    <span>0%</span>
                  </div>

                  <div className="relative flex flex-1 items-end justify-around gap-3 border-l border-b border-gray-200 px-3 pb-7">
                    <div className="absolute inset-x-0 top-0 border-t border-dashed border-gray-200" />
                    <div className="absolute inset-x-0 top-1/4 border-t border-dashed border-gray-200" />
                    <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-gray-200" />
                    <div className="absolute inset-x-0 top-3/4 border-t border-dashed border-gray-200" />

                    {indicadoresEnvasadores.map((item) => (
                      <div
                        key={item.trabajador}
                        className="relative z-10 flex h-40 min-w-[58px] flex-col items-center justify-end"
                      >
                        <p className="mb-1 text-xs font-bold text-gray-800">
                          {item.avance}%
                        </p>

                        <div className="flex h-32 w-9 items-end rounded-t-lg bg-gray-100">
                          <div
                            className={`w-full rounded-t-lg transition-all ${obtenerColorAvanceEnvasador(
                              item.avance
                            )}`}
                            style={{
                              height: `${item.avance}%`,
                            }}
                          />
                        </div>

                        <div className="absolute -bottom-7 w-24 text-center">
                          <p className="truncate text-[11px] font-semibold text-gray-700">
                            {item.trabajador}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            {item.tareas} tarea{item.tareas === 1 ? "" : "s"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-3 text-[11px] font-semibold text-gray-600">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                    0% - 25%
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                    26% - 75%
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                    76% - 98%
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    99% - 100%
                  </span>
                </div>
              </div>
            )}
          </section>

          {/* _________________________________________________________________________________________________________________________________ */}
          {/* ________________________________________INDICADORES DE PEDIDOS____________________________________________________________________________________ */}

          <section className="w-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
                Pedidos tiendas
              </p>

              <h2 className="mt-1 text-xl font-bold text-gray-800">
                Actividad por tienda
              </h2>

              <p className="mt-1 text-xs text-gray-600">
                Estado actual de los pedidos enviados por cada local.
              </p>
            </div>

            <div className="space-y-3">
              {resumenPedidosTiendas.map((item) => (
                <div
                  key={item.tienda}
                  className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-gray-800">
                        {item.tienda}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {item.total} pedido{item.total === 1 ? "" : "s"} registrado
                        {item.total === 1 ? "" : "s"}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-bold ${obtenerColorEstadoPedidos(
                        item.estadoPrincipal
                      )}`}
                    >
                      {formatearEstadoResumenPedidos(item.estadoPrincipal)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-white px-2 py-2">
                      <p className="text-lg font-bold text-red-600">
                        {item.noRevisados}
                      </p>
                      <p className="text-[10px] font-semibold uppercase text-gray-500">
                        No revisados
                      </p>
                    </div>

                    <div className="rounded-lg bg-white px-2 py-2">
                      <p className="text-lg font-bold text-orange-500">
                        {item.enPreparacion}
                      </p>
                      <p className="text-[10px] font-semibold uppercase text-gray-500">
                        Preparación
                      </p>
                    </div>

                    <div className="rounded-lg bg-white px-2 py-2">
                      <p className="text-lg font-bold text-emerald-600">
                        {item.revisados}
                      </p>
                      <p className="text-[10px] font-semibold uppercase text-gray-500">
                        Revisados
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
        {/* _________________________________________________________________________________________________________________________________ */}
        {/* ________________________________________TAREAS DE ENVASADO____________________________________________________________________________________ */}

        {/* <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
                Envasado
              </p>

              <h2 className="mt-2 text-2xl font-bold text-gray-800">
                Supervisión de tareas de envasado
              </h2>

              <p className="mt-2 max-w-3xl text-sm text-gray-600">
                Revisa el avance general, los productos asignados y las observaciones registradas por operaciones.
              </p>
            </div>

            <button
              type="button"
              onClick={cargarTareasEnvasadoDashboard}
              disabled={cargandoTareasEnvasado}
              className="w-fit rounded-full border border-emerald-200 bg-white px-6 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-60"
            >
              {cargandoTareasEnvasado ? "Actualizando..." : "Actualizar"}
            </button>
          </div>

          {cargandoTareasEnvasado ? (
            <p className="rounded-xl bg-gray-50 px-4 py-5 text-center text-sm text-gray-500">
              Cargando tareas de envasado...
            </p>
          ) : tareasEnvasado.length === 0 ? (
            <p className="rounded-xl bg-gray-50 px-4 py-5 text-center text-sm text-gray-500">
              Todavía no hay tareas de envasado registradas.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-emerald-50 text-emerald-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Producto</th>
                    <th className="px-4 py-3 font-semibold">Envasador</th>
                    <th className="px-4 py-3 font-semibold">Objetivo</th>
                    <th className="px-4 py-3 font-semibold">Completado</th>
                    <th className="px-4 py-3 font-semibold">Avance</th>
                    <th className="px-4 py-3 font-semibold">Estado</th>
                    <th className="px-4 py-3 font-semibold">Observación</th>
                  </tr>
                </thead>

                <tbody>
                  {tareasEnvasado.slice(0, 8).map((tarea) => (
                    <tr key={tarea.id_envasado} className="border-t border-gray-100">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800">
                          {tarea.producto}
                        </p>
                        <p className="text-xs text-gray-500">
                          {tarea.codigo_producto}
                        </p>
                      </td>

                      <td className="px-4 py-3 text-gray-700">
                        {tarea.trabajador}
                      </td>

                      <td className="px-4 py-3 text-gray-700">
                        {tarea.cantidad_objetivo} unidades
                      </td>

                      <td className="px-4 py-3 text-gray-700">
                        {tarea.cantidad_completada} unidades
                      </td>

                      <td className="px-4 py-3">
                        <div className="mb-1 h-2 w-32 rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-emerald-500"
                            style={{
                              width: `${Math.min(tarea.avance, 100)}%`,
                            }}
                          />
                        </div>

                        <span className="text-xs font-semibold text-gray-600">
                          {tarea.avance}%
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                          {formatearEstadoEnvasado(tarea.estado)}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {tarea.observacion ? (
                          <p className="max-w-xs rounded-xl bg-emerald-50 px-3 py-2 text-xs text-gray-700">
                            {tarea.observacion}
                          </p>
                        ) : (
                          <span className="text-xs text-gray-400">
                            Sin observación
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section> */}



        {/* _________________________________________________________________________________________________________________________________ */}
        {/* ________________________________________MENUS____________________________________________________________________________________ */}


        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="group rounded-2xl border border-white/50 bg-white/50 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.10)] backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-[0_12px_35px_rgba(15,23,42,0.16)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-300"
            >
              {/* <div className="mb-4 text-4xl">{feature.icon}</div> */}
              <h3 className="mb-2 text-xl font-semibold text-black-600">{feature.title}</h3>
              <p className="text-sm leading-6 text-gray-600">{feature.description}</p>
              <p className="mt-6 text-sm font-semibold text-gray-700 transition group-hover:text-gray-900">
                Ir a {feature.title}
              </p>
            </Link>
          ))}
        </section>
      </main>
      <footer className="bg-green-700 px-8 py-8 text-white shadow-inner shadow-emerald-700/20">
        <div className="mx-auto max-w-7xl space-y-3 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-100">Granjero</p>
          <p className="max-w-2xl mx-auto text-sm text-emerald-100/90">
            Plataforma de gestión interna.
          </p>
          <p className="text-xs text-emerald-200/90">© 2026 Kent. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
