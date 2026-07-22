"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Rol = {
  id_rol: number;
  nombre: string;
  activo: string;
};

type FormValues = {
  rut: string;
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  direccion: string;
  rol: string;
  asignacion: string;
  estado: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  rut: "",
  nombre: "",
  apellido: "",
  telefono: "",
  correo: "",
  direccion: "",
  rol: "",
  asignacion: "",
  estado: "",
};

export default function AgregarTrabajadorPage() {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [cargandoRoles, setCargandoRoles] = useState(true);
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitMessage, setSubmitMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingUsers, setExistingUsers] = useState<Array<{ rut: string; correo: string }>>([]);
  const [popup, setPopup] = useState<{ open: boolean; type: "success" | "error"; message: string }>({
    open: false,
    type: "success",
    message: "",
  });
  const [mostrarNuevoRol, setMostrarNuevoRol] = useState(false);
  const [nuevoRol, setNuevoRol] = useState("");
  const [guardandoRol, setGuardandoRol] = useState(false);
  const [errorRol, setErrorRol] = useState("");

  const handleChange = (field: keyof FormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setSubmitMessage("");
  };

  useEffect(() => {
    const fetchExistingUsers = async () => {
      try {
        const response = await fetch("/api/trabajadores");
        const result = await response.json();

        if (response.ok && Array.isArray(result.data)) {
          setExistingUsers(
            result.data.map((user: { rut: string; correo: string }) => ({
              rut: user.rut,
              correo: user.correo,
            }))
          );
        }
      } catch {
        setExistingUsers([]);
      }
    };

    fetchExistingUsers();
  }, []);

  useEffect(() => {
    cargarRoles();
  }, []);

  useEffect(() => {
    if (!popup.open) {
      return;
    }

    const timer = window.setTimeout(() => {
      setPopup({ open: false, type: "success", message: "" });
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [popup.open, popup.message]);

  const validate = () => {
    const nextErrors: FormErrors = {};
    const rutNormalizado = values.rut.trim().toUpperCase();
    const correoNormalizado = values.correo.trim().toLowerCase();
    const rutExistente = existingUsers.some((user) => user.rut.toUpperCase() === rutNormalizado);
    const correoExistente = existingUsers.some((user) => user.correo.toLowerCase() === correoNormalizado);

    if (!values.rut.trim()) {
      nextErrors.rut = "El RUT es obligatorio.";
    } else if (values.rut.trim().length > 9) {
      nextErrors.rut = "El RUT no puede superar los 9 caracteres.";
    } else if (rutExistente) {
      nextErrors.rut = "Este RUT ya está registrado.";
    }

    if (!values.nombre.trim()) {
      nextErrors.nombre = "El nombre es obligatorio.";
    }

    if (!values.apellido.trim()) {
      nextErrors.apellido = "El apellido es obligatorio.";
    }

    if (!values.telefono.trim()) {
      nextErrors.telefono = "El teléfono es obligatorio.";
    } else if (!/^\d{9}$/.test(values.telefono.trim())) {
      nextErrors.telefono = "El teléfono debe tener 9 dígitos.";
    }

    if (!values.correo.trim()) {
      nextErrors.correo = "El correo es obligatorio.";
    } else if (correoExistente) {
      nextErrors.correo = "Este correo ya está registrado.";
    }

    if (!values.rol) {
      nextErrors.rol = "Debes seleccionar un rol.";
    }

    const rolesConTienda = ["VENDEDOR", "ENCARGADO_TIENDA"];

    if (rolesConTienda.includes(values.rol) && !values.asignacion) {
      nextErrors.asignacion = "Debes seleccionar una tienda para este rol.";
    }

    if (!values.estado) {
      nextErrors.estado = "Debes seleccionar un estado.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const payload = {
        rut: values.rut.trim().toUpperCase(),
        nombre: values.nombre.trim(),
        apellido: values.apellido.trim(),
        telefono: values.telefono.trim(),
        correo: values.correo.trim().toLowerCase(),
        direccion: values.direccion.trim(),
        rol: values.rol.trim().toUpperCase(),
        asignacion: values.asignacion || undefined,
        estado: values.estado === "Inactivo" ? "N" : "S",
      };

      const response = await fetch("/api/trabajadores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "No se pudo guardar el trabajador");
      }

      const successMessage = "usuario agregado correctamente";
      setSubmitMessage(successMessage);
      setPopup({ open: true, type: "success", message: successMessage });
      setExistingUsers((prev) => [
        ...prev,
        { rut: result.data?.rut || values.rut.trim().toUpperCase(), correo: result.data?.correo || values.correo.trim().toLowerCase() },
      ]);
      setValues(initialValues);
    } catch (error) {
      const errorMessage = "error, usuario no agregado";
      setSubmitMessage(errorMessage);
      setPopup({ open: true, type: "error", message: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  async function cargarRoles() {
  try {
    setCargandoRoles(true);

    const response = await fetch("/api/roles");
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Error al cargar roles.");
    }

    setRoles(result.data || []);
  } catch (error) {
    console.error(error);
  } finally {
    setCargandoRoles(false);
  }
}

async function guardarNuevoRol() {
  setErrorRol("");

  const nombreRol = nuevoRol.trim().toUpperCase().replaceAll(" ", "_");

  if (!nombreRol) {
    setErrorRol("Debes ingresar un nombre para el rol.");
    return;
  }

  try {
    setGuardandoRol(true);

    const response = await fetch("/api/roles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre: nombreRol,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Error al crear el rol.");
    }

    setRoles((prev) => [...prev, result.data]);
    handleChange("rol", result.data.nombre);
    setNuevoRol("");
    setMostrarNuevoRol(false);
  } catch (error) {
    setErrorRol(
      error instanceof Error
        ? error.message
        : "Error al crear el rol."
    );
  } finally {
    setGuardandoRol(false);
  }
}

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-gray-800">
      <main className="mx-auto max-w-5xl px-5 py-10">
        <section className="rounded-3xl border border-white/40 bg-white/80 p-8 shadow-[0_10px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <Link
            href="/recursos-humanos"
            className="mb-6 inline-flex text-sm font-semibold text-emerald-700 transition hover:text-emerald-900"
          >
            ← Volver a gestión de personal
          </Link>

          <div className="mb-8">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Recursos Humanos
            </p>
            <h1 className="text-4xl font-semibold text-emerald-700">Agregar trabajador</h1>
            <p className="mt-3 max-w-2xl text-gray-700">
              Completa los datos para registrar un nuevo trabajador en la plataforma.
            </p>
          </div>

          <form className="grid gap-6 lg:grid-cols-2" onSubmit={handleSubmit}>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <h2 className="mb-4 text-xl font-semibold text-gray-800">Datos personales</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">RUT</label>
                  <input
                    value={values.rut}
                    onChange={(event) => handleChange("rut", event.target.value)}
                    type="text"
                    maxLength={9}
                    placeholder="Ej: 156730824"
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:border-emerald-500 ${errors.rut ? "border-red-400" : "border-gray-300"}`}
                  />
                  {errors.rut ? <p className="mt-1 text-sm text-red-500">{errors.rut}</p> : null}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Nombre</label>
                  <input
                    value={values.nombre}
                    onChange={(event) => handleChange("nombre", event.target.value)}
                    type="text"
                    placeholder="Ej: Juan"
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:border-emerald-500 ${errors.nombre ? "border-red-400" : "border-gray-300"}`}
                  />
                  {errors.nombre ? <p className="mt-1 text-sm text-red-500">{errors.nombre}</p> : null}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Apellido</label>
                  <input
                    value={values.apellido}
                    onChange={(event) => handleChange("apellido", event.target.value)}
                    type="text"
                    placeholder="Ej: Pérez"
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:border-emerald-500 ${errors.apellido ? "border-red-400" : "border-gray-300"}`}
                  />
                  {errors.apellido ? <p className="mt-1 text-sm text-red-500">{errors.apellido}</p> : null}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Teléfono</label>
                  <input
                    value={values.telefono}
                    onChange={(event) => handleChange("telefono", event.target.value)}
                    type="tel"
                    maxLength={9}
                    placeholder="Ej: 987654321"
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:border-emerald-500 ${errors.telefono ? "border-red-400" : "border-gray-300"}`}
                  />
                  {errors.telefono ? <p className="mt-1 text-sm text-red-500">{errors.telefono}</p> : null}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Correo</label>
                  <input
                    value={values.correo}
                    onChange={(event) => handleChange("correo", event.target.value)}
                    type="email"
                    placeholder="Ej: trabajador@granjero.cl"
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:border-emerald-500 ${errors.correo ? "border-red-400" : "border-gray-300"}`}
                  />
                  {errors.correo ? <p className="mt-1 text-sm text-red-500">{errors.correo}</p> : null}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Dirección</label>
                  <input
                    value={values.direccion}
                    onChange={(event) => handleChange("direccion", event.target.value)}
                    type="text"
                    placeholder="Ej: Av. Principal 123"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-emerald-50 p-6">
              <h2 className="mb-4 text-xl font-semibold text-emerald-800">Datos laborales</h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="rol"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Rol
                  </label>

                  <select
                    id="rol"
                    value={values.rol}
                    onChange={(event) => handleChange("rol", event.target.value)}
                    disabled={cargandoRoles}
                    className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500 disabled:bg-gray-100 ${
                      errors.rol ? "border-red-400" : "border-gray-300"
                    }`}
                  >
                    <option value="">
                      {cargandoRoles ? "Cargando roles..." : "Selecciona un rol"}
                    </option>

                    {roles.map((rol) => (
                      <option key={rol.id_rol} value={rol.nombre}>
                        {rol.nombre.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>

                  {errors.rol ? (
                    <p className="mt-1 text-sm text-red-500">{errors.rol}</p>
                  ) : null}

                  <div className="mt-3">
  {!mostrarNuevoRol ? (
    <button
      type="button"
      onClick={() => {
        setMostrarNuevoRol(true);
        setErrorRol("");
      }}
      className="text-sm font-semibold text-emerald-700 transition hover:text-emerald-900"
    >
      + Agregar nuevo rol
    </button>
  ) : (
    <div className="rounded-xl border border-emerald-200 bg-white p-4">
      <label className="mb-2 block text-sm font-medium text-gray-700">
        Nuevo rol
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={nuevoRol}
          onChange={(event) => setNuevoRol(event.target.value)}
          placeholder="Ej: Supervisor bodega"
          className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
        />

        <button
          type="button"
          onClick={guardarNuevoRol}
          disabled={guardandoRol}
          className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:bg-emerald-300"
        >
          {guardandoRol ? "Guardando..." : "Guardar rol"}
        </button>

        <button
          type="button"
          onClick={() => {
            setMostrarNuevoRol(false);
            setNuevoRol("");
            setErrorRol("");
          }}
          className="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
        >
          Cancelar
        </button>
      </div>

      {errorRol ? (
        <p className="mt-2 text-sm text-red-500">{errorRol}</p>
      ) : null}

      <p className="mt-2 text-xs text-gray-500">
        El rol se guardará en mayúsculas y quedará disponible para futuros trabajadores.
      </p>
    </div>
  )}
</div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Asignación</label>
                  <select
                    value={values.asignacion}
                    onChange={(event) => handleChange("asignacion", event.target.value)}
                    className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500 ${errors.asignacion ? "border-red-400" : "border-gray-300"}`}
                  >
                    <option value="">Sin asignación</option>
                    <option value="1">La Concepción</option>
                    <option value="2">Bilbao</option>
                    <option value="3">Providencia</option>
                  </select>
                  {errors.asignacion ? <p className="mt-1 text-sm text-red-500">{errors.asignacion}</p> : null}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Estado</label>
                  <select
                    value={values.estado}
                    onChange={(event) => handleChange("estado", event.target.value)}
                    className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500 ${errors.estado ? "border-red-400" : "border-gray-300"}`}
                  >
                    <option value="">Selecciona un estado</option>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                  {errors.estado ? <p className="mt-1 text-sm text-red-500">{errors.estado}</p> : null}
                </div>

                <div className="rounded-xl border border-emerald-200 bg-white p-4 text-sm text-gray-700">
                  <p className="font-semibold text-emerald-700">Información</p>
                  <p className="mt-2">El trabajador quedará registrado con los datos ingresados y aparecerá en la lista de personal.</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
              >
                {isSubmitting ? "Guardando..." : "Guardar trabajador"}
              </button>
              <Link
                href="/recursos-humanos"
                className="rounded-full border border-emerald-200 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
              >
                Cancelar
              </Link>
            </div>

            {submitMessage ? (
              <div className="lg:col-span-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {submitMessage}
              </div>
            ) : null}
          </form>
        </section>
      </main>

      {popup.open ? (
        <div className="fixed right-4 top-4 z-[60] w-full max-w-sm rounded-2xl border border-emerald-200 bg-white p-4 shadow-2xl">
          <div className={`rounded-xl p-4 ${popup.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em]">
                  {popup.type === "success" ? "Éxito" : "Error"}
                </p>
                <p className="mt-1 text-sm font-medium">{popup.message}</p>
              </div>
              <button
                type="button"
                onClick={() => setPopup({ open: false, type: "success", message: "" })}
                className="text-lg font-semibold"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
