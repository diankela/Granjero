"use client";

import { useEffect, useState } from "react";

type Producto = {
  id_producto: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  unidad_medida: string;
  precio_unitario: number;
  precio_venta: number;
  activo: string;
  creado_en: string;
};

const initialForm = {
  codigo: "",
  nombre: "",
  descripcion: "",
  unidad_medida: "UNIDAD",
  precio_unitario: "",
  precio_venta: "",
};

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [form, setForm] = useState(initialForm);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  async function cargarProductos() {
    try {
      setCargando(true);

      const response = await fetch("/api/productos");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al cargar productos");
      }

      setProductos(result.data || []);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Error al cargar productos"
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarProductos();
  }, []);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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

    if (!form.codigo || !form.nombre || !form.unidad_medida) {
      setError("Código, nombre y unidad de medida son obligatorios.");
      return;
    }

    try {
      setGuardando(true);

      const response = await fetch("/api/productos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          codigo: form.codigo,
          nombre: form.nombre,
          descripcion: form.descripcion,
          unidad_medida: form.unidad_medida,
          precio_unitario: Number(form.precio_unitario || 0),
          precio_venta: Number(form.precio_venta || 0),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al guardar producto");
      }

      setMensaje("Producto guardado correctamente.");
      setForm(initialForm);

      setProductos((prev) => [...prev, result.data]);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Error al guardar producto"
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 px-8 py-10">
      <section className="mx-auto max-w-7xl rounded-3xl bg-white p-10 shadow-sm">
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.3em] text-emerald-600">
          Productos
        </p>

        <h1 className="mb-4 text-5xl font-bold text-emerald-700">
          Gestión de productos
        </h1>

        <p className="mb-10 max-w-3xl text-lg text-gray-600">
          Agrega productos al catálogo y revisa la lista de productos registrados en el sistema.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mb-10 grid gap-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-6 md:grid-cols-2"
        >
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Código
            </label>
            <input
              name="codigo"
              value={form.codigo}
              onChange={handleChange}
              placeholder="Ej: MANI-250"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Nombre
            </label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Ej: Maní 250 g"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Unidad de medida
            </label>
            <select
              name="unidad_medida"
              value={form.unidad_medida}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-emerald-500"
            >
              <option value="UNIDAD">Unidad</option>
              <option value="GR">Gramos</option>
              <option value="KG">Kilos</option>
              <option value="ML">Mililitros</option>
              <option value="L">Litros</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Precio unitario
            </label>
            <input
              name="precio_unitario"
              type="number"
              min="0"
              value={form.precio_unitario}
              onChange={handleChange}
              placeholder="Ej: 1500"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Precio venta
            </label>
            <input
              name="precio_venta"
              type="number"
              min="0"
              value={form.precio_venta}
              onChange={handleChange}
              placeholder="Ej: 2500"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Descripción opcional del producto"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-emerald-500"
              rows={3}
            />
          </div>

          {error ? (
            <p className="md:col-span-2 rounded-xl bg-red-50 px-4 py-3 text-red-600">
              {error}
            </p>
          ) : null}

          {mensaje ? (
            <p className="md:col-span-2 rounded-xl bg-emerald-100 px-4 py-3 text-emerald-700">
              {mensaje}
            </p>
          ) : null}

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={guardando}
              className="rounded-full bg-emerald-500 px-8 py-3 font-bold text-white hover:bg-emerald-600 disabled:opacity-60"
            >
              {guardando ? "Guardando..." : "Guardar producto"}
            </button>
          </div>
        </form>

        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Productos registrados
            </h2>
          </div>

          {cargando ? (
            <p className="p-6 text-gray-600">Cargando productos...</p>
          ) : productos.length === 0 ? (
            <p className="p-6 text-gray-600">
              Todavía no hay productos registrados.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-emerald-50 text-emerald-800">
                  <tr>
                    <th className="px-6 py-4">Código</th>
                    <th className="px-6 py-4">Nombre</th>
                    <th className="px-6 py-4">Unidad</th>
                    <th className="px-6 py-4">Precio unitario</th>
                    <th className="px-6 py-4">Precio venta</th>
                    <th className="px-6 py-4">Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {productos.map((producto) => (
                    <tr
                      key={producto.id_producto}
                      className="border-t border-gray-100"
                    >
                      <td className="px-6 py-4">{producto.codigo}</td>
                      <td className="px-6 py-4">{producto.nombre}</td>
                      <td className="px-6 py-4">{producto.unidad_medida}</td>
                      <td className="px-6 py-4">
                        ${Number(producto.precio_unitario).toLocaleString("es-CL")}
                      </td>
                      <td className="px-6 py-4">
                        ${Number(producto.precio_venta).toLocaleString("es-CL")}
                      </td>
                      <td className="px-6 py-4">
                        {producto.activo === "S" ? "Activo" : "Inactivo"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}