import Link from "next/link";

export default function BodegaPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] text-gray-800">
      <main className="mx-auto max-w-4xl px-5 py-10">
        <section className="rounded-3xl border border-white/40 bg-white/60 p-8 shadow-[0_10px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <h1 className="mb-4 text-4xl font-semibold text-indigo-600">Bodega</h1>
          <p className="mb-6 text-gray-700">
            Controla el inventario, coordina al equipo y supervisa el estado de los productos en la bodega.
          </p>
          <div className="grid gap-4 rounded-3xl bg-green-50 p-6 text-gray-700">
            <p className="font-medium">Funciones disponibles:</p>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-7">
              <li>Administrar recepción y almacenamiento.</li>
              <li>Asignar tareas de recolección y despacho.</li>
              <li>Monitorear productividad del equipo.</li>
            </ul>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Link href="/bodega/envasado" className="rounded-2xl border border-green-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <h2 className="mb-2 text-lg font-semibold text-green-700">Envasado</h2>
              <p className="text-sm text-gray-600">Gestiona tareas, asignaciones y avance del proceso de envasado.</p>
            </Link>
            <Link href="/bodega/inventario" className="rounded-2xl border border-green-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <h2 className="mb-2 text-lg font-semibold text-green-700">Inventario</h2>
              <p className="text-sm text-gray-600">Controla stock y movimientos de productos en bodega.</p>
            </Link>
          </div>

          <Link href="/dashboard" className="mt-8 inline-flex rounded-full bg-green-500 px-6 py-3 text-white transition hover:bg-green-600">
            Volver al Panel
          </Link>
        </section>
      </main>
    </div>
  );
}
