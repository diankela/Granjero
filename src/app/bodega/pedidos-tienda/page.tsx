"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type UsuarioPerfil = {
  id_usuario: number;
  tiendas_id_tienda: number | null;
  nombre: string;
  apellido: string;
  correo: string;
  rol: string;
  activo: string;
};

type ProductoLioren = {
  id_producto: number | null;
  codigo: string;
  nombre: string;
  unidad_medida: string;
  activo: number;
};

type ProductoEnLista = {
  lioren_producto_id: number | null;
  producto_codigo: string;
  producto_nombre: string;
  producto_unidad: string;
  cantidad: number;
};

type Tienda = {
  id_tienda: number;
  nombre: string;
};

export default function PedidosTiendaPage() {
  const router = useRouter();

  const [usuario, setUsuario] = useState<UsuarioPerfil | null>(null);
  const [cargando, setCargando] = useState(true);
  
  const [productos, setProductos] = useState<ProductoLioren[]>([]);
  const [cargandoProductos, setCargandoProductos] = useState(true);

  const fechaActual = new Date().toISOString().split("T")[0];

  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [fecha, setFecha] = useState(fechaActual);
  const [busquedaProducto, setBusquedaProducto] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [errorFormulario, setErrorFormulario] = useState("");
  const [enviandoPedido, setEnviandoPedido] = useState(false);

  const [tiendas, setTiendas] = useState<Tienda[]>([]);
  const [tiendaSeleccionada, setTiendaSeleccionada] = useState("");
  const [cargandoTiendas, setCargandoTiendas] = useState(true);

  const [productosLista, setProductosLista] = useState<ProductoEnLista[]>([]);
  const [horaLista, setHoraLista] = useState("");

  useEffect(() => {
    cargarTiendas();
  }, []);

  useEffect(() => {
    cargarProductosCache();
  }, []);

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

        const rol = result.data.rol;

        if (rol !== "VENDEDOR" && rol !== "ADMINISTRADOR") {
          await supabase.auth.signOut();
          router.push("/login");
          return;
        }

        setUsuario(result.data);
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

  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f5f5]">
        <p className="text-gray-600">Cargando vista de vendedor...</p>
      </main>
    );
  }

  async function cargarProductosCache(busqueda = "") {
    try {
      setCargandoProductos(true);

      const query = busqueda.trim();

      const url = query
        ? `/api/lioren/productos-cache?q=${encodeURIComponent(query)}`
        : "/api/lioren/productos-cache";

      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al cargar productos.");
      }

      setProductos(result.data || []);
    } catch (error) {
      console.error(error);
      setProductos([]);
    } finally {
      setCargandoProductos(false);
    }
  }

  async function buscarProductos() {
    setErrorFormulario("");
    await cargarProductosCache(busquedaProducto);
  }

  async function limpiarBusquedaProductos() {
    setBusquedaProducto("");
    setProductoSeleccionado("");
    await cargarProductosCache();
  }

  function agregarProductoALista() {
    setMensaje("");
    setErrorFormulario("");

    if (!productoSeleccionado) {
      setErrorFormulario("Debes seleccionar un producto.");
      return;
    }

    if (!cantidad || Number(cantidad) <= 0) {
      setErrorFormulario("La cantidad debe ser mayor a 0.");
      return;
    }

    const ahora = new Date();

    const partesChile = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Santiago",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }).formatToParts(ahora);

    const obtenerParte = (tipo: string) =>
      partesChile.find((parte) => parte.type === tipo)?.value || "";

    const hora = Number(obtenerParte("hour"));
    const minuto = Number(obtenerParte("minute"));
    const minutosActuales = hora * 60 + minuto;

    const inicioPedidos = 9 * 60;
    const finPedidos = 15 * 60;

    if (minutosActuales < inicioPedidos || minutosActuales > finPedidos) {
      setErrorFormulario(
        "Los pedidos de reposición solo se pueden agregar entre 09:00 y 15:00 hrs."
      );
      return;
    }

    const producto = productos.find(
      (item) => item.codigo === productoSeleccionado
    );

    if (!producto) {
      setErrorFormulario("El producto seleccionado no es válido.");
      return;
    }

    const horaVisible = `${obtenerParte("hour")}:${obtenerParte("minute")}:${obtenerParte("second")}`;

    setProductosLista((prev) => {
      const productoExistente = prev.find(
        (item) => item.producto_codigo === producto.codigo
      );

      if (productoExistente) {
        return prev.map((item) =>
          item.producto_codigo === producto.codigo
            ? {
                ...item,
                cantidad: item.cantidad + Number(cantidad),
              }
            : item
        );
      }

      return [
        ...prev,
        {
          lioren_producto_id: producto.id_producto,
          producto_codigo: producto.codigo,
          producto_nombre: producto.nombre,
          producto_unidad: producto.unidad_medida,
          cantidad: Number(cantidad),
        },
      ];
    });

    if (!horaLista) {
      setHoraLista(horaVisible);
    }

    setProductoSeleccionado("");
    setCantidad("");
  }

  async function enviarPedido(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMensaje("");
    setErrorFormulario("");

    if (!usuario) {
      setErrorFormulario("No se pudo identificar al usuario.");
      return;
    }

    const tiendaPedido =
      usuario.rol === "ADMINISTRADOR"
        ? Number(tiendaSeleccionada)
        : usuario.tiendas_id_tienda;

    if (!tiendaPedido) {
      setErrorFormulario(
        usuario.rol === "ADMINISTRADOR"
          ? "Debes seleccionar una tienda."
          : "El vendedor no tiene una tienda asignada."
      );
      return;
    }

    if (productosLista.length === 0) {
      setErrorFormulario("Debes agregar al menos un producto a la lista.");
      return;
    }

    try {
      setEnviandoPedido(true);

      const response = await fetch("/api/pedidos-reposicion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario_id_usuario: usuario.id_usuario,
          tiendas_id_tienda: tiendaPedido,
          enviado_por_rol: usuario.rol,
          productos: productosLista,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al enviar la lista de reposición.");
      }

      setMensaje(
        `Lista enviada correctamente. Productos enviados: ${result.total_productos}. Hora: ${result.hora}.`
      );

      setProductosLista([]);
      setProductoSeleccionado("");
      setCantidad("");
      setFecha(fechaActual);
      setHoraLista("");

      if (usuario.rol === "ADMINISTRADOR") {
        setTiendaSeleccionada("");
      }
    } catch (error) {
      setErrorFormulario(
        error instanceof Error
          ? error.message
          : "Error al enviar la lista de reposición."
      );
    } finally {
      setEnviandoPedido(false);
    }
  }

  async function cargarTiendas() {
    try {
      setCargandoTiendas(true);

      const response = await fetch("/api/tiendas");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al cargar tiendas.");
      }

      setTiendas(result.data || []);
    } catch (error) {
      console.error(error);
      setTiendas([]);
    } finally {
      setCargandoTiendas(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-gray-800">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Vista vendedor
            </p>
            <h1 className="text-2xl font-bold text-emerald-700">
              Pedidos de reposición
            </h1>
          </div>

          <button
            type="button"
            onClick={cerrarSesion}
            className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10">
        <section className="rounded-3xl border border-white/40 bg-white/80 p-8 shadow-[0_10px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <div className="mb-6">
            <p className="text-sm text-gray-600">Bienvenido/a</p>
            <h2 className="text-3xl font-semibold text-gray-800">
              {usuario?.nombre} {usuario?.apellido}
            </h2>
          </div>

          <form
            onSubmit={enviarPedido}
            className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6"
          >
            <div className="mb-6">
              <p className="font-semibold text-emerald-800">
                Formulario de productos faltantes
              </p>
              <p className="mt-2 text-sm text-gray-700">
                Selecciona el producto faltante, indica la cantidad solicitada y envía el pedido al jefe de operaciones.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {usuario?.rol === "ADMINISTRADOR" ? (
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Tienda
                  </label>

                  <select
                    value={tiendaSeleccionada}
                    onChange={(event) => setTiendaSeleccionada(event.target.value)}
                    disabled={cargandoTiendas}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500 disabled:bg-gray-100"
                  >
                    <option value="">
                      {cargandoTiendas ? "Cargando tiendas..." : "Selecciona una tienda"}
                    </option>

                    {tiendas.map((tienda) => (
                      <option key={tienda.id_tienda} value={tienda.id_tienda}>
                        {tienda.nombre}
                      </option>
                    ))}
                  </select>

                  <p className="mt-2 text-xs text-gray-500">
                    Como administrador, debes indicar desde qué tienda se está solicitando la reposición.
                  </p>
                </div>
              ) : null}
              

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Fecha
                </label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(event) => setFecha(event.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Producto
                </label><div className="mb-3 flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    value={busquedaProducto}
                    onChange={(event) => setBusquedaProducto(event.target.value)}
                    placeholder="Buscar por código o nombre del producto"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />

                  <button
                    type="button"
                    onClick={buscarProductos}
                    className="rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
                  >
                    Buscar
                  </button>

                  <button
                    type="button"
                    onClick={limpiarBusquedaProductos}
                    className="rounded-full border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
                  >
                    Limpiar
                  </button>
                </div>

                <select
                  value={productoSeleccionado}
                  onChange={(event) => setProductoSeleccionado(event.target.value)}
                  disabled={cargandoProductos}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500 disabled:bg-gray-100"
                >
                  <option value="">
                    {cargandoProductos ? "Cargando productos..." : "Selecciona un producto"}
                  </option>

                  {productos
                    .filter((producto) => producto.activo === 1)
                    .map((producto) => (
                      <option key={producto.codigo} value={producto.codigo}>
                        {producto.codigo} - {producto.nombre} ({producto.unidad_medida})
                      </option>
                    ))}
                </select>
              </div>


              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Cantidad
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.001"
                  value={cantidad}
                  onChange={(event) => setCantidad(event.target.value)}
                  placeholder="Ej: 10"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={agregarProductoALista}
                  className="w-full rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
                >
                  Agregar
                </button>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Lista de productos solicitados
                  </h3>
                  <p className="text-sm text-gray-500">
                    Agrega todos los productos faltantes antes de enviar la solicitud.
                  </p>
                </div>

                <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                  Hora lista: {horaLista || "Sin iniciar"}
                </div>
              </div>

              {productosLista.length === 0 ? (
                <p className="rounded-xl bg-gray-50 px-4 py-5 text-center text-sm text-gray-500">
                  Aún no hay productos agregados a la lista.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-emerald-50 text-emerald-800">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Código</th>
                        <th className="px-4 py-3 font-semibold">Producto</th>
                        <th className="px-4 py-3 font-semibold">Cantidad</th>
                        <th className="px-4 py-3 font-semibold">Acción</th>
                      </tr>
                    </thead>

                    <tbody>
                      {productosLista.map((producto) => (
                        <tr
                          key={producto.producto_codigo}
                          className="border-t border-gray-100"
                        >
                          <td className="px-4 py-3">{producto.producto_codigo}</td>
                          <td className="px-4 py-3">{producto.producto_nombre}</td>
                          <td className="px-4 py-3">
                            {producto.cantidad} {producto.producto_unidad}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() =>
                                setProductosLista((prev) =>
                                  prev.filter(
                                    (item) =>
                                      item.producto_codigo !== producto.producto_codigo
                                  )
                                )
                              }
                              className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                            >
                              Quitar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {mensaje ? (
              <p className="mt-5 rounded-xl bg-emerald-100 px-4 py-3 text-sm font-medium text-emerald-700">
                {mensaje}
              </p>
            ) : null}

            {errorFormulario ? (
              <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {errorFormulario}
              </p>
            ) : null}

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={enviandoPedido || productosLista.length === 0}
                className="rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:bg-emerald-300"
              >
                {enviandoPedido ? "Enviando..." : "Enviar lista"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}