import Link from "next/link";

export default function TiendasPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] text-gray-800">
      <main className="mx-auto max-w-4xl px-5 py-10">
        <section className="rounded-3xl border border-white/40 bg-white/60 p-8 shadow-[0_10px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <h1 className="mb-4 text-4xl font-semibold text-indigo-600">Tiendas</h1>
          <p className="mb-6 text-gray-700">
            Aquí puedes gestionar tus tiendas, ver su rendimiento y mantener actualizada la información de cada punto de venta.
          </p>
          <div className="grid gap-4 rounded-3xl bg-green-50 p-6 text-gray-700">
            <p className="font-medium">Funcionalidades principales:</p>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-7">
              <li>Agregar o editar tiendas.</li>
              <li>Revisar estado y ubicación.</li>
              <li>Monitorear crecimiento y desempeño.</li>
            </ul>
          </div>

          <section className="mt-8 grid gap-6 lg:grid-cols-3">
            <Link
              href="/tiendas/la-concepcion"
              className="group rounded-3xl border border-white/50 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
            >
              <h2 className="mb-2 text-2xl font-semibold text-emerald-700">La Concepción</h2>
              <p className="mb-3 text-sm text-gray-600">Ubicación céntrica con fuerte tráfico de clientes y excelente visibilidad.</p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="font-semibold">Estado:</li>
                <li>Abierta</li>
                <li>Ventas diarias estables</li>
              </ul>
              <span className="mt-4 inline-flex text-sm font-semibold text-emerald-700 transition group-hover:text-emerald-900">
                Ver tienda
              </span>
            </Link>

            <Link
              href="/tiendas/bilbao"
              className="group rounded-3xl border border-white/50 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
            >
              <h2 className="mb-2 text-2xl font-semibold text-emerald-700">Bilbao</h2>
              <p className="mb-3 text-sm text-gray-600">Tienda regional con buen desempeño en productos frescos y logística local optimizada.</p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="font-semibold">Estado:</li>
                <li>Abierta</li>
                <li>Inventario actualizado</li>
              </ul>
              <span className="mt-4 inline-flex text-sm font-semibold text-emerald-700 transition group-hover:text-emerald-900">
                Ver tienda
              </span>
            </Link>

            <Link
              href="/tiendas/providencia"
              className="group rounded-3xl border border-white/50 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
            >
              <h2 className="mb-2 text-2xl font-semibold text-emerald-700">Providencia</h2>
              <p className="mb-3 text-sm text-gray-600">Sucursal en zona residencial con creciente demanda y atención a calidad del servicio.</p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="font-semibold">Estado:</li>
                <li>Abierta</li>
                <li>Foco en fidelización</li>
              </ul>
              <span className="mt-4 inline-flex text-sm font-semibold text-emerald-700 transition group-hover:text-emerald-900">
                Ver tienda
              </span>
            </Link>
          </section>

          <Link href="/dashboard" className="mt-8 inline-flex rounded-full bg-green-500 px-6 py-3 text-white transition hover:bg-green-600">
            Volver al Panel
          </Link>
        </section>
      </main>
    </div>
  );
}
