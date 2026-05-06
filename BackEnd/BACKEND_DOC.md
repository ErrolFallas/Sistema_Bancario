# 📦 Documentación del Backend — Sistema Bancario

## 📋 Descripción General

El **Backend del Sistema Bancario** es un proyecto construido con **Node.js** y **Sequelize ORM**, diseñado bajo el patrón de arquitectura **MVC (Modelo - Vista - Controlador)**. Su propósito es gestionar todas las operaciones bancarias: clientes, cuentas, tarjetas, transacciones, préstamos, empleados y auditoría, conectándose a una base de datos **MySQL**.

Actualmente el proyecto **tiene implementada su arquitectura completa**: los 23 modelos Sequelize y sus migraciones están sincronizados (24 archivos de migración), y todas las capas de controladores, rutas, middlewares y utilidades (autenticación JWT, verificación de roles, validación por rol, auditoría automática y manejos de errores descriptivos) ya están en funcionamiento.

---

## 🏗️ Arquitectura MVC

El proyecto sigue el patrón **Modelo-Vista-Controlador** para mantener una separación clara de responsabilidades:

### Estructura actual del proyecto

```
BackEnd/
├── config/                          # Configuración central
│   └── config.js                    # Conexión DB, JWT, CORS, Sequelize CLI
├── models/                          # Modelos Sequelize (23 entidades)
│   ├── index.js                     # Centraliza imports y define asociaciones
│   ├── Rol.js                       # Roles del sistema
│   ├── Permiso.js                   # Permisos individuales
│   ├── RolPermiso.js                # Pivote N:M Roles ↔ Permisos
│   ├── TipoCuenta.js                # Catálogo tipos de cuenta
│   ├── TipoTarjeta.js               # Catálogo tipos de tarjeta
│   ├── MarcaTarjeta.js              # Catálogo marcas de tarjeta
│   ├── EstadoTarjeta.js             # Catálogo estados de tarjeta
│   ├── TipoTransaccion.js           # Catálogo tipos de transacción
│   ├── EstadoTransaccion.js         # Catálogo estados de transacción
│   ├── Canal.js                     # Catálogo de canales
│   ├── EstadoPrestamo.js            # Catálogo estados de préstamo
│   ├── Banco.js                     # Bancos del sistema
│   ├── Cliente.js                   # Clientes del banco
│   ├── Empleado.js                  # Empleados del banco
│   ├── Usuario.js                   # Credenciales de acceso
│   ├── Cuenta.js                    # Cuentas bancarias
│   ├── ClienteCuenta.js             # Pivote N:M Clientes ↔ Cuentas
│   ├── Tarjeta.js                   # Tarjetas asociadas a cuentas
│   ├── Transaccion.js               # Transacciones financieras
│   ├── Movimiento.js                # Movimientos contables
│   ├── Prestamo.js                  # Préstamos otorgados
│   ├── PagoPrestamo.js              # Pagos a préstamos
│   └── HistorialAuditoria.js        # Log de auditoría
├── migrations/                      # Migraciones Sequelize CLI (24 archivos)
│   ├── 001-create-roles.js
│   ├── 002-create-permisos.js
│   ├── 003-create-tipos-cuenta.js
│   ├── ...                          # (004 a 023)
│   └── 024-move-fecha-registro-to-usuarios.js
├── controllers/                     # Lógica de negocio (24 controladores)
│   ├── AuthController.js            # Login, registro y JWT
│   ├── UsuarioController.js         # CRUD usuarios + validación por rol
│   ├── ClienteController.js         # CRUD clientes + auditoría
│   ├── EmpleadoController.js        # CRUD empleados + auditoría
│   ├── CuentaController.js          # CRUD cuentas
│   ├── HistorialAuditoriaController.js # Consulta de auditoría (solo lectura)
│   └── ...                          # (18 controladores adicionales)
├── routes/                          # Definición de endpoints de la API REST (24 archivos)
│   ├── AuthRoute.js
│   ├── UsuarioRoute.js
│   └── ...
├── middlewares/                     # Middlewares de seguridad y validación
│   ├── autenticarToken.js           # Valida JWT
│   ├── verificarRol.js              # Valida RBAC (Jerarquía de Roles)
│   └── verificarPropiedad.js        # Valida pertenencia de recursos (Ownership)
├── utils/                           # Utilidades reutilizables
│   └── auditoria.js                 # Helper de auditoría automática
├── app.js                           # Punto de entrada del servidor
├── .sequelizerc                     # Rutas para Sequelize CLI
├── .env                             # Variables de entorno (NO se sube a Git)
├── package.json                     # Dependencias y scripts
├── BACKEND_DOC.md                   # Esta documentación
└── ENTIDADES_DOC.md                 # Documentación detallada de cada entidad
```

