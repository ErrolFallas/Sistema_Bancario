# 📦 Documentación del Backend — Sistema Bancario

## 📋 Descripción General

El **Backend del Sistema Bancario** es una API RESTful construida con **Node.js** y **Express.js**, diseñada bajo el patrón de arquitectura **MVC (Modelo - Vista - Controlador)**. Su propósito es gestionar todas las operaciones bancarias: clientes, cuentas, tarjetas, transacciones, préstamos, empleados y auditoría, conectándose a una base de datos **MySQL**.

---

## 🏗️ Arquitectura MVC

El proyecto sigue el patrón **Modelo-Vista-Controlador** para mantener una separación clara de responsabilidades:

```
BackEnd/
├── config/              # Configuración central (DB, JWT, CORS)
│   └── config.js        # Lee variables de .env y las exporta
├── controllers/         # Lógica de negocio (Controladores)
│   ├── clienteController.js
│   ├── cuentaController.js
│   ├── transaccionController.js
│   ├── tarjetaController.js
│   ├── prestamoController.js
│   ├── empleadoController.js
│   ├── usuarioController.js
│   └── ...
├── models/              # Definición de modelos y esquemas (Modelos)
│   ├── Cliente.js
│   ├── Cuenta.js
│   ├── Transaccion.js
│   ├── Tarjeta.js
│   ├── Prestamo.js
│   ├── Empleado.js
│   ├── Usuario.js
│   └── ...
├── routes/              # Definición de rutas/endpoints (Vista/Rutas)
│   ├── clienteRoutes.js
│   ├── cuentaRoutes.js
│   ├── transaccionRoutes.js
│   └── ...
├── middlewares/          # Middlewares (autenticación, validación, errores)
│   ├── authMiddleware.js
│   └── errorHandler.js
├── migrations/          # Scripts de migración de base de datos
├── .env                 # Variables de entorno (NO se sube a Git)
├── package.json         # Dependencias y scripts del proyecto
├── index.js             # Punto de entrada principal del servidor
└── BACKEND_DOC.md       # Este archivo de documentación
```

### ¿Qué hace cada capa?

| Capa            | Responsabilidad                                                                 |
|-----------------|---------------------------------------------------------------------------------|
| **Modelo**      | Define la estructura de datos y la interacción directa con la base de datos MySQL. |
| **Controlador** | Contiene la lógica de negocio. Recibe las peticiones, procesa datos y responde.    |
| **Rutas**       | Define los endpoints de la API y los conecta con los controladores correspondientes. |
| **Middleware**   | Funciones intermedias para autenticación, validación y manejo de errores.         |
| **Config**      | Centraliza la configuración del servidor, base de datos y servicios externos.     |

---

## 🗄️ Base de Datos — Entidades del Sistema

El sistema bancario gestiona las siguientes **18 tablas** en MySQL:

### Entidades Principales

| Entidad                | Descripción                                                      |
|------------------------|------------------------------------------------------------------|
| **CLIENTES**           | Información personal de los clientes del banco.                  |
| **CUENTAS**            | Cuentas bancarias con saldo, estado y tipo.                      |
| **TARJETAS**           | Tarjetas asociadas a cuentas (débito/crédito).                   |
| **TRANSACCIONES**      | Registro de todas las transacciones financieras.                 |
| **PRESTAMOS**          | Préstamos otorgados a clientes con tasas e intereses.            |
| **MOVIMIENTOS**        | Movimientos individuales (débito/crédito) en las cuentas.        |
| **EMPLEADOS**          | Personal del banco con puesto y banco asignado.                  |
| **BANCOS**             | Información de los bancos registrados en el sistema.             |
| **USUARIOS**           | Usuarios del sistema con credenciales de acceso.                 |

### Entidades de Catálogo / Soporte

| Entidad                  | Descripción                                              |
|--------------------------|----------------------------------------------------------|
| **TIPOS_CUENTA**         | Catálogo de tipos de cuenta (ahorro, corriente, etc.).   |
| **TIPOS_TRANSACCION**    | Catálogo de tipos de transacción.                        |
| **TIPOS_TARJETA**        | Catálogo de tipos de tarjeta (débito, crédito).          |
| **MARCAS_TARJETA**       | Catálogo de marcas de tarjeta (Visa, Mastercard, etc.).  |
| **ESTADOS_TARJETA**      | Estados posibles de una tarjeta (activa, bloqueada).     |
| **ESTADOS_TRANSACCION**  | Estados posibles de una transacción (pendiente, completada). |
| **ESTADOS_PRESTAMO**     | Estados de un préstamo (activo, pagado, en mora).        |
| **CANALES**              | Canales por donde se realizan transacciones.             |

### Entidades de Seguridad y Auditoría

| Entidad                | Descripción                                                    |
|------------------------|----------------------------------------------------------------|
| **ROLES**              | Roles de usuario en el sistema (admin, cajero, etc.).          |
| **PERMISOS**           | Permisos individuales del sistema.                             |
| **ROLES_PERMISOS**     | Relación N:M entre roles y permisos.                           |
| **CLIENTES_CUENTAS**   | Relación N:M entre clientes y cuentas (cuentas compartidas).   |
| **PAGOS_PRESTAMO**     | Registro de pagos realizados a préstamos.                      |
| **HISTORIAL_AUDITORIA**| Log de todas las acciones realizadas en el sistema.            |

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
DB_PASSWORD=          # Contraseña de MySQL
DB_NAME=sistema_bancario
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

## 📦 Dependencias Necesarias

| Paquete          | Propósito                                          |
|------------------|----------------------------------------------------|
| `express`        | Framework web para crear la API REST.              |
| `mysql2`         | Driver de MySQL para Node.js.                      |
| `sequelize`      | ORM para interactuar con la base de datos.         |
| `dotenv`         | Carga variables de entorno desde `.env`.           |
| `cors`           | Habilita Cross-Origin Resource Sharing.            |
| `jsonwebtoken`   | Generación y verificación de tokens JWT.           |
| `bcryptjs`       | Hash de contraseñas.                               |
| `nodemon` (dev)  | Reinicio automático del servidor en desarrollo.    |

### Instalación

```bash
npm install express mysql2 sequelize dotenv cors jsonwebtoken bcryptjs
npm install --save-dev nodemon
```

---

## 🚀 Ejecución

```bash
# Desarrollo (con reinicio automático)
npm run dev

# Producción
npm start
```

---

## 🔗 Conexión con el Frontend

El backend expone una API REST que el frontend consume. La comunicación se configura a través de:

- **Puerto:** Definido en `PORT` (por defecto `3000`)
- **CORS:** El origen permitido se define en `CORS_ORIGIN`
- **Formato:** Todas las respuestas son en formato **JSON**

---

## 🔐 Seguridad

- **Autenticación:** Basada en tokens JWT.
- **Contraseñas:** Hasheadas con bcrypt antes de almacenarlas.
- **Roles y Permisos:** Sistema granular de roles con permisos específicos.
- **Auditoría:** Todas las acciones quedan registradas en `HISTORIAL_AUDITORIA`.

---

## 📝 Notas Adicionales

- El backend utiliza **CommonJS** (`require/module.exports`) como sistema de módulos.
- La base de datos debe ser creada previamente en MySQL con el nombre definido en `DB_NAME`.
- Las migraciones en la carpeta `migrations/` permiten crear/modificar tablas de forma controlada.
