import Link from "next/link";
import { trabajadores } from "./data";

export default function RecursosHumanosPage() {
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
              <button className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600">
                Agregar trabajador
              </button>
              <Link
                href="/dashboard"
                className="rounded-full border border-emerald-200 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
              >
                Volver al panel
              </Link>
            </div>
          </div>

          <div className="mb-6 overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-emerald-50 text-emerald-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">RUT</th>
                  <th className="px-4 py-3 font-semibold">Nombre</th>
                  <th className="px-4 py-3 font-semibold">Apellido</th>
                  <th className="px-4 py-3 font-semibold">Teléfono</th>
                  <th className="px-4 py-3 font-semibold">Correo</th>
                  <th className="px-4 py-3 font-semibold">Rol</th>
                  <th className="px-4 py-3 font-semibold">Tienda asignada</th>
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
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          trabajador.estado === "Activo"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {trabajador.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200">
                          Editar
                        </button>
                        <button className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-200">
                          Desactivar
                        </button>
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
          </div>

          <div className="rounded-2xl bg-emerald-50 p-5 text-sm text-gray-700">
            <p className="font-semibold text-emerald-700">Resumen</p>
            <p className="mt-2">Actualmente hay 3 trabajadores registrados, con 2 activos y 1 inactivo.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
