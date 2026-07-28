"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Producto = {
  id_producto: number;
  codigo: string;
  nombre: string;
  unidad_medida: string;
};

type Trabajador = {
  id_usuario: number;
  nombre: string;
  apellido: string;
  rol: string;
  estado?: string;
};

type TareaEnvasado = {
  id_envasado: number;
  productos_id_producto: number;
  usuario_id_usuario: number;
  producto: string;
  codigo_producto: string;
  unidad_medida: string;
  trabajador: string;
  rol: string;
  cantidad_objetivo: number;
  cantidad_completada: number;
  avance: number;
  estado: string;
  observacion: string | null;
  creado_en: string;
  iniciado_en: string | null;
  finalizado_en: string | null;
};

type UsuarioPerfil = {
  id_usuario: number;
  tiendas_id_tienda?: number | null;
  nombre: string;
  apellido: string;
  correo: string;
  rol: string;
  activo: string;
};

const initialForm = {
  productos_id_producto: "",
  usuario_id_usuario: "",
  cantidad_objetivo: "",
  observacion: "",
};

const initialAvanceForm = {
  cantidad_agregada: "",
};

export default function EnvasadoPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<UsuarioPerfil | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [tareas, setTareas] = useState<TareaEnvasado[]>([]);
  const [form, setForm] = useState(initialForm);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [tareaSeleccionada, setTareaSeleccionada] =
    useState<TareaEnvasado | null>(null);

  const [avanceForm, setAvanceForm] = useState(initialAvanceForm);
  const [registrandoAvance, setRegistrandoAvance] = useState(false);



  async function cargarDatos() {
    try {
      setCargando(true);
      setError("");

      const [productosRes, trabajadoresRes, envasadoRes] = await Promise.all([
        fetch("/api/productos"),
        fetch("/api/trabajadores"),
        fetch("/api/envasado"),
      ]);

      const productosJson = await productosRes.json();
      const trabajadoresJson = await trabajadoresRes.json();
      const envasadoJson = await envasadoRes.json();

      if (!productosRes.ok) {
        throw new Error(productosJson.error || "Error al cargar productos");
      }

      if (!trabajadoresRes.ok) {
        throw new Error(
          trabajadoresJson.error || "Error al cargar trabajadores"
        );
      }

      if (!envasadoRes.ok) {
        throw new Error(
          envasadoJson.error || "Error al cargar tareas de envasado"
        );
      }

      setProductos(productosJson.data || []);
      setTrabajadores(trabajadoresJson.data || []);
      setTareas(envasadoJson.data || []);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error al cargar información"
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    async function iniciarVista() {
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

        const perfil = result.data as UsuarioPerfil;
        const rol = perfil.rol;

        if (rol === "VENDEDOR") {
          router.push("/bodega/pedidos-tienda");
          return;
        }

        if (rol === "OPERADOR" || rol === "JEFE_OPERACIONES") {
          router.push("/bodega/pedidos-reposicion");
          return;
        }

        if (rol !== "ENVASADO" && rol !== "ADMINISTRADOR") {
          await supabase.auth.signOut();
          router.push("/login");
          return;
        }

        setUsuario(perfil);
        await cargarDatos();
      } catch (error) {
        console.error(error);
        router.push("/login");
      }
    }

    iniciarVista();
  }, [router]);

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMensaje("");

    if (!form.productos_id_producto) {
      setError("Debes seleccionar un producto.");
      return;
    }

    if (!form.usuario_id_usuario) {
      setError("Debes seleccionar un trabajador.");
      return;
    }

    if (!form.cantidad_objetivo || Number(form.cantidad_objetivo) <= 0) {
      setError("La cantidad objetivo debe ser mayor a cero.");
      return;
    }

    try {
      setGuardando(true);

      const response = await fetch("/api/envasado", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productos_id_producto: Number(form.productos_id_producto),
          usuario_id_usuario: Number(form.usuario_id_usuario),
          cantidad_objetivo: Number(form.cantidad_objetivo),
          observacion: form.observacion,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al crear tarea de envasado");
      }

      setMensaje("Tarea de envasado creada correctamente.");
      setForm(initialForm);
      await cargarDatos();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Error al crear tarea de envasado"
      );
    } finally {
      setGuardando(false);
    }
  }

  function abrirFormularioAvance(tarea: TareaEnvasado) {
    setTareaSeleccionada(tarea);
    setAvanceForm(initialAvanceForm);
    setError("");
    setMensaje("");
  }

  async function registrarAvance(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!tareaSeleccionada) {
      setError("Debes seleccionar una tarea.");
      return;
    }

    if (
      !avanceForm.cantidad_agregada ||
      Number(avanceForm.cantidad_agregada) <= 0
    ) {
      setError("La cantidad agregada debe ser mayor a cero.");
      return;
    }

    try {
      setRegistrandoAvance(true);
      setError("");
      setMensaje("");

      const response = await fetch("/api/envasado/avance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          envasado_id_envasado: tareaSeleccionada.id_envasado,
          usuario_id_usuario: tareaSeleccionada.usuario_id_usuario,
          cantidad_agregada: Number(avanceForm.cantidad_agregada),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al registrar avance");
      }

      setMensaje("Avance registrado correctamente.");
      setTareaSeleccionada(null);
      setAvanceForm(initialAvanceForm);

      await cargarDatos();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error al registrar avance"
      );
    } finally {
      setRegistrandoAvance(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 px-8 py-10">
      <section className="mx-auto max-w-7xl rounded-3xl bg-white p-10 shadow-sm">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
        >
          ← Volver
        </button>
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.3em] text-emerald-600">
          Envasado
        </p>

        <h1 className="mb-4 text-5xl font-bold text-emerald-700">
          Control de envasado
        </h1>

        <div className="mb-10 rounded-2xl border border-emerald-100 bg-emerald-50 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Vista de avance
          </p>

          <h2 className="mt-2 text-2xl font-bold text-gray-800">
            Tareas asignadas al área de envasado
          </h2>

          <p className="mt-3 max-w-3xl text-gray-600">
            En esta vista solo se revisan las tareas activas y se registra el avance
            real de paquetes completados. La creación de nuevas tareas será gestionada
            desde la vista del operador.
          </p>
        </div>
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Tareas de envasado
            </h2>
          </div>

          {cargando ? (
            <p className="p-6 text-gray-600">Cargando tareas...</p>
          ) : tareas.length === 0 ? (
            <p className="p-6 text-gray-600">
              Todavía no hay tareas de envasado registradas.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-emerald-50 text-emerald-800">
                  <tr>
                    <th className="px-6 py-4">Producto</th>
                    <th className="px-6 py-4">Trabajador</th>
                    <th className="px-6 py-4">Objetivo</th>
                    <th className="px-6 py-4">Completado</th>
                    <th className="px-6 py-4">Avance</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {tareas.map((tarea) => (
                    <tr
                      key={tarea.id_envasado}
                      className="border-t border-gray-100"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-800">
                          {tarea.producto}
                        </p>
                        <p className="text-sm text-gray-500">
                          {tarea.codigo_producto}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">
                          {tarea.trabajador}
                        </p>
                        <p className="text-sm text-gray-500">{tarea.rol}</p>
                      </td>

                      <td className="px-6 py-4">
                        {tarea.cantidad_objetivo} unidades
                      </td>

                      <td className="px-6 py-4">
                        {tarea.cantidad_completada} unidades
                      </td>

                      <td className="px-6 py-4">
                        <div className="mb-1 h-2 w-32 rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-emerald-500"
                            style={{
                              width: `${Math.min(tarea.avance, 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">
                          {tarea.avance}%
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700">
                          {tarea.estado}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {usuario?.rol === "ENVASADO" &&
                          tarea.estado !== "FINALIZADA" &&
                          tarea.estado !== "CANCELADA" ? (
                          <button
                            type="button"
                            onClick={() => abrirFormularioAvance(tarea)}
                            className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-600"
                          >
                            Agregar avance
                          </button>
                        ) : (
                          <span className="text-sm text-gray-500">
                            Solo supervisión
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tareaSeleccionada ? (
            <div className="border-t border-gray-200 bg-gray-50 p-6">
              <h3 className="mb-4 text-xl font-bold text-gray-800">
                Registrar avance
              </h3>

              <p className="mb-4 text-gray-600">
                Producto: <strong>{tareaSeleccionada.producto}</strong> |
                Trabajador: <strong>{tareaSeleccionada.trabajador}</strong>
              </p>

              <p className="mb-4 text-gray-600">
                Objetivo: {tareaSeleccionada.cantidad_objetivo}{" "}
                {tareaSeleccionada.unidad_medida} | Completado actual:{" "}
                {tareaSeleccionada.cantidad_completada}{" "}
                {tareaSeleccionada.unidad_medida}
              </p>

              <form
                onSubmit={registrarAvance}
                className="grid gap-4 md:grid-cols-2"
              >
                <div>
                  <label className="mb-2 block font-medium text-gray-700">
                    Cantidad agregada
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={avanceForm.cantidad_agregada}
                    onChange={(event) =>
                      setAvanceForm((prev) => ({
                        ...prev,
                        cantidad_agregada: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-emerald-500"
                    placeholder="Ej: 10"
                  />
                </div>



                <div className="flex items-end gap-3">
                  <button
                    type="submit"
                    disabled={registrandoAvance}
                    className="rounded-full bg-emerald-500 px-6 py-3 font-bold text-white hover:bg-emerald-600 disabled:opacity-60"
                  >
                    {registrandoAvance ? "Registrando..." : "Guardar avance"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setTareaSeleccionada(null)}
                    className="rounded-full border border-gray-300 px-6 py-3 font-bold text-gray-600 hover:bg-gray-100"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          ) : null}
        </section>
      </section>
    </main>
  );
}