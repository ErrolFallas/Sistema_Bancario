# 📊 Documentación de Entidades — Sistema Bancario

---

## CLIENTES

**Descripción:**
Representa a las personas físicas que utilizan los servicios financieros del banco. Almacena su información personal y de contacto (nombre, apellido, cédula, email, teléfono, dirección).

**Función en el sistema:**
Es la entidad central del negocio. Todo servicio bancario (cuentas, tarjetas, préstamos, transacciones) está vinculado a un cliente. Sin clientes, el sistema no tiene razón de existir. La creación de clientes solo puede ser realizada por roles autorizados: `SUPER_ADMIN`, `ADMIN`, `GERENTE` o `EMPLEADO`. Un usuario con rol `CLIENTE` **NO** puede crear otros clientes.

**Relaciones:**
- `Cliente ↔ Cuenta` — N:M a través de CLIENTES_CUENTAS (un cliente puede tener varias cuentas, una cuenta puede ser compartida).
- `Cliente → Usuario` — 1:N (un cliente puede tener uno o más usuarios de acceso).
- `Cliente → Transacción` — 1:N (un cliente realiza múltiples transacciones).
- `Cliente → Préstamo` — 1:N (un cliente puede tener varios préstamos).

**Campos principales:**
`id_cliente` (PK), `nombre`, `apellido`, `cedula` (UNIQUE), `email`, `telefono`, `direccion`, `created_at`, `updated_at`.

> **Nota:** El campo `fecha_registro` fue movido a la tabla USUARIOS (migración 024), ya que la fecha de registro es un atributo del acceso al sistema, no del perfil del cliente.

**Ejemplo:**
> Juan Pérez (cédula: 1-1234-5678) es registrado por un empleado del banco. Se le crea un registro en CLIENTES con su nombre, apellido, cédula, email y teléfono. Luego, se crea un USUARIO vinculado con `id_cliente` para que pueda acceder al sistema.

---

## BANCOS

**Descripción:**
Representa la institución financiera que opera el sistema. Almacena nombre, código único, dirección y teléfono del banco.

**Función en el sistema:**
Es la entidad organizacional raíz. Las cuentas bancarias, empleados y préstamos pertenecen a un banco específico. Permite que el sistema soporte múltiples sucursales o entidades bancarias.

**Relaciones:**
- `Banco → Empleado` — 1:N (un banco tiene muchos empleados).
- `Banco → Cuenta` — 1:N (un banco administra muchas cuentas).
- `Banco → Préstamo` — 1:N (un banco otorga muchos préstamos).

**Ejemplo:**
> Banco Nacional (código: BN-001) tiene su sede en San José. Todas las cuentas abiertas en esta institución referencia a este registro, así como los empleados contratados y los préstamos otorgados.

---

## EMPLEADOS

**Descripción:**
Representa al personal del banco que administra y opera el sistema. Almacena nombre, apellido, puesto, estado activo y el banco al que pertenece.

**Función en el sistema:**
Los empleados son los operadores internos. A través de un usuario asociado, acceden al sistema con permisos administrativos para gestionar clientes, cuentas, transacciones y préstamos.

**Relaciones:**
- `Empleado → Banco` — N:1 (cada empleado pertenece a un banco).
- `Empleado → Usuario` — 1:N (un empleado puede tener credenciales de acceso al sistema).

**Ejemplo:**
> María López es cajera (puesto: "Cajera") del Banco Nacional. Tiene un usuario con rol "cajero" que le permite procesar depósitos y retiros, pero no aprobar préstamos.

---

## USUARIOS

**Descripción:**
Representa las credenciales de acceso al sistema. Un usuario puede estar vinculado a un cliente (acceso banca en línea) o a un empleado (acceso administrativo), pero **nunca a ambos simultáneamente**. Incluye `fecha_registro` para rastrear cuándo se creó el acceso.

**Función en el sistema:**
Es la puerta de entrada al sistema. Controla la autenticación mediante un **hash de la contraseña (usando bcrypt)** y, a través de su rol y la generación de un **token JWT (expiración 30 min)**, determina qué acciones puede realizar cada persona. Soporta *soft delete* mediante el campo `cuenta_activa` y control de sesiones mediante el campo `usuario_logeado`. Para usar el sistema, ambas condiciones deben ser verdaderas.

