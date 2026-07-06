"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type TrabajadorEditar = {
  id_usuario?: number;
  rut: string;
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  direccion: string;
  rol: string;
  tienda: string;
  estado: string;
  asignacion?: string;
};

export default function EditarTrabajadorPage() {
  const params = useParams();
  const router = useRouter();
  const rutParam = Array.isArray(params?.rut) ? params.rut[0] : params?.rut;

  const [trabajador, setTrabajador] = useState<TrabajadorEditar | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const cargarTrabajador = async () => {
      if (!rutParam) return;

      try {
        const response = await fetch("/api/trabajadores", { cache: "no-store" });
        const result = await response.json();

        if (response.ok && Array.isArray(result.data)) {
          const encontrado = result.data.find((item: TrabajadorEditar) => item.rut === rutParam);
          if (encontrado) {
            setTrabajador({
              ...encontrado,
              id_usuario: encontrado.id_usuario,
              asignacion: encontrado.tienda,
            });
          }
        }
      } catch {
        setMessage("No se pudo cargar el trabajador.");
      } finally {
        setIsLoading(false);
      }
    };

    cargarTrabajador();
  }, [rutParam]);

  const handleChange = (field: keyof TrabajadorEditar, value: string) => {
    setTrabajador((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!trabajador) return;

    setIsSaving(true);
    setMessage("");

    try {
      const payload = {
        ...trabajador,
        asignacion: trabajador.tienda === "Sin asignación" ? null : trabajador.tienda,
      };

      const response = await fetch(`/api/trabajadores/${rutParam}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("No se pudo actualizar el trabajador");
      }

      setMessage("Trabajador actualizado correctamente");
      router.push(`/recursos-humanos/${rutParam}`);
    } catch {
      setMessage("Error al actualizar el trabajador");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#f5f5f5] p-10 text-gray-700">Cargando...</div>;
  }

  if (!trabajador) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] p-10 text-gray-700">
        No se encontró el trabajador.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-gray-800">
      <main className="mx-auto max-w-5xl px-5 py-10">
        <section className="rounded-3xl border border-white/40 bg-white/80 p-8 shadow-[0_10px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <Link href="/recursos-humanos" className="mb-6 inline-flex text-sm font-semibold text-emerald-700 transition hover:text-emerald-900">
            ← Volver a gestión de personal
          </Link>

          <div className="mb-8">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Recursos Humanos</p>
            <h1 className="text-4xl font-semibold text-emerald-700">Editar trabajador</h1>
            <p className="mt-3 max-w-2xl text-gray-700">Actualiza los datos del trabajador seleccionado.</p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <h2 className="mb-4 text-xl font-semibold text-gray-800">Datos personales</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">RUT</label>
                  <input
                    value={trabajador.rut}
                    onChange={(event) => handleChange("rut", event.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Nombre</label>
                  <input
                    value={trabajador.nombre}
                    onChange={(event) => handleChange("nombre", event.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Apellido</label>
                  <input
                    value={trabajador.apellido}
                    onChange={(event) => handleChange("apellido", event.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Teléfono</label>
                  <input
                    value={trabajador.telefono}
                    onChange={(event) => handleChange("telefono", event.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Correo</label>
                  <input
                    value={trabajador.correo}
                    onChange={(event) => handleChange("correo", event.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Dirección</label>
                  <input
                    value={trabajador.direccion}
                    onChange={(event) => handleChange("direccion", event.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-emerald-50 p-6">
              <h2 className="mb-4 text-xl font-semibold text-emerald-800">Datos laborales</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Rol</label>
                  <select
                    value={trabajador.rol}
                    onChange={(event) => handleChange("rol", event.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                  >
                    <option value="ADMINISTRADOR">Administrador</option>
                    <option value="ENCARGADO_TIENDA">Encargado de Tienda</option>
                    <option value="VENDEDOR">Vendedor</option>
                    <option value="BODEGA">Bodega</option>
                    <option value="ENVASADO">Envasado</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Asignación</label>
                  <select
                    value={trabajador.tienda}
                    onChange={(event) => handleChange("tienda", event.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                  >
                    <option value="Sin asignación">Sin asignación</option>
                    <option value="La Concepción">La Concepción</option>
                    <option value="Bilbao">Bilbao</option>
                    <option value="Providencia">Providencia</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Estado</label>
                  <select
                    value={trabajador.estado}
                    onChange={(event) => handleChange("estado", event.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
              >
                {isSaving ? "Guardando..." : "Guardar cambios"}
              </button>
              <Link
                href={`/recursos-humanos/${rutParam}`}
                className="rounded-full border border-emerald-200 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
              >
                Cancelar
              </Link>
            </div>

            {message ? (
              <div className="lg:col-span-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {message}
              </div>
            ) : null}
          </form>
        </section>
      </main>
    </div>
  );
}
