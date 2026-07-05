import Link from "next/link";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] p-6 text-gray-800">
      <div className="mx-auto max-w-5xl rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-indigo-600">Editar perfil</h1>
            <p className="mt-2 text-gray-600">Actualiza tu información personal y seguridad.</p>
          </div>
          <Link href="/dashboard" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
            Volver al dashboard
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          <div className="rounded-2xl bg-gray-50 p-6 text-center">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-indigo-100 text-3xl font-semibold text-indigo-700">
              U
            </div>
            <label className="inline-flex cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
              Subir foto
              <input type="file" className="hidden" accept="image/*" />
            </label>
            <p className="mt-3 text-sm text-gray-500">Formatos recomendados: JPG, PNG.</p>
          </div>

          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Nombre</label>
                <input className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-indigo-500" placeholder="Nombre" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Apellido</label>
                <input className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-indigo-500" placeholder="Apellido" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">RUT</label>
                <input className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-indigo-500" placeholder="12.345.678-9" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Teléfono</label>
                <input className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-indigo-500" placeholder="+56 9 1234 5678" />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Correo electrónico</label>
              <input type="email" className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-indigo-500" placeholder="usuario@correo.com" />
            </div>

            <div className="rounded-2xl border border-gray-200 p-4">
              <h2 className="mb-3 text-lg font-semibold text-gray-800">Cambiar contraseña</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Nueva contraseña</label>
                  <input type="password" className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-indigo-500" placeholder="••••••••" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Confirmar contraseña</label>
                  <input type="password" className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-indigo-500" placeholder="••••••••" />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700">
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
