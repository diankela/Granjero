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
  id_producto: number;
  codigo: string;
  nombre: string;
  unidad_medida: string;
  activo: number;
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
  const [mensaje, setMensaje] = useState("");
  const [errorFormulario, setErrorFormulario] = useState("");
  const [enviandoPedido, setEnviandoPedido] = useState(false);

  useEffect(() => {
    cargarProductosLioren();
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

        if (result.data.rol === "ADMINISTRADOR") {
          router.push("/dashboard");
          return;
        }

        if (result.data.rol !== "VENDEDOR") {
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

  async function cargarProductosLioren() {
    try {
      setCargandoProductos(true);

      const response = await fetch("/api/lioren/productos");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al cargar productos de Lioren.");
      }

      setProductos(result.data || []);
    } catch (error) {
      console.error(error);
      setProductos([]);
    } finally {
      setCargandoProductos(false);
    }
  }

  async function enviarPedido(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMensaje("");
    setErrorFormulario("");

    if (!usuario) {
      setErrorFormulario("No se pudo identificar al vendedor.");
      return;
    }

    if (!usuario.tiendas_id_tienda) {
      setErrorFormulario("El vendedor no tiene una tienda asignada.");
      return;
    }

    if (!productoSeleccionado) {
      setErrorFormulario("Debes seleccionar un producto.");
      return;
    }

    if (!cantidad || Number(cantidad) <= 0) {
      setErrorFormulario("La cantidad debe ser mayor a 0.");
      return;
    }

    if (!fecha) {
      setErrorFormulario("Debes seleccionar una fecha.");
      return;
    }

    const producto = productos.find(
      (item) => String(item.id_producto) === productoSeleccionado
    );

    if (!producto) {
      setErrorFormulario("El producto seleccionado no es válido.");
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
          tiendas_id_tienda: usuario.tiendas_id_tienda,
          lioren_producto_id: producto.id_producto,
          producto_codigo: producto.codigo,
          producto_nombre: producto.nombre,
          producto_unidad: producto.unidad_medida,
          cantidad: Number(cantidad),
          fecha,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al enviar el pedido.");
      }

      setMensaje("Pedido enviado correctamente.");
      setProductoSeleccionado("");
      setCantidad("");
      setFecha(fechaActual);
    } catch (error) {
      setErrorFormulario(
        error instanceof Error
          ? error.message
          : "Error al enviar el pedido."
      );
    } finally {
      setEnviandoPedido(false);
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
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Cod. primario
                </label>
                <input
                  type="text"
                  value="Automático al guardar"
                  disabled
                  className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-2.5 text-sm text-gray-500 outline-none"
                />
              </div>

              <div>
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
                </label>
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
                      <option key={producto.id_producto} value={producto.id_producto}>
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
                disabled={enviandoPedido}
                className="rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:bg-emerald-300"
              >
                {enviandoPedido ? "Enviando..." : "Enviar pedido"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}