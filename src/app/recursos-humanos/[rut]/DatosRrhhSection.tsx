"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type DatosRrhhForm = {
    nacionalidad: string;
    fecha_nacimiento: string;
    estado_civil: string;

    tipo_contrato: string;
    jornada_semanal_horas: string;
    remuneracion_base: string;
    forma_pago: string;

    banco: string;
    tipo_cuenta: string;
    numero_cuenta: string;

    contacto_emergencia_nombre: string;
    contacto_emergencia_telefono: string;
    contacto_emergencia_parentesco: string;

    observacion_rrhh: string;
};

const initialValues: DatosRrhhForm = {
    nacionalidad: "",
    fecha_nacimiento: "",
    estado_civil: "",

    tipo_contrato: "",
    jornada_semanal_horas: "",
    remuneracion_base: "",
    forma_pago: "",

    banco: "",
    tipo_cuenta: "",
    numero_cuenta: "",

    contacto_emergencia_nombre: "",
    contacto_emergencia_telefono: "",
    contacto_emergencia_parentesco: "",

    observacion_rrhh: "",
};

type DatosRrhhSectionProps = {
    rut: string;
};

export default function DatosRrhhSection({ rut }: DatosRrhhSectionProps) {
    const [values, setValues] = useState<DatosRrhhForm>(initialValues);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

    const [autorizado, setAutorizado] = useState(false);

    function handleChange(field: keyof DatosRrhhForm, value: string) {
        setValues((prev) => ({
            ...prev,
            [field]: value,
        }));

        setMensaje("");
        setError("");
    }

    async function obtenerToken() {
        if (!supabase) {
            throw new Error("Supabase no está configurado.");
        }

        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;

        if (!token) {
            throw new Error("No hay sesión activa.");
        }

        return token;
    }

    async function cargarDatosRrhh() {
        try {
            setCargando(true);
            setError("");

            const token = await obtenerToken();

            const response = await fetch(`/api/trabajadores/${rut}/rrhh`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const result = await response.json();

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    setAutorizado(false);
                    return;
                }

                throw new Error(result.error || "Error al cargar datos RRHH.");
            }

            setAutorizado(true);

            if (result.data) {
                setValues({
                    nacionalidad: result.data.nacionalidad || "",
                    fecha_nacimiento: result.data.fecha_nacimiento || "",
                    estado_civil: result.data.estado_civil || "",

                    tipo_contrato: result.data.tipo_contrato || "",
                    jornada_semanal_horas: result.data.jornada_semanal_horas
                        ? String(result.data.jornada_semanal_horas)
                        : "",
                    remuneracion_base: result.data.remuneracion_base
                        ? String(result.data.remuneracion_base)
                        : "",
                    forma_pago: result.data.forma_pago || "",

                    banco: result.data.banco || "",
                    tipo_cuenta: result.data.tipo_cuenta || "",
                    numero_cuenta: result.data.numero_cuenta || "",

                    contacto_emergencia_nombre:
                        result.data.contacto_emergencia_nombre || "",
                    contacto_emergencia_telefono:
                        result.data.contacto_emergencia_telefono || "",
                    contacto_emergencia_parentesco:
                        result.data.contacto_emergencia_parentesco || "",

                    observacion_rrhh: result.data.observacion_rrhh || "",
                });
            }
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Error al cargar datos RRHH."
            );
        } finally {
            setCargando(false);
        }
    }

    async function guardarDatosRrhh(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        try {
            setGuardando(true);
            setMensaje("");
            setError("");

            const token = await obtenerToken();

            const response = await fetch(`/api/trabajadores/${rut}/rrhh`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(values),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Error al guardar datos RRHH.");
            }

            setMensaje("Datos RRHH guardados correctamente.");
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Error al guardar datos RRHH."
            );
        } finally {
            setGuardando(false);
        }
    }

    useEffect(() => {
        cargarDatosRrhh();
    }, [rut]);

    if (!cargando && !autorizado) {
        return null;
    }

    if (cargando) {
        return (
            <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
                <p className="text-sm text-gray-500">Cargando datos RRHH...</p>
            </section>
        );
    }

    return (
        <section className="mt-8 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
                    RRHH / Contratación
                </p>

                <h2 className="mt-2 text-2xl font-bold text-gray-800">
                    Datos laborales y administrativos
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                    Información interna para contratación, pagos, trámites y contacto de emergencia.
                </p>
            </div>

            <form onSubmit={guardarDatosRrhh} className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                    <h3 className="mb-4 text-lg font-semibold text-gray-800">
                        Datos personales complementarios
                    </h3>

                    <div className="space-y-4">
                        <input
                            value={values.nacionalidad}
                            onChange={(event) =>
                                handleChange("nacionalidad", event.target.value)
                            }
                            placeholder="Nacionalidad"
                            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                        />

                        <input
                            type="date"
                            value={values.fecha_nacimiento}
                            onChange={(event) =>
                                handleChange("fecha_nacimiento", event.target.value)
                            }
                            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                        />

                        <select
                            value={values.estado_civil}
                            onChange={(event) =>
                                handleChange("estado_civil", event.target.value)
                            }
                            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                        >
                            <option value="">Seleccionar estado civil</option>
                            <option value="SOLTERO">Soltero/a</option>
                            <option value="CASADO">Casado/a</option>
                            <option value="DIVORCIADO">Divorciado/a</option>
                            <option value="VIUDO">Viudo/a</option>
                            <option value="CONVIVIENTE CIVIL">Conviviente civil</option>
                        </select>
                    </div>
                </div>

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                    <h3 className="mb-4 text-lg font-semibold text-emerald-800">
                        Contrato y jornada
                    </h3>

                    <div className="space-y-4">
                        <select
                            value={values.tipo_contrato}
                            onChange={(event) =>
                                handleChange("tipo_contrato", event.target.value)
                            }
                            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                        >
                            <option value="">Seleccionar tipo de contrato</option>
                            <option value="INDEFINIDO">Indefinido</option>
                            <option value="PLAZO FIJO">Plazo fijo</option>
                            <option value="PART TIME">Part time</option>
                            <option value="HONORARIOS">Honorarios</option>
                            <option value="PRACTICA">Práctica</option>
                        </select>

                        <input
                            type="number"
                            value={values.jornada_semanal_horas}
                            onChange={(event) =>
                                handleChange("jornada_semanal_horas", event.target.value)
                            }
                            placeholder="Jornada semanal en horas"
                            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                        />

                        <input
                            type="number"
                            value={values.remuneracion_base}
                            onChange={(event) =>
                                handleChange("remuneracion_base", event.target.value)
                            }
                            placeholder="Remuneración base"
                            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                        />

                        <select
                            value={values.forma_pago}
                            onChange={(event) =>
                                handleChange("forma_pago", event.target.value)
                            }
                            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                        >
                            <option value="">Seleccionar forma de pago</option>
                            <option value="TRANSFERENCIA">Transferencia</option>
                            <option value="EFECTIVO">Efectivo</option>
                            <option value="CHEQUE">Cheque</option>
                            <option value="OTRO">Otro</option>
                        </select>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                    <h3 className="mb-4 text-lg font-semibold text-gray-800">
                        Datos bancarios
                    </h3>

                    <div className="space-y-4">
                        <input
                            value={values.banco}
                            onChange={(event) => handleChange("banco", event.target.value)}
                            placeholder="Banco"
                            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                        />

                        <select
                            value={values.tipo_cuenta}
                            onChange={(event) =>
                                handleChange("tipo_cuenta", event.target.value)
                            }
                            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                        >
                            <option value="">Seleccionar tipo de cuenta</option>
                            <option value="CUENTA RUT">Cuenta RUT</option>
                            <option value="CUENTA CORRIENTE">Cuenta corriente</option>
                            <option value="CUENTA VISTA">Cuenta vista</option>
                            <option value="CUENTA AHORRO">Cuenta de ahorro</option>
                        </select>

                        <input
                            value={values.numero_cuenta}
                            onChange={(event) =>
                                handleChange("numero_cuenta", event.target.value)
                            }
                            placeholder="Número de cuenta"
                            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                        />
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                    <h3 className="mb-4 text-lg font-semibold text-gray-800">
                        Contacto de emergencia
                    </h3>

                    <div className="space-y-4">
                        <input
                            value={values.contacto_emergencia_nombre}
                            onChange={(event) =>
                                handleChange("contacto_emergencia_nombre", event.target.value)
                            }
                            placeholder="Nombre contacto emergencia"
                            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                        />

                        <input
                            value={values.contacto_emergencia_telefono}
                            onChange={(event) =>
                                handleChange("contacto_emergencia_telefono", event.target.value)
                            }
                            placeholder="Teléfono contacto emergencia"
                            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                        />

                        <input
                            value={values.contacto_emergencia_parentesco}
                            onChange={(event) =>
                                handleChange(
                                    "contacto_emergencia_parentesco",
                                    event.target.value
                                )
                            }
                            placeholder="Parentesco"
                            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                        />
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <textarea
                        value={values.observacion_rrhh}
                        onChange={(event) =>
                            handleChange("observacion_rrhh", event.target.value)
                        }
                        placeholder="Observaciones internas de RRHH"
                        rows={4}
                        className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    />
                </div>

                {mensaje ? (
                    <p className="lg:col-span-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                        {mensaje}
                    </p>
                ) : null}

                {error ? (
                    <p className="lg:col-span-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                        {error}
                    </p>
                ) : null}

                <div className="lg:col-span-2">
                    <button
                        type="submit"
                        disabled={guardando}
                        className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-600 disabled:opacity-60"
                    >
                        {guardando ? "Guardando..." : "Guardar datos RRHH"}
                    </button>
                </div>
            </form>
        </section>
    );
}