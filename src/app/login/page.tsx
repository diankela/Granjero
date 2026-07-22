
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function LoginPage() {

const router = useRouter();
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");
const [cargando, setCargando] = useState(false);
const [mostrarPassword, setMostrarPassword] = useState(false);

async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();

  setError("");
  setCargando(true);

  try {
    if (!supabase) {
      throw new Error("Supabase no está configurado correctamente.");
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      throw new Error("Correo o contraseña incorrectos.");
    }

    const perfilResponse = await fetch("/api/auth/perfil", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ correo: email }),
    });

    const perfilResult = await perfilResponse.json();

    if (!perfilResponse.ok) {
      await supabase.auth.signOut();
      throw new Error(perfilResult.error || "No tienes acceso al sistema.");
    }

    const rolUsuario = perfilResult.data?.rol;

    if (rolUsuario === "VENDEDOR") {
      router.push("/pedidos-tienda");
      return;
    }

    if (rolUsuario === "ADMINISTRADOR") {
      router.push("/dashboard");
      return;
    }

  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : "Error al iniciar sesión."
    );
  } finally {
    setCargando(false);
  }
}
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f5f5] p-5">
      <div className="login-glass w-full max-w-md rounded-2xl p-10">
        <div className="mb-8 text-center">
          <img src="/granjero-1.png" alt="Granjero logo" className="mx-auto mb-4 h-28 w-auto" />
          <p className="text-sm text-gray-600">Sistema de Gestión de tiendas</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Ingresa tu correo"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none transition focus:border-green-500 focus:bg-green-50"
            />
          </div>

          <div>
  <label
    htmlFor="password"
    className="mb-2 block text-sm font-medium text-gray-700"
  >
    Contraseña
  </label>

  <div className="relative">
    <input
      id="password"
      name="password"
      type={mostrarPassword ? "text" : "password"}
      required
      value={password}
      onChange={(event) => setPassword(event.target.value)}
      placeholder="Ingresa tu contraseña"
      className="w-full rounded-lg border border-gray-200 px-4 py-3 pr-12 outline-none transition focus:border-green-500 focus:bg-green-50"
    />

    <button
      type="button"
      onClick={() => setMostrarPassword((prev) => !prev)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-gray-700"
      aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
    >
      {mostrarPassword ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3l18 18M10.584 10.587A2 2 0 0012 14a2 2 0 001.414-3.414M9.88 4.24A10.96 10.96 0 0112 4c5 0 9 4 10 8a11.75 11.75 0 01-4.113 5.558M6.228 6.228A11.75 11.75 0 002 12c.713 2.852 4.36 8 10 8a10.96 10.96 0 004.04-.76"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"
          />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  </div>
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
            <button
              type="submit"
              disabled={cargando}
              className="mt-2 flex w-full items-center justify-center rounded-lg bg-green-500 px-4 py-3 font-semibold text-white transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              {cargando ? "Ingresando..." : "Iniciar Sesión"}
            </button>
            {error ? (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </p>
            ) : null}
         
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
