"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const features = [
  {
    title: "Tiendas",
    href: "/tiendas",
    description:
      "Gestiona todos tiendas, monitorea su crecimiento y organizalas.",
  },
  {
    title: "Compras",
    href: "/compras",
    description:
      "Control de compras. Optimiza los recursos.",
  },
  {
    title: "Despacho",
    href: "/despacho",
    description:
      "Visualiza reportes detallados sobre las entregas a cada tienda.",
  },
  {
    title: "Bodega",
    href: "/bodega",
    description:
      "Gestiona el flujo de productos, almacena información y coordina los movimientos internos.",
  },
  {
    title: "Recursos Humanos",
    href: "/recursos-humanos",
    description:
      "Administra el personal, roles, asignaciones y estado de los trabajadores.",
  },
];

// Validacion de infomración del usuario

type UsuarioPerfil = {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: string;
  activo: string;
};

export default function DashboardPage() {

   const router = useRouter();
    const [usuario, setUsuario] = useState<UsuarioPerfil | null>(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
    async function cargarUsuario() {
      try {
        if (!supabase) {
          router.push("/login");
          return;
        }

        const { data, error } = await supabase.auth.getUser();

        if (error || !data.user?.email) {
          router.push("/login");
          return;
        }

        const response = await fetch("/api/auth/perfil", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            correo: data.user.email,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          await supabase.auth.signOut();
          router.push("/login");
          return;
        }

        if (result.data.rol === "VENDEDOR") {
          router.push("/bodega/pedidos-tienda");
          return;
        }

        if (result.data.rol !== "ADMINISTRADOR") {
          await supabase.auth.signOut();
          router.push("/login");
          return;
        }
        setUsuario(result.data);
      } catch (error) {
        console.error(error);
        router.push("/login");
      } finally {
        setCargando(false);
      }
    }

    cargarUsuario();
  }, [router]);

  async function cerrarSesion() {
    if (supabase) {
      await supabase.auth.signOut();
    }

    router.push("/login");
  }

  const nombreUsuario = usuario
    ? `${usuario.nombre} ${usuario.apellido}`
    : "Usuario";

  const inicialUsuario = usuario?.nombre
    ? usuario.nombre.charAt(0).toUpperCase()
    : "U";

  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f5f5]">
        <p className="text-gray-600">Cargando sesión...</p>
      </main>
    );
  }

  return (
    
    // _______________________________________HEADER_____________________________________________________________________
   

    
    <div className="min-h-screen bg-[#f5f5f5] text-gray-800">
      <header className="relative overflow-hidden bg-transparent px-8 pb-6 pt-6 text-white">
        <nav className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/granjero-1.png" alt="Granjero logo" className="h-20 w-auto" />
          </div>
          <div className="flex items-center gap-4">
            <Link
          href="/profile"
          className="flex items-center gap-3 rounded-full bg-emerald-500 px-3 py-2 text-white shadow-sm transition hover:bg-emerald-600"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 font-bold text-white">
            {inicialUsuario}
          </div>

          <span className="font-medium">{nombreUsuario}</span>
        </Link>

        <button
          type="button"
          onClick={cerrarSesion}
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-600"
        >
          Cerrar Sesión
        </button>
          </div>
        </nav>
      </header>

{/* _________________________________________________________________________________________________________________________________ */}
{/* ________________________________________BOX BIENVENIDA____________________________________________________________________________________ */}

      <main className="mx-auto max-w-7xl px-5 py-10">
        <section className="box1-glass mb-8 rounded-2xl border border-white/40 bg-white/40 p-8 shadow-[0_8px_32px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <h2 className="mb-3 text-3xl font-semibold text-black-200">
            ¡Bienvenido, {usuario?.nombre}!
          </h2>
          <p className="max-w-2xl text-gray-700">
            Has iniciado sesión correctamente en el sistema de gestión Granjero. Desde aquí puedes acceder a todas las funcionalidades de la plataforma.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="group rounded-2xl border border-white/50 bg-white/50 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.10)] backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-[0_12px_35px_rgba(15,23,42,0.16)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-300"
            >
              {/* <div className="mb-4 text-4xl">{feature.icon}</div> */}
              <h3 className="mb-2 text-xl font-semibold text-black-600">{feature.title}</h3>
              <p className="text-sm leading-6 text-gray-600">{feature.description}</p>
              <p className="mt-6 text-sm font-semibold text-gray-700 transition group-hover:text-gray-900">
                Ir a {feature.title}
              </p>
            </Link>
          ))}
        </section>
      </main>
      <footer className="bg-green-700 px-8 py-8 text-white shadow-inner shadow-emerald-700/20">
        <div className="mx-auto max-w-7xl space-y-3 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-100">Granjero</p>
          <p className="max-w-2xl mx-auto text-sm text-emerald-100/90">
            Plataforma de gestión interna.
          </p>
          <p className="text-xs text-emerald-200/90">© 2026 Kent. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
