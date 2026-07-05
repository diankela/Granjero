import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f5f5] p-5">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-2xl">
        <div className="mb-8 text-center">
          <img src="/granjero-1.png" alt="Granjero logo" className="mx-auto mb-4 h-28 w-auto" />
          <p className="text-sm text-gray-600">Sistema de Gestión de tiendas</p>
        </div>

        <form className="space-y-4">
          <div>
            <label htmlFor="username" className="mb-2 block text-sm font-medium text-gray-700">
              Usuario
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              placeholder="Ingresa tu usuario"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:bg-indigo-50"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Ingresa tu contraseña"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:bg-indigo-50"
            />
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4" />
              Recuérdame
            </label>
            <a href="#" className="text-indigo-600 hover:text-indigo-700">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <Link
            href="/dashboard"
            className="mt-2 flex w-full items-center justify-center rounded-lg bg-green-500 px-4 py-3 font-semibold text-white transition hover:-translate-y-0.5"
          >
            Iniciar Sesión
          </Link>
        </form>

        <div className="mt-6 border-t border-gray-200 pt-4 text-center text-sm text-gray-600">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Regístrate aquí
          </Link>
        </div>
      </div>
    </main>
  );
}