**Reglas de validación por rol (implementadas en `UsuarioController`):**

| Rol | `id_cliente` | `id_empleado` | Descripción |
|-----|-------------|---------------|-------------|
| `SUPER_ADMIN` | ❌ null | ❌ null | Solo se crea vía `/auth/register` (primer usuario del sistema) |
| `ADMIN` | ❌ null | ❌ null | Sin relaciones con cliente ni empleado |
| `CLIENTE` | ✅ obligatorio | ❌ null | Debe existir previamente un registro en CLIENTES |
| `EMPLEADO` | ❌ null | ✅ obligatorio | Debe existir previamente un registro en EMPLEADOS |
| `GERENTE` | ❌ null | ✅ obligatorio | Debe existir previamente un registro en EMPLEADOS |

**Flujos de creación y sesión:**
- **Registro público** (`POST /auth/register`): Primer usuario → `SUPER_ADMIN` sin relaciones. Siguientes → `CLIENTE`, requiere `id_cliente` previo.
- **Creación administrativa** (`POST /usuarios`): Requiere JWT. Valida reglas por rol antes de crear.
- **Login / Logout**: El login valida credenciales y marca `usuario_logeado = true`. El logout (requiere token válido) marca `usuario_logeado = false`. El middleware de autenticación valida ambos en cada petición.

**Campos principales:**
`id_usuario` (PK), `username` (UNIQUE), `password_hash`, `cuenta_activa` (BOOLEAN, default true), `usuario_logeado` (BOOLEAN, default false), `fecha_registro` (default CURRENT_TIMESTAMP), `id_rol` (FK → ROLES), `id_cliente` (FK nullable → CLIENTES), `id_empleado` (FK nullable → EMPLEADOS), `created_at`, `updated_at`.

**Relaciones:**
- `Usuario → Rol` — N:1 (cada usuario tiene un rol asignado).
- `Usuario → Cliente` — N:1 nullable (si es un usuario de banca en línea).
- `Usuario → Empleado` — N:1 nullable (si es un usuario administrativo).
- `Usuario → HistorialAuditoria` — 1:N (las acciones del usuario quedan registradas automáticamente).

**Ejemplo:**
> Juan Pérez (cliente) tiene el usuario "jperez" con rol "CLIENTE" y `id_cliente=1`. María López (empleada) tiene el usuario "mlopez" con rol "EMPLEADO" y `id_empleado=2`. El SUPER_ADMIN "root" no tiene ni `id_cliente` ni `id_empleado`. Ambos acceden al mismo sistema pero ven interfaces y permisos distintos.

---

## ROLES

**Descripción:**
Define los niveles de acceso dentro del sistema. Cada rol agrupa un conjunto de permisos que determinan qué puede hacer un usuario.

**Función en el sistema:**
Implementa el control de acceso basado en roles (RBAC). Permite crear perfiles como "administrador", "cajero", "cliente" y asignar permisos granulares a cada uno.

**Relaciones:**
- `Rol ↔ Permiso` — N:M a través de ROLES_PERMISOS (un rol tiene muchos permisos, un permiso puede estar en varios roles).
- `Rol → Usuario` — 1:N (un rol se asigna a muchos usuarios).

**Ejemplo:**
> El rol "administrador" tiene permisos para crear empleados, aprobar préstamos y ver auditoría. El rol "cliente" solo puede ver sus cuentas y realizar transferencias.

---

## PERMISOS

**Descripción:**
Representa acciones específicas que pueden realizarse en el sistema. Cada permiso es una capacidad individual como "crear_cuenta", "aprobar_prestamo" o "ver_reportes".

**Función en el sistema:**
Proporciona granularidad al sistema de seguridad. En vez de dar acceso total por rol, se pueden asignar permisos específicos, permitiendo configuraciones flexibles.

**Relaciones:**
- `Permiso ↔ Rol` — N:M a través de ROLES_PERMISOS (un permiso puede pertenecer a varios roles).

**Ejemplo:**
> El permiso "aprobar_prestamo" está asignado a los roles "administrador" y "gerente", pero no al rol "cajero". Si un nuevo rol "supervisor" necesita esta capacidad, basta con asociar el permiso existente.

---

## CUENTAS

**Descripción:**
Representa las cuentas bancarias donde los clientes almacenan su dinero. Incluye número de cuenta único, saldo actual, estado activo/inactivo y fecha de apertura.

**Función en el sistema:**
Es el eje operativo financiero. Las transacciones mueven dinero entre cuentas, las tarjetas se emiten sobre cuentas, y los movimientos registran cada cambio de saldo.
*Nota de implementación:* Al crear una cuenta, el sistema **valida obligatoriamente** que esté asociada a un `id_cliente` o `id_empleado`, y auto-genera el número de cuenta en formato `CR-YYYYMMDD-XXXX`.

**Relaciones:**
- `Cuenta → Banco` — N:1 (cada cuenta pertenece a un banco).
- `Cuenta → TipoCuenta` — N:1 (cada cuenta tiene un tipo: ahorro, corriente).
- `Cuenta ↔ Cliente` — N:M a través de CLIENTES_CUENTAS (cuentas compartidas).
- `Cuenta → Tarjeta` — 1:N (una cuenta puede tener varias tarjetas).
- `Cuenta → Movimiento` — 1:N (cada movimiento impacta una cuenta).
- `Cuenta → Transacción` — 1:N como origen y 1:N como destino.

**Ejemplo:**
> La cuenta CTA-000123 es una cuenta de ahorro en Banco Nacional con saldo de ₡500,000. Pertenece a Juan Pérez y tiene asociada una tarjeta de débito Visa.

---

## CLIENTES_CUENTAS

**Descripción:**
Tabla pivote que implementa la relación muchos a muchos entre clientes y cuentas. Permite que una cuenta sea compartida por varios titulares.

**Función en el sistema:**
Soporta escenarios de cuentas mancomunadas o compartidas. Un constraint único (id_cliente + id_cuenta) evita que se duplique la asociación.

**Relaciones:**
- `ClienteCuenta → Cliente` — N:1 (referencia al cliente titular).
- `ClienteCuenta → Cuenta` — N:1 (referencia a la cuenta compartida).

**Ejemplo:**
> Juan Pérez y Ana Pérez (esposos) comparten la cuenta CTA-000456. Existen dos registros en CLIENTES_CUENTAS: uno vinculando a Juan con CTA-000456 y otro vinculando a Ana con la misma cuenta.

---

## TIPOS_CUENTA

**Descripción:**
Catálogo que define las características financieras de cada tipo de cuenta: tasa de interés, comisión mensual y saldo mínimo requerido.

**Función en el sistema:**
Centraliza las reglas financieras por tipo de cuenta. Cuando se crea una nueva cuenta, hereda las condiciones de su tipo sin necesidad de configurarlas manualmente.

**Relaciones:**
- `TipoCuenta → Cuenta` — 1:N (un tipo aplica a muchas cuentas).

**Ejemplo:**
> El tipo "Ahorro" tiene tasa de interés 2.5%, comisión mensual ₡0 y saldo mínimo ₡10,000. El tipo "Corriente" tiene tasa 0%, comisión ₡3,500 y saldo mínimo ₡50,000.

---

## TARJETAS

**Descripción:**
Representa los medios de pago físicos o virtuales asociados a una cuenta bancaria. Almacena número de tarjeta único y fecha de expiración.

**Función en el sistema:**
Extiende la funcionalidad de una cuenta permitiendo pagos en comercios, retiros en cajeros y compras en línea. Cada tarjeta tiene un tipo, marca y estado.
*Seguridad:* Por normativa bancaria, el número de la tarjeta no se guarda en texto plano; se utiliza un **hook de Sequelize para hashear (bcrypt)** el número automáticamente antes de guardarlo en la base de datos.

**Relaciones:**
- `Tarjeta → Cuenta` — N:1 (cada tarjeta está vinculada a una cuenta).
- `Tarjeta → TipoTarjeta` — N:1 (débito o crédito).
- `Tarjeta → MarcaTarjeta` — N:1 (Visa, Mastercard, etc.).
- `Tarjeta → EstadoTarjeta` — N:1 (activa, bloqueada, vencida).

**Ejemplo:**
> Juan Pérez tiene una tarjeta Visa Débito (número 4000-XXXX-XXXX-1234) vinculada a su cuenta de ahorro. La tarjeta está activa y vence en 12/2028.

---

## TIPOS_TARJETA

**Descripción:**
Catálogo que clasifica las tarjetas según su naturaleza financiera.

**Función en el sistema:**
Permite diferenciar el comportamiento de las tarjetas. Una tarjeta de débito descuenta directamente del saldo; una de crédito genera deuda con el banco.

**Relaciones:**
- `TipoTarjeta → Tarjeta` — 1:N (un tipo aplica a muchas tarjetas).

**Ejemplo:**
> Los tipos registrados son: "Débito" (descuenta del saldo disponible) y "Crédito" (utiliza una línea de crédito otorgada por el banco).

---

## MARCAS_TARJETA

**Descripción:**
Catálogo que identifica al proveedor o red de procesamiento de la tarjeta.

**Función en el sistema:**
Determina en qué redes de pago es aceptada la tarjeta y qué beneficios ofrece al titular.

**Relaciones:**
- `MarcaTarjeta → Tarjeta` — 1:N (una marca aplica a muchas tarjetas).

**Ejemplo:**
> Las marcas registradas son: "Visa", "Mastercard", "American Express". Una tarjeta Visa es aceptada en todos los comercios afiliados a la red Visa a nivel mundial.

---

## ESTADOS_TARJETA

**Descripción:**
Catálogo que define los posibles estados en el ciclo de vida de una tarjeta.

**Función en el sistema:**
Controla si una tarjeta puede ser utilizada para transacciones. Una tarjeta bloqueada o vencida es rechazada automáticamente.

**Relaciones:**
- `EstadoTarjeta → Tarjeta` — 1:N (un estado aplica a muchas tarjetas).

**Ejemplo:**
> Estados posibles: "Activa" (puede operar), "Bloqueada" (suspendida por seguridad), "Vencida" (superó fecha de expiración), "Cancelada" (dada de baja permanente).

---

## TRANSACCIONES

**Descripción:**
Registra cada operación financiera realizada en el sistema. Incluye monto, fecha, descripción, cuenta origen, cuenta destino (opcional), canal, tipo y estado.

**Función en el sistema:**
Es el corazón operativo del banco. Cada movimiento de dinero queda registrado como una transacción, proporcionando trazabilidad completa de todas las operaciones financieras.

**Relaciones:**
- `Transacción → Cliente` — N:1 (cada transacción la realiza un cliente).
- `Transacción → Cuenta (origen)` — N:1 con alias `cuentaOrigen`.
- `Transacción → Cuenta (destino)` — N:1 nullable con alias `cuentaDestino`.
- `Transacción → Canal` — N:1 (por dónde se realizó).
- `Transacción → TipoTransacción` — N:1 (qué tipo de operación).
- `Transacción → EstadoTransacción` — N:1 (en qué estado está).
- `Transacción → Movimiento` — 1:N (genera movimientos contables).
- `Transacción → PagoPréstamo` — 1:1 (si es un pago de préstamo).

**Ejemplo:**
> Juan Pérez transfiere ₡100,000 desde su cuenta CTA-000123 a la cuenta CTA-000789 de Ana Pérez, vía APP móvil. Se crea una transacción tipo "Transferencia", estado "Completada", canal "APP".

---

## TIPOS_TRANSACCION

**Descripción:**
Catálogo que clasifica las transacciones según la naturaleza de la operación.

**Función en el sistema:**
Permite categorizar y filtrar transacciones para reportes, estadísticas y reglas de negocio específicas por tipo.

**Relaciones:**
- `TipoTransacción → Transacción` — 1:N (un tipo aplica a muchas transacciones).