### ¿Qué hace cada capa?

| Capa | Responsabilidad | Estado |
|------|----------------|--------|
| **Modelo** | Define la estructura de datos, validaciones y asociaciones con Sequelize ORM. | ✅ Implementado |
| **Migraciones** | Scripts para crear/modificar tablas en MySQL de forma controlada y versionada. | ✅ Implementado (24 archivos) |
| **Configuración** | Centraliza la conexión a DB, JWT, CORS y Sequelize CLI. | ✅ Implementado |
| **Controlador** | Contiene la lógica de negocio. Recibe peticiones, procesa datos y responde. | ✅ Implementado |
| **Rutas** | Define los endpoints de la API y los conecta con los controladores. | ✅ Implementado |
| **Middleware** | Funciones intermedias para autenticación (JWT), roles (RBAC) y validación de errores descriptiva. | ✅ Implementado |
| **Utilidades** | Funciones auxiliares reutilizables (auditoría automática). | ✅ Implementado |

---

## 🗄️ Base de Datos — Entidades del Sistema

El sistema bancario gestiona **23 tablas** en MySQL, organizadas en 3 categorías:

### Entidades Principales (9)

| Entidad | Descripción |
|---------|-------------|
| **CLIENTES** | Información personal de los clientes del banco. |
| **BANCOS** | Información de los bancos registrados en el sistema. |
| **EMPLEADOS** | Personal del banco con puesto y banco asignado. |
| **USUARIOS** | Credenciales de acceso al sistema (vinculado a cliente o empleado, con fecha de registro). |
| **CUENTAS** | Cuentas bancarias con saldo, estado y tipo. |
| **TARJETAS** | Tarjetas asociadas a cuentas (débito/crédito). |
| **TRANSACCIONES** | Registro de todas las operaciones financieras. |
| **MOVIMIENTOS** | Impacto contable de cada transacción (débito/crédito por cuenta). |
| **PRESTAMOS** | Créditos otorgados a clientes con tasas e intereses. |

### Entidades de Catálogo (8)

| Entidad | Descripción |
|---------|-------------|
| **TIPOS_CUENTA** | Catálogo de tipos de cuenta (ahorro, corriente). |
| **TIPOS_TARJETA** | Catálogo de tipos de tarjeta (débito, crédito). |
| **MARCAS_TARJETA** | Catálogo de marcas (Visa, Mastercard). |
| **ESTADOS_TARJETA** | Estados posibles de una tarjeta (activa, bloqueada). |
| **TIPOS_TRANSACCION** | Catálogo de tipos de transacción (transferencia, depósito). |
| **ESTADOS_TRANSACCION** | Estados de transacción (pendiente, completada). |
| **ESTADOS_PRESTAMO** | Estados de préstamo (activo, pagado, en mora). |
| **CANALES** | Medios de transacción (ATM, APP, WEB, Sucursal). |

### Entidades de Relación, Seguridad y Auditoría (6)

| Entidad | Descripción |
|---------|-------------|
| **ROLES** | Roles de usuario (SUPER_ADMIN, ADMIN, GERENTE, EMPLEADO, CLIENTE). |
| **PERMISOS** | Acciones específicas permitidas en el sistema. |
| **ROLES_PERMISOS** | Relación N:M entre roles y permisos. |
| **CLIENTES_CUENTAS** | Relación N:M entre clientes y cuentas (cuentas compartidas). |
| **PAGOS_PRESTAMO** | Registro de pagos realizados a préstamos. |
| **HISTORIAL_AUDITORIA** | Log automático de todas las acciones de creación en el sistema. |

> 📖 La documentación detallada de cada entidad (descripción, relaciones y ejemplos) se encuentra en `ENTIDADES_DOC.md`.

---

## 🔧 Archivos Clave

### `models/index.js`

