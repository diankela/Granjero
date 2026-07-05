import Link from "next/link";

export default function InventarioPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] text-gray-800">
      <main className="mx-auto max-w-4xl px-5 py-10">
        <section className="rounded-3xl border border-white/40 bg-white/60 p-8 shadow-[0_10px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <h1 className="mb-4 text-4xl font-semibold text-indigo-600">Inventario</h1>
          <p className="mb-6 text-gray-700">
            Controla los niveles de inventario y asegúrate de que los recursos estén disponibles cuando más los necesites.
          </p>
          <div className="grid gap-4 rounded-3xl bg-green-50 p-6 text-gray-700">
            <p className="font-medium">Seguimiento de inventario:</p>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-7">
              <li>Rastrear existencias de productos y materiales.</li>
              <li>Generar alertas cuando algo baja de stock.</li>
              <li>Optimizar reposición y rotación de inventario.</li>
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
