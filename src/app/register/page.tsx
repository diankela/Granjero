import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,_#667eea_0%,_#764ba2_100%)] p-5">
      <div className="w-full max-w-lg rounded-2xl bg-white p-10 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-indigo-600">🌾 Granjero</h1>
          <p className="mt-2 text-sm text-gray-600">Crear Nueva Cuenta</p>
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
              placeholder="Elige un usuario"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:bg-indigo-50"
            />
          </div>

          <div>
            <label htmlFor="first_name" className="mb-2 block text-sm font-medium text-gray-700">
              Nombre Completo
            </label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              placeholder="Tu nombre completo"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:bg-indigo-50"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
              Correo Electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="tu@correo.com"
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
              placeholder="Mínimo 8 caracteres"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:bg-indigo-50"
            />
          </div>

          <div>
            <label htmlFor="password_confirm" className="mb-2 block text-sm font-medium text-gray-700">
              Confirmar Contraseña
            </label>
            <input
              id="password_confirm"
              name="password_confirm"
              type="password"
              required
              placeholder="Repite la contraseña"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:bg-indigo-50"
            />
          </div>

          <Link
            href="/dashboard"
            className="mt-2 flex w-full items-center justify-center rounded-lg bg-[linear-gradient(135deg,_#667eea_0%,_#764ba2_100%)] px-4 py-3 font-semibold text-white transition hover:-translate-y-0.5"
          >
            Crear Cuenta
          </Link>
        </form>

        <div className="mt-6 border-t border-gray-200 pt-4 text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </main>
  );
}