**Ejemplo:**
> Tipos registrados: "Depósito", "Retiro", "Transferencia", "Pago de Servicios", "Pago de Préstamo". Cada transacción en el sistema se clasifica con uno de estos tipos.

---

## ESTADOS_TRANSACCION

**Descripción:**
Catálogo que define las fases por las que pasa una transacción durante su procesamiento.

**Función en el sistema:**
Controla el flujo de vida de una transacción. Una transacción pendiente no ha afectado saldos; una completada sí; una rechazada fue denegada.

**Relaciones:**
- `EstadoTransacción → Transacción` — 1:N (un estado aplica a muchas transacciones).

**Ejemplo:**
> Estados posibles: "Pendiente" (en proceso), "Completada" (ejecutada exitosamente), "Rechazada" (fondos insuficientes o error), "Reversada" (deshecha por el banco).

---

## MOVIMIENTOS

**Descripción:**
Representa el impacto contable de una transacción en una cuenta específica. Cada transacción genera uno o dos movimientos (débito en origen, crédito en destino).

**Función en el sistema:**
Es el registro contable granular. Mientras la transacción registra "qué pasó", el movimiento registra "cómo afectó a cada cuenta". Permite reconstruir el historial de saldos.

**Relaciones:**
- `Movimiento → Cuenta` — N:1 (cada movimiento impacta una cuenta).
- `Movimiento → Transacción` — N:1 (cada movimiento pertenece a una transacción).

**Ejemplo:**
> La transferencia de ₡100,000 genera dos movimientos: un movimiento tipo "debito" por ₡100,000 en la cuenta origen (CTA-000123), y un movimiento tipo "credito" por ₡100,000 en la cuenta destino (CTA-000789).

---

## CANALES

**Descripción:**
Catálogo que identifica el medio tecnológico o físico por el cual se realiza una transacción.

**Función en el sistema:**
Permite rastrear desde dónde operan los clientes, generar estadísticas de uso por canal y aplicar reglas de seguridad diferenciadas.

**Relaciones:**
- `Canal → Transacción` — 1:N (un canal es usado por muchas transacciones).

**Ejemplo:**
> Canales registrados: "ATM" (cajero automático), "APP" (aplicación móvil), "WEB" (banca en línea), "Sucursal" (ventanilla), "POS" (punto de venta en comercio).

---

## PRESTAMOS

**Descripción:**
Representa los créditos otorgados por el banco a sus clientes. Almacena monto, tasa de interés, plazo en meses, fechas de inicio/fin y saldo pendiente.

**Función en el sistema:**
Gestiona el ciclo de vida completo de un crédito: desde su aprobación hasta su liquidación. El saldo pendiente se actualiza con cada pago realizado.

**Relaciones:**
- `Préstamo → Cliente` — N:1 (cada préstamo pertenece a un cliente).
- `Préstamo → Banco` — N:1 (cada préstamo lo otorga un banco).
- `Préstamo → EstadoPréstamo` — N:1 (estado actual del préstamo).
- `Préstamo → PagoPréstamo` — 1:N (un préstamo tiene muchos pagos).

**Ejemplo:**
> Juan Pérez solicita un préstamo de ₡5,000,000 al 12% anual a 36 meses. Se crea con estado "Activo", saldo pendiente ₡5,000,000. Cada mes realiza un pago que reduce el saldo.

---

## ESTADOS_PRESTAMO

**Descripción:**
Catálogo que define las fases del ciclo de vida de un préstamo.

**Función en el sistema:**
Controla el estado del crédito para determinar si requiere cobros, si ya fue liquidado o si está en mora para acciones de cobranza.

**Relaciones:**
- `EstadoPréstamo → Préstamo` — 1:N (un estado aplica a muchos préstamos).

**Ejemplo:**
> Estados posibles: "Activo" (con pagos pendientes), "Pagado" (liquidado completamente), "En Mora" (pagos atrasados), "Reestructurado" (condiciones modificadas).

---

## PAGOS_PRESTAMO

**Descripción:**
Registra cada pago individual realizado por un cliente a un préstamo. Vincula el pago con la transacción financiera correspondiente.

