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

type PedidoReposicion = {
  id_pedido: number;
  producto_codigo: string;
  producto_nombre: string;
  producto_unidad: string;
  cantidad: number;
  fecha: string;
  estado: string;
  vendedor: string;
  correo_vendedor: string;
  tienda: string;
  creado_en: string;
};

export default function PedidosReposicionOperacionesPage() {
  const router = useRouter();

  const [usuario, setUsuario] = useState<UsuarioPerfil | null>(null);
  const [pedidos, setPedidos] = useState<PedidoReposicion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

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

        const pedidosResponse = await fetch("/api/pedidos-reposicion");
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

          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-emerald-50 text-emerald-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Cod. primario</th>
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">Tienda</th>
                  <th className="px-4 py-3 font-semibold">Vendedor</th>
                  <th className="px-4 py-3 font-semibold">Código producto</th>
                  <th className="px-4 py-3 font-semibold">Producto</th>
                  <th className="px-4 py-3 font-semibold">Cantidad</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                </tr>
              </thead>

              <tbody>
                {pedidos.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No hay pedidos de reposición registrados.
                    </td>
                  </tr>
                ) : (
                  pedidos.map((pedido) => (
                    <tr
                      key={pedido.id_pedido}
                      className="border-t border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-semibold text-gray-700">
                        {pedido.id_pedido}
                      </td>
                      <td className="px-4 py-3">{pedido.fecha}</td>
                      <td className="px-4 py-3">{pedido.tienda}</td>
                      <td className="px-4 py-3">{pedido.vendedor}</td>
                      <td className="px-4 py-3">{pedido.producto_codigo}</td>
                      <td className="px-4 py-3">{pedido.producto_nombre}</td>
                      <td className="px-4 py-3">
                        {pedido.cantidad} {pedido.producto_unidad}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                          {pedido.estado}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}