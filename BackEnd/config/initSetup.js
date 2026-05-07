const { Rol, Permiso, RolPermiso, Usuario } = require("../models");
const bcrypt = require("bcrypt");

const ROLES_BASE = [
  { nombre: "SUPER_ADMIN", descripcion: "Administrador supremo del sistema con acceso total" },
  { nombre: "ADMIN", descripcion: "Administrador del sistema con privilegios elevados" },
  { nombre: "GERENTE", descripcion: "Gerente de sucursal o departamento" },
  { nombre: "EMPLEADO", descripcion: "Empleado regular del banco" },
  { nombre: "CLIENTE", descripcion: "Cliente del banco" },
];

const PERMISOS_BASE = [
  { nombre: "GESTIONAR_ROLES", descripcion: "Permite crear, ver y eliminar roles del sistema" },
  { nombre: "GESTIONAR_USUARIOS", descripcion: "Permite ver, crear y administrar usuarios" },
  { nombre: "GESTIONAR_CLIENTES", descripcion: "Permite ver y administrar clientes" },
  { nombre: "GESTIONAR_CUENTAS", descripcion: "Permite abrir y administrar cuentas bancarias" },
  { nombre: "GESTIONAR_TARJETAS", descripcion: "Permite emitir y administrar tarjetas" },
  { nombre: "VER_REPORTES", descripcion: "Permite ver reportes y auditorías financieras" },
];

/**
 * Función para inicializar la base de datos con Roles y Permisos base.
 * Se ejecuta automáticamente al iniciar el servidor.
 */
const inicializarDatosBase = async () => {
  try {
    console.log("⏳ Verificando roles y permisos base del sistema...");

    // 1. Crear Roles Base si no existen
    for (const rolData of ROLES_BASE) {
      const [rol, created] = await Rol.findOrCreate({
        where: { nombre: rolData.nombre },
        defaults: rolData
      });
      if (created) console.log(`✅ Rol creado: ${rol.nombre}`);
    }

    // 2. Crear Permisos Base si no existen
    for (const permisoData of PERMISOS_BASE) {
      const [permiso, created] = await Permiso.findOrCreate({
        where: { nombre: permisoData.nombre },
        defaults: permisoData
      });
      if (created) console.log(`✅ Permiso creado: ${permiso.nombre}`);
    }

    // 3. Obtener todos los roles y permisos de la base de datos para mapearlos
    const rolesDB = await Rol.findAll();
    const permisosDB = await Permiso.findAll();

    const getRol = (nombre) => rolesDB.find(r => r.nombre === nombre);
    const getPermiso = (nombre) => permisosDB.find(p => p.nombre === nombre);

    // 4. Mapeo de asignaciones por defecto (Relación ROLES_PERMISOS)
    const asignacionesDefecto = {
      "SUPER_ADMIN": PERMISOS_BASE.map(p => p.nombre), // Tiene todo
      "ADMIN": ["GESTIONAR_USUARIOS", "GESTIONAR_CLIENTES", "GESTIONAR_CUENTAS", "GESTIONAR_TARJETAS", "VER_REPORTES"], // Todo excepto Roles
      "GERENTE": ["GESTIONAR_CLIENTES", "GESTIONAR_CUENTAS", "GESTIONAR_TARJETAS", "VER_REPORTES"],
      "EMPLEADO": ["GESTIONAR_CLIENTES", "GESTIONAR_CUENTAS"],
      "CLIENTE": [] // El cliente no requiere permisos de staff
    };

    // 5. Crear asociaciones en la tabla pivote si no existen
    for (const [nombreRol, nombresPermisos] of Object.entries(asignacionesDefecto)) {
      const rol = getRol(nombreRol);
      if (!rol) continue;

      for (const nombrePermiso of nombresPermisos) {
        const permiso = getPermiso(nombrePermiso);
        if (!permiso) continue;

        await RolPermiso.findOrCreate({
          where: { 
            idRol: rol.idRol, 
            idPermiso: permiso.idPermiso 
          }
        });
      }
    }
    
    console.log("✅ Asignación de permisos base verificada.");
  } catch (error) {
    console.error("❌ Error al inicializar datos base:", error);
  }
};

module.exports = { inicializarDatosBase };
