"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type TrabajadorListItem = {
  id_usuario?: number;
  rut: string;
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  rol: string;
  tienda: string;
  estado: string;
};

export default function RecursosHumanosPage() {
  const [trabajadores, setTrabajadores] = useState<TrabajadorListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchTrabajadores = async () => {
      try {
        const response = await fetch("/api/trabajadores");
        const result = await response.json();

        if (response.ok && Array.isArray(result.data)) {
          setTrabajadores(result.data);
        }
      } catch {
        setTrabajadores([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrabajadores();
  }, []);

  const handleToggleEstado = async (trabajador: TrabajadorListItem) => {
    const nextEstado = trabajador.estado === "Activo" ? "Inactivo" : "Activo";
    setTogglingId(trabajador.id_usuario ?? null);

    try {
      const response = await fetch(`/api/trabajadores/${trabajador.rut}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario: trabajador.id_usuario,
          rut: trabajador.rut,
          nombre: trabajador.nombre,
          apellido: trabajador.apellido,
          telefono: trabajador.telefono,
          correo: trabajador.correo,
          direccion: "",
          rol: trabajador.rol,
          tienda: trabajador.tienda,
          estado: nextEstado,
          asignacion: trabajador.tienda === "Sin asignación" ? null : trabajador.tienda,
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo actualizar el estado");
      }

      setTrabajadores((prev) =>
        prev.map((item) =>
          item.rut === trabajador.rut ? { ...item, estado: nextEstado } : item
        )
      );
    } catch {
      alert("No se pudo cambiar el estado del usuario");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-gray-800">
      <main className="mx-auto max-w-7xl px-5 py-10">
        <section className="rounded-3xl border border-white/40 bg-white/70 p-8 shadow-[0_10px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
                Recursos Humanos
              </p>
              <h1 className="text-4xl font-semibold text-emerald-700">Gestión de personal</h1>
              <p className="mt-3 max-w-2xl text-gray-700">
                Administra el personal de la empresa, consulta su información y controla el estado de cada trabajador en las tiendas.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/recursos-humanos/agregar"
                className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
              >
                Agregar trabajador
              </Link>
              <Link
                href="/dashboard"
                className="rounded-full border border-emerald-200 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
              >
                Volver al panel
              </Link>
            </div>
          </div>

          <div className="mb-6 overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
            {isLoading ? (
              <div className="px-4 py-6 text-sm text-gray-600">Cargando trabajadores...</div>
            ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="bg-emerald-50 text-emerald-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">RUT</th>
                  <th className="px-4 py-3 font-semibold">Nombre</th>
                  <th className="px-4 py-3 font-semibold">Apellido</th>
                  <th className="px-4 py-3 font-semibold">Teléfono</th>
                  <th className="px-4 py-3 font-semibold">Correo</th>
                  <th className="px-4 py-3 font-semibold">Rol</th>
                  <th className="px-4 py-3 font-semibold">Asignación</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {trabajadores.map((trabajador) => (
                  <tr key={trabajador.rut} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-700">{trabajador.rut}</td>
                    <td className="px-4 py-3 text-gray-700">{trabajador.nombre}</td>
                    <td className="px-4 py-3 text-gray-700">{trabajador.apellido}</td>
                    <td className="px-4 py-3 text-gray-700">{trabajador.telefono}</td>
                    <td className="px-4 py-3 text-gray-700">{trabajador.correo}</td>
                    <td className="px-4 py-3 text-gray-700">{trabajador.rol}</td>
                    <td className="px-4 py-3 text-gray-700">{trabajador.tienda}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-start">
                        <button
                          type="button"
                          onClick={() => handleToggleEstado(trabajador)}
                          disabled={togglingId === (trabajador.id_usuario ?? null)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                            trabajador.estado === "Activo" ? "bg-emerald-500" : "bg-red-400"
                          } ${togglingId === (trabajador.id_usuario ?? null) ? "opacity-60" : ""}`}
                          aria-label={`Cambiar estado de ${trabajador.nombre} ${trabajador.apellido}`}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                              trabajador.estado === "Activo" ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/recursos-humanos/editar/${trabajador.rut}`}
                          className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                        >
                          Editar
                        </Link>
                        <Link
                          href={`/recursos-humanos/${trabajador.rut}`}
                          className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-200"
                        >
                          Ver detalle
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>

          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-gray-700">
            <p className="font-semibold text-emerald-700">Roles disponibles</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {['Administrador', 'Encargado de Tienda', 'Vendedor', 'Bodega', 'Envasado'].map((rol) => (
                <span key={rol} className="rounded-full bg-white px-3 py-1.5 font-medium text-emerald-700 shadow-sm">
                  {rol}
                </span>
              ))}
            </div>
            <p className="mt-3">Actualmente hay 3 trabajadores registrados, con 2 activos y 1 inactivo.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
