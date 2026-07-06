export type Trabajador = {
  rut: string;
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  direccion: string;
  rol: string;
  tienda: string;
  estado: "Activo" | "Inactivo";
};

export const trabajadores: Trabajador[] = [
  {
    rut: "156730824",
    nombre: "Juan",
    apellido: "Pérez",
    telefono: "987654321",
    correo: "juan.perez@granjero.cl",
    direccion: "Av. Principal 123",
    rol: "ADMINISTRADOR",
    tienda: "Sin asignación",
    estado: "Activo",
  },
  {
    rut: "176543218",
    nombre: "María",
    apellido: "González",
    telefono: "912345678",
    correo: "maria.gonzalez@granjero.cl",
    direccion: "Calle Los Olivos 45",
    rol: "VENDEDOR",
    tienda: "La Concepción",
    estado: "Activo",
  },
  {
    rut: "198765432",
    nombre: "Carlos",
    apellido: "Muñoz",
    telefono: "934567890",
    correo: "carlos.munoz@granjero.cl",
    direccion: "Ruta 5 Norte 789",
    rol: "ENCARGADO_TIENDA",
    tienda: "Bilbao",
    estado: "Inactivo",
  },
];