Archivo central del sistema de modelos. Se encarga de:

1. **Crear la instancia de Sequelize** usando la configuración del entorno.
2. **Importar los 23 modelos** y pasarles la instancia de sequelize.
3. **Definir las 26 asociaciones** bidireccionales con `foreignKey` y `as` explícitos.
4. **Exportar** todos los modelos y la instancia de sequelize.

**Uso en controladores:**
```javascript
const { Cliente, Cuenta, Transaccion } = require('../models');
```

### `utils/auditoria.js`

Helper reutilizable para el sistema de auditoría automática. Exporta:

| Función | Propósito |
|---------|-----------|
| `registrarAuditoria(params)` | Inserta un registro en `HISTORIAL_AUDITORIA`. Nunca lanza errores (try/catch interno). |
| `descripcionCrearUsuario(reqUser, usuario, nombreRol)` | Genera descripción dinámica para creación de usuarios según el rol. |
| `descripcionCrearCliente(reqUser, cliente)` | Genera descripción dinámica para creación de clientes. |
| `descripcionCrearEmpleado(reqUser, empleado)` | Genera descripción dinámica para creación de empleados (incluye puesto). |

**Uso en controladores:**
```javascript
const { registrarAuditoria, descripcionCrearUsuario } = require('../utils/auditoria');

// Después de crear la entidad exitosamente:
const descripcion = await descripcionCrearUsuario(req.user, usuario, 'CLIENTE');
await registrarAuditoria({
  idUsuario: req.user.idUsuario,
  accion: 'CREATE',
  tablaAfectada: 'USUARIOS',
  idRegistro: usuario.idUsuario,
  descripcion,
  ip: req.ip,
});
```

### `.sequelizerc`

Configura las rutas que Sequelize CLI utiliza para encontrar la configuración, modelos, migraciones y seeders:

```javascript
module.exports = {
  'config':          path.resolve('config', 'config.js'),
  'models-path':     path.resolve('models'),
  'migrations-path': path.resolve('migrations'),
  'seeders-path':    path.resolve('seeders'),
};
```

### `config/config.js`

Exporta dos formatos de configuración:
- **`config.database`** — Para uso directo en `database.js` (compatibilidad).
- **`config.development/test/production`** — Para Sequelize CLI (migraciones).

---

## ⚙️ Configuración del Entorno (.env)

El archivo `.env` contiene todas las variables de entorno necesarias:

```env
# Servidor
PORT=3000
NODE_ENV=development

# Base de Datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=          # Tu contraseña de MySQL
DB_NAME=SistemaBancario
DB_DIALECT=mysql

# Pool de Conexiones
DB_POOL_MAX=10
DB_POOL_MIN=0
DB_POOL_ACQUIRE=30000
DB_POOL_IDLE=10000

# JWT
JWT_SECRET=sistema_bancario_secret_key_2026
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:5173
```

> ⚠️ **IMPORTANTE:** El archivo `.env` está incluido en `.gitignore` y **nunca debe subirse** al repositorio.

---

## 📦 Dependencias

### Instaladas actualmente

| Paquete | Tipo | Propósito |
|---------|------|-----------|
| `sequelize` | Producción | ORM para interactuar con MySQL. |
| `mysql2` | Producción | Driver de MySQL para Node.js. |
| `dotenv` | Producción | Carga variables de entorno desde `.env`. |
| `express` | Producción | Framework web para crear la API REST. |
| `cors` | Producción | Habilita Cross-Origin Resource Sharing. |
| `jsonwebtoken` | Producción | Generación y verificación de tokens JWT (30 min expiración). |
| `bcrypt` | Producción | Hash de contraseñas de usuarios y números de tarjetas bancarias. |
| `sequelize-cli` | Desarrollo | Herramienta CLI para migraciones y seeders. |

### Instalación

```bash
npm install sequelize mysql2 dotenv express cors jsonwebtoken bcrypt
npm install --save-dev sequelize-cli
```

---

## 🗃️ Migraciones

Las migraciones gestionan el esquema de la base de datos de forma versionada. Están numeradas del 001 al 024 en orden estricto de dependencias FK.

### Comandos principales

```bash
# Ejecutar todas las migraciones pendientes
npx sequelize-cli db:migrate

# Ver estado de las migraciones
npx sequelize-cli db:migrate:status

# Revertir la última migración
npx sequelize-cli db:migrate:undo

# Revertir TODAS las migraciones
npx sequelize-cli db:migrate:undo:all
```