**Función en el sistema:**
Conecta el mundo de préstamos con el de transacciones. Cada pago de préstamo es también una transacción bancaria, lo que garantiza que el movimiento de dinero quede registrado en ambos contextos.

**Relaciones:**
- `PagoPréstamo → Préstamo` — N:1 (cada pago pertenece a un préstamo).
- `PagoPréstamo → Transacción` — N:1, relación 1:1 lógica (cada pago corresponde a exactamente una transacción).

**Ejemplo:**
> Juan Pérez realiza su cuota mensual de ₡165,000 al préstamo PRE-001. Se crea una transacción tipo "Pago de Préstamo" y un registro en PAGOS_PRESTAMO que vincula esa transacción con el préstamo PRE-001. El saldo pendiente se reduce.

---

## HISTORIAL_AUDITORIA

**Descripción:**
Registro cronológico automático de todas las acciones de creación realizadas en el sistema. Almacena quién hizo qué, en qué tabla, a qué registro, desde qué IP, cuándo y con una **descripción legible** del contexto.

**Función en el sistema:**
Proporciona trazabilidad total para cumplimiento regulatorio, investigación de fraudes y rendición de cuentas. La auditoría se registra **automáticamente** desde los controllers (no depende de endpoints manuales ni de hooks de Sequelize). Si se elimina el usuario, el registro de auditoría se preserva (FK con SET NULL).

**Sistema de auditoría automática:**
El helper `utils/auditoria.js` se invoca dentro de cada controller después de cada `.create()` exitoso. Genera descripciones dinámicas que incluyen:
- **Quién** creó (username, rol, nombre del empleado si aplica)
- **Qué** se creó (nombre del cliente, empleado, o usuario)
- **En qué contexto** (rol asignado, puesto del empleado)

**Puntos de integración:**

| Controller | Método | Tabla Auditada |
|-----------|--------|----------------|
| `UsuarioController` | `crearUsuario` | USUARIOS |
| `AuthController` | `register` | USUARIOS |
| `ClienteController` | `crearCliente` | CLIENTES |
| `EmpleadoController` | `crearEmpleado` | EMPLEADOS |

**Campos principales:**
`id_auditoria` (PK), `accion`, `tabla_afectada`, `id_registro`, `descripcion` (TEXT), `fecha`, `ip`, `id_usuario` (FK nullable → USUARIOS), `created_at`, `updated_at`.

**Relaciones:**
- `HistorialAuditoria → Usuario` — N:1 nullable (quién realizó la acción; SET NULL si el usuario es eliminado).

**Ejemplos de registros generados automáticamente:**

> **Creación de usuario CLIENTE:**
> acción="CREATE", tabla="USUARIOS", descripción="El empleado María López (rol: EMPLEADO) creó el usuario jperez asociado al cliente Juan Pérez"

> **Creación de empleado:**
> acción="CREATE", tabla="EMPLEADOS", descripción="El SUPER_ADMIN root creó el empleado María López (puesto: Cajera)"

> **Auto-registro del primer SUPER_ADMIN:**
> acción="CREATE", tabla="USUARIOS", descripción="Registro automático del primer SUPER_ADMIN: root"

> **Auto-registro de CLIENTE:**
> acción="CREATE", tabla="USUARIOS", descripción="Auto-registro del usuario jperez como CLIENTE (Cliente: Juan Pérez)"

---

## ROLES_PERMISOS

**Descripción:**
Tabla pivote que implementa la relación muchos a muchos entre roles y permisos. Un constraint único (id_rol + id_permiso) evita duplicados.

**Función en el sistema:**
Permite configurar de forma granular qué puede hacer cada rol. Es la base del sistema de control de acceso RBAC (Role-Based Access Control).

**Relaciones:**
- `RolPermiso → Rol` — N:1 (referencia al rol).
- `RolPermiso → Permiso` — N:1 (referencia al permiso).

**Ejemplo:**
> El rol "cajero" (id_rol=2) tiene asignados los permisos: "ver_clientes" (id_permiso=1), "crear_deposito" (id_permiso=5) y "crear_retiro" (id_permiso=6). Son 3 registros en ROLES_PERMISOS.
