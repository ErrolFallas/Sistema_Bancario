# 📦 Documentación del Backend — Sistema Bancario

## 📋 Descripción General

El **Backend del Sistema Bancario** es un proyecto construido con **Node.js** y **Sequelize ORM**, diseñado bajo el patrón de arquitectura **MVC (Modelo - Vista - Controlador)**. Su propósito es gestionar todas las operaciones bancarias: clientes, cuentas, tarjetas, transacciones, préstamos, empleados y auditoría, conectándose a una base de datos **MySQL**.

Actualmente el proyecto se encuentra en **fase de modelado de datos**: los 23 modelos Sequelize y sus 23 migraciones están implementados y sincronizados con la base de datos. Las capas de controladores, rutas y middlewares están pendientes de desarrollo.

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
├── migrations/                      # Migraciones Sequelize CLI (23 archivos)
│   ├── 001-create-roles.js
│   ├── 002-create-permisos.js
│   ├── 003-create-tipos-cuenta.js
│   ├── ...                          # (004 a 022)
│   └── 023-create-historial-auditoria.js
├── database.js                      # Conexión directa a MySQL (legado)
├── .sequelizerc                     # Rutas para Sequelize CLI
├── .env                             # Variables de entorno (NO se sube a Git)
├── package.json                     # Dependencias y scripts
├── BACKEND_DOC.md                   # Esta documentación
└── ENTIDADES_DOC.md                 # Documentación detallada de cada entidad
```

### Estructura planificada (pendiente de implementación)

```
BackEnd/
├── controllers/         # Lógica de negocio (por implementar)
│   ├── clienteController.js
│   ├── cuentaController.js
│   ├── transaccionController.js
│   └── ...
├── routes/              # Definición de rutas/endpoints (por implementar)
│   ├── clienteRoutes.js
│   ├── cuentaRoutes.js
│   └── ...
├── middlewares/          # Middlewares (por implementar)
│   ├── authMiddleware.js
│   └── errorHandler.js
├── seeders/             # Datos semilla (por implementar)
└── index.js             # Punto de entrada del servidor (por implementar)
```

### ¿Qué hace cada capa?

| Capa | Responsabilidad | Estado |
|------|----------------|--------|
| **Modelo** | Define la estructura de datos, validaciones y asociaciones con Sequelize ORM. | ✅ Implementado |
| **Migraciones** | Scripts para crear/modificar tablas en MySQL de forma controlada y versionada. | ✅ Implementado |
| **Configuración** | Centraliza la conexión a DB, JWT, CORS y Sequelize CLI. | ✅ Implementado |
| **Controlador** | Contiene la lógica de negocio. Recibe peticiones, procesa datos y responde. | ⬜ Pendiente |
| **Rutas** | Define los endpoints de la API y los conecta con los controladores. | ⬜ Pendiente |
| **Middleware** | Funciones intermedias para autenticación, validación y manejo de errores. | ⬜ Pendiente |

---

## 🗄️ Base de Datos — Entidades del Sistema

El sistema bancario gestiona **23 tablas** en MySQL, organizadas en 3 categorías:

### Entidades Principales (9)

| Entidad | Descripción |
|---------|-------------|
| **CLIENTES** | Información personal de los clientes del banco. |
| **BANCOS** | Información de los bancos registrados en el sistema. |
| **EMPLEADOS** | Personal del banco con puesto y banco asignado. |
| **USUARIOS** | Credenciales de acceso al sistema (vinculado a cliente o empleado). |
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
| **ROLES** | Roles de usuario (admin, cajero, cliente). |
| **PERMISOS** | Acciones específicas permitidas en el sistema. |
| **ROLES_PERMISOS** | Relación N:M entre roles y permisos. |
| **CLIENTES_CUENTAS** | Relación N:M entre clientes y cuentas (cuentas compartidas). |
| **PAGOS_PRESTAMO** | Registro de pagos realizados a préstamos. |
| **HISTORIAL_AUDITORIA** | Log de todas las acciones realizadas en el sistema. |

> 📖 La documentación detallada de cada entidad (descripción, relaciones y ejemplos) se encuentra en `ENTIDADES_DOC.md`.

---

## 🔧 Archivos Clave

### `models/index.js`

Archivo central del sistema de modelos. Se encarga de:

1. **Crear la instancia de Sequelize** usando la configuración del entorno.
2. **Importar los 23 modelos** y pasarles la instancia de sequelize.
3. **Definir las 26 asociaciones** bidireccionales con `foreignKey` y `as` explícitos.
4. **Exportar** todos los modelos y la instancia de sequelize.

**Uso en controladores (futuro):**
```javascript
const { Cliente, Cuenta, Transaccion } = require('../models');
```

### `database.js`

Archivo de conexión directa a MySQL. Existe como módulo independiente para compatibilidad con código previo. En el nuevo flujo, `models/index.js` gestiona su propia conexión.

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

# JWT (para uso futuro)
JWT_SECRET=sistema_bancario_secret_key_2026
JWT_EXPIRES_IN=24h

# CORS (para uso futuro)
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
| `sequelize-cli` | Desarrollo | Herramienta CLI para migraciones y seeders. |

### Pendientes de instalar (cuando se implementen controllers/routes)

| Paquete | Propósito |
|---------|-----------|
| `express` | Framework web para crear la API REST. |
| `cors` | Habilita Cross-Origin Resource Sharing. |
| `jsonwebtoken` | Generación y verificación de tokens JWT. |
| `bcryptjs` | Hash de contraseñas. |
| `nodemon` (dev) | Reinicio automático del servidor en desarrollo. |

### Instalación

```bash
# Dependencias actuales (ya instaladas)
npm install sequelize mysql2 dotenv
npm install --save-dev sequelize-cli

# Dependencias futuras (instalar cuando se creen controllers/routes)
npm install express cors jsonwebtoken bcryptjs
npm install --save-dev nodemon
```

---

## 🗃️ Migraciones

Las migraciones gestionan el esquema de la base de datos de forma versionada. Están numeradas del 001 al 023 en orden estricto de dependencias FK.

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
```

---

## 🔗 Convenciones del Proyecto

| Aspecto | Convención |
|---------|-----------|
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

## 🔐 Seguridad (Diseñada)

- **Autenticación:** Basada en tokens JWT (por implementar).
- **Contraseñas:** Campo `password_hash` en USUARIOS, preparado para bcrypt.
- **Roles y Permisos:** Sistema RBAC con tabla pivote ROLES_PERMISOS.
- **Auditoría:** Todas las acciones quedan registradas en `HISTORIAL_AUDITORIA` con FK SET NULL para preservar registros si se elimina el usuario.

---

## 📝 Notas Adicionales

- El backend utiliza **CommonJS** (`require/module.exports`) como sistema de módulos.
- La base de datos debe ser creada previamente en MySQL con el nombre `SistemaBancario`.
- Las migraciones crean las 23 tablas automáticamente con `npx sequelize-cli db:migrate`.
- La documentación detallada de cada entidad está en `ENTIDADES_DOC.md`.
- La carpeta `FrontEnd/` se mantiene aislada y no es gestionada por este backend.