### Orden de ejecución

```
001-010: Catálogos sin FK (ROLES, PERMISOS, TIPOS_*, ESTADOS_*, CANALES)
011-012: Entidades independientes (BANCOS, CLIENTES)
013:     EMPLEADOS → depende de BANCOS
014:     ROLES_PERMISOS → depende de ROLES + PERMISOS
015:     USUARIOS → depende de ROLES + CLIENTES + EMPLEADOS
016:     CUENTAS → depende de BANCOS + TIPOS_CUENTA
017:     CLIENTES_CUENTAS → depende de CLIENTES + CUENTAS
018:     TARJETAS → depende de CUENTAS + TIPOS/MARCAS/ESTADOS_TARJETA
019:     TRANSACCIONES → depende de CLIENTES + CUENTAS + CANALES + TIPOS/ESTADOS_TRANSACCION
020:     MOVIMIENTOS → depende de CUENTAS + TRANSACCIONES
021:     PRESTAMOS → depende de CLIENTES + BANCOS + ESTADOS_PRESTAMO
022:     PAGOS_PRESTAMO → depende de PRESTAMOS + TRANSACCIONES
023:     HISTORIAL_AUDITORIA → depende de USUARIOS
024:     Migración de datos: fecha_registro de CLIENTES → USUARIOS
```

---

## 🔗 Convenciones del Proyecto

| Aspecto | Convención |
|---------|------------|
| **Tablas en DB** | `SNAKE_CASE` mayúsculas: `CLIENTES`, `TIPOS_CUENTA` |
| **Campos en DB** | `snake_case` minúsculas: `id_cliente`, `fecha_registro` |
| **Modelos en JS** | `PascalCase`: `Cliente`, `TipoCuenta` |
| **Propiedades en JS** | `camelCase`: `idCliente`, `fechaRegistro` |
| **Mapeo campo→DB** | Cada campo usa `field: 'nombre_db'` para la traducción |
| **Timestamps** | `created_at` y `updated_at` automáticos en todas las tablas |
| **Validaciones** | En el modelo Sequelize (`validate`), NO con CHECK constraints |
| **FK onDelete** | `RESTRICT` para catálogos, `SET NULL` para auditoría, `CASCADE` para pivotes |
| **Módulos** | CommonJS (`require` / `module.exports`) |

---

## 🔐 Seguridad (Implementada Avanzada)

- **Autenticación (JWT):** `AuthController` maneja `/auth/login` (emite token de 30 min) y `/auth/register` (público, auto-asigna `SUPER_ADMIN` si la BD está vacía, o `CLIENTE` si ya hay usuarios — requiere `id_cliente` previo).
- **Control de Pertenencia (Ownership):** Implementación de `verificarPropiedad.js`. Si un `CLIENTE` intenta acceder por `:id` a una Cuenta, Transacción o Tarjeta, este middleware intercepta la petición y va a la BD para validar que él es el verdadero dueño. Además, los controladores (`GET /`) inyectan un filtro (`where: { idCliente: req.user.idCliente }`) automáticamente en las consultas de los clientes.
- **Roles y Jerarquía (RBAC):** Middleware dinámico `verificarRol` protege todas las rutas (24 archivos).
  - `SUPER_ADMIN` tiene acceso irrestricto absoluto a cualquier endpoint, sobreescribiendo arreglos de rutas.
  - `ADMIN` no puede crear nuevos `SUPER_ADMIN` ni editar el rol de un `SUPER_ADMIN` existente (Reglas implementadas en `UsuarioController`).
- **Validación por Rol en Creación de Usuarios:** El `UsuarioController` implementa `validarReglasRol()` que garantiza:
  - `CLIENTE` → requiere `id_cliente`, prohíbe `id_empleado`
  - `EMPLEADO` / `GERENTE` → requiere `id_empleado`, prohíbe `id_cliente`
  - `ADMIN` / `SUPER_ADMIN` → sin relaciones (`id_cliente` e `id_empleado` deben ser `null`)
  - Nunca ambos IDs simultáneamente
