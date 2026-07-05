import Link from "next/link";

export default function LaConcepcionPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] text-gray-900">
      <main className="mx-auto max-w-4xl px-5 py-10">
        <section className="rounded-3xl border border-white/40 bg-white/60 p-8 shadow-[0_10px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <h1 className="mb-4 text-4xl font-semibold text-emerald-700">La Concepción</h1>
          <p className="mb-6 text-gray-700">Sucursal céntrica con fuerte tráfico y alta visibilidad. Ideal para ventas de impulso y atención personalizada.</p>
          <div className="grid gap-4 rounded-3xl bg-green-50 p-6 text-gray-700">
            <p className="font-semibold">Detalles de la tienda:</p>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-7">
              <li>Sector: Centro urbano</li>
              <li>Estado: Abierta</li>
              <li>Inventario: Alta rotación</li>
            </ul>
          </div>
          <Link href="/tiendas" className="mt-8 inline-flex rounded-full bg-emerald-600 px-6 py-3 text-white transition hover:bg-emerald-700">
            Volver a Tiendas
          </Link>
        </section>
      </main>
    </div>
  );
}
