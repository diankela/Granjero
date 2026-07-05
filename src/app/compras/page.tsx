import Link from "next/link";

export default function ComprasPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] text-gray-800">
      <main className="mx-auto max-w-4xl px-5 py-10">
        <section className="rounded-3xl border border-white/40 bg-white/60 p-8 shadow-[0_10px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <h1 className="mb-4 text-4xl font-semibold text-indigo-600">Compras</h1>
          <p className="mb-6 text-gray-700">
            Gestiona las compras de insumos y materiales necesarios para mantener tus operaciones agrícolas en marcha.
          </p>
          <div className="grid gap-4 rounded-3xl bg-green-50 p-6 text-gray-700">
            <p className="font-medium">Control de compras:</p>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-7">
              <li>Registrar proveedores y órdenes de compra.</li>
              <li>Verificar entregas y costos.</li>
              <li>Optimizar recursos según demanda.</li>
            </ul>
          </div>
          <Link href="/dashboard" className="mt-8 inline-flex rounded-full bg-green-500 px-6 py-3 text-white transition hover:bg-green-600">
            Volver al Panel
          </Link>
        </section>
      </main>
    </div>
  );
}