- **Bloqueos Físicos:** Se deshabilitaron los métodos `DELETE` en Transacciones, Movimientos y Historial, devolviendo un error 403 (normativa bancaria).
- **Contraseñas y Datos Sensibles:** Uso estricto de `bcrypt` (SALT_ROUNDS = 10) para el campo `passwordHash` en `USUARIOS` y el número de tarjeta en `TARJETAS` mediante Hooks de Sequelize (`beforeCreate`, `beforeUpdate`).
- **Manejo de Errores:** Todos los controladores devuelven mensajes de error detallados y descriptivos en español.

---

## 📋 Auditoría Automática

El sistema registra automáticamente en `HISTORIAL_AUDITORIA` todas las acciones de creación de **USUARIOS**, **CLIENTES** y **EMPLEADOS**.

### Arquitectura

```
Controller (crearUsuario/crearCliente/crearEmpleado)
  ↓ .create() exitoso
  ↓ Construir descripción dinámica
  ↓ await registrarAuditoria(...)
  ↓ Enviar respuesta al cliente
```

### Puntos de integración

| Controller | Método | Tabla Auditada |
|-----------|--------|----------------|
| `UsuarioController` | `crearUsuario` | USUARIOS |
| `AuthController` | `register` | USUARIOS |
| `ClienteController` | `crearCliente` | CLIENTES |
| `EmpleadoController` | `crearEmpleado` | EMPLEADOS |

### Descripciones dinámicas

Las descripciones incluyen **quién** creó **qué** y en **qué contexto**:

| Escenario | Ejemplo de descripción |
|-----------|----------------------|
| Empleado crea usuario CLIENTE | `"El empleado María López (rol: EMPLEADO) creó el usuario jperez asociado al cliente Juan Pérez"` |
| ADMIN crea usuario EMPLEADO | `"El ADMIN admin1 creó el usuario mlopez con rol EMPLEADO (Empleado: María López)"` |
| SUPER_ADMIN crea ADMIN | `"El SUPER_ADMIN root creó el usuario admin2 con rol ADMIN"` |
| Registro público primer usuario | `"Registro automático del primer SUPER_ADMIN: root"` |
| Auto-registro CLIENTE | `"Auto-registro del usuario jperez como CLIENTE (Cliente: Juan Pérez)"` |
| Empleado crea cliente | `"El empleado María López (rol: EMPLEADO) creó el cliente Juan Pérez"` |
| ADMIN crea empleado | `"El SUPER_ADMIN root creó el empleado María López (puesto: Cajera)"` |

### Reglas de resiliencia

- La auditoría **NUNCA** rompe el flujo principal del controller.
- Errores de auditoría se registran en `console.error` y retornan `null`.
- La respuesta HTTP al cliente se envía independientemente del resultado de la auditoría.

---

## 🔄 Flujo de Creación de Entidades (Sin Dependencia Circular)

### Para SUPER_ADMIN inicial
1. `POST /auth/register` (BD vacía) → Usuario con rol SUPER_ADMIN, sin relaciones

### Para CLIENTE
1. `POST /clientes` (por ADMIN/EMPLEADO/GERENTE) → Crear registro de Cliente
2. `POST /usuarios` con `idRol=CLIENTE` + `idCliente` → Crear usuario vinculado
   - O alternativamente: `POST /auth/register` con `idCliente` → Auto-registro

### Para EMPLEADO / GERENTE
1. `POST /empleados` (por ADMIN/SUPER_ADMIN) → Crear registro de Empleado
2. `POST /usuarios` con `idRol=EMPLEADO` + `idEmpleado` → Crear usuario vinculado

### Para ADMIN
1. `POST /usuarios` con `idRol=ADMIN` → Crear usuario sin relaciones

---

## 📝 Notas Adicionales

- El backend utiliza **CommonJS** (`require/module.exports`) como sistema de módulos.
- La base de datos debe ser creada previamente en MySQL con el nombre `SistemaBancario`.
- Las migraciones crean las 23 tablas automáticamente con `npx sequelize-cli db:migrate`.
- La migración 024 mueve `fecha_registro` de CLIENTES a USUARIOS.
- La documentación detallada de cada entidad está en `ENTIDADES_DOC.md`.
- La carpeta `FrontEnd/` se mantiene aislada y no es gestionada por este backend.
- El servidor se inicia con `npm start` (ejecuta `node app.js`).
