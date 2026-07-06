import Link from "next/link";
import { notFound } from "next/navigation";

type TrabajadorDetalle = {
  rut: string;
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  direccion: string;
  rol: string;
  tienda: string;
  estado: string;
};

async function getTrabajador(rut: string): Promise<TrabajadorDetalle | null> {
  try {
    const response = await fetch(`http://localhost:3000/api/trabajadores`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();

    if (!result?.data) {
      return null;
    }

    return result.data.find((item: TrabajadorDetalle) => item.rut === rut) ?? null;
  } catch {
    return null;
  }
}

export default async function TrabajadorDetallePage({
  params,
}: {
  params: Promise<{ rut: string }>;
}) {
  const { rut } = await params;
  const trabajador = await getTrabajador(rut);

  if (!trabajador) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-gray-800">
      <main className="mx-auto max-w-5xl px-5 py-10">
        <section className="rounded-3xl border border-white/40 bg-white/80 p-8 shadow-[0_10px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <Link
            href="/recursos-humanos"
            className="mb-6 inline-flex text-sm font-semibold text-emerald-700 transition hover:text-emerald-900"
          >
            ← Volver a gestión de personal
          </Link>

          <div>
            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
                  Ficha del trabajador
                </p>
                <h1 className="text-4xl font-semibold text-emerald-700">
                  {trabajador.nombre} {trabajador.apellido}
                </h1>
                <p className="mt-3 text-gray-700">
                  Consulta la información personal y laboral del trabajador seleccionado.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={`/recursos-humanos/editar/${trabajador.rut}`}
                  className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                >
                  Editar
                </Link>
                <span
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    trabajador.estado === "Activo"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {trabajador.estado}
                </span>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                <h2 className="mb-4 text-xl font-semibold text-gray-800">Datos personales</h2>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex justify-between gap-4 border-b border-gray-200 pb-2">
                    <span className="font-medium text-gray-500">RUT</span>
                    <span>{trabajador.rut}</span>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-gray-200 pb-2">
                    <span className="font-medium text-gray-500">Nombre</span>
                    <span>{trabajador.nombre}</span>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-gray-200 pb-2">
                    <span className="font-medium text-gray-500">Apellido</span>
                    <span>{trabajador.apellido}</span>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-gray-200 pb-2">
                    <span className="font-medium text-gray-500">Teléfono</span>
                    <span>{trabajador.telefono}</span>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-gray-200 pb-2">
                    <span className="font-medium text-gray-500">Correo</span>
                    <span>{trabajador.correo}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="font-medium text-gray-500">Dirección</span>
                    <span className="text-right">{trabajador.direccion}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-emerald-50 p-6">
                <h2 className="mb-4 text-xl font-semibold text-emerald-800">Datos laborales</h2>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex justify-between gap-4 border-b border-emerald-200 pb-2">
                    <span className="font-medium text-emerald-700">Rol</span>
                    <span>{trabajador.rol}</span>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-emerald-200 pb-2">
                    <span className="font-medium text-emerald-700">Asignación</span>
                    <span>{trabajador.tienda}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="font-medium text-emerald-700">Estado</span>
                    <span>{trabajador.estado}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
