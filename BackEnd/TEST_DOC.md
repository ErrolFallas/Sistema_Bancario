# Testing Backend — Jest

## Objetivo General
La implementación de pruebas unitarias e integración en el backend del Sistema Bancario tiene como fin garantizar la estabilidad, seguridad y correcto funcionamiento de las reglas de negocio críticas. Estas pruebas permiten:

- **Prevenir regresiones:** Asegurar que los cambios nuevos no rompan funcionalidades existentes.
- **Validar RBAC:** Verificar que las restricciones de roles se apliquen correctamente en cada endpoint.
- **Asegurar respuestas HTTP correctas:** Validar que el servidor responda con los status codes (200, 201, 400, 401, 403, etc.) y estructuras JSON esperadas.
- **Verificar autenticación JWT:** Garantizar que solo usuarios con tokens válidos y sesiones activas accedan a recursos protegidos.
- **Validar jerarquía de roles:** Asegurar que un rol inferior no pueda crear o modificar a uno superior.
- **Proteger reglas de SUPER_ADMIN:** Hacer cumplir los límites de gobernanza (ej: máximo 2 SUPER_ADMIN).

---

## Documentación de Pruebas por Archivo

### auth.test.js
- **Qué valida:** El flujo de inicio de sesión, la generación de cookies de seguridad y la protección de rutas.
- **Por qué es importante:** Es la primera línea de defensa del sistema.
- **Qué riesgo evita:** Accesos no autorizados y uso de cuentas inactivas.
- **Qué regla protege:** La integridad de la autenticación y el estado de la sesión (`usuario_logeado`).

## Hardening de Seguridad y Gobernanza (Fase 2)

### 1. Refactorización de Arquitectura (Separación App/Server)
- **Vulnerabilidad:** Acoplamiento excesivo que disparaba conexiones a base de datos real durante los tests.
- **Corrección:** Separación de `app.js` (configuración Express) y `server.js` (inicio de servidor y DB).
- **Impacto:** Pruebas unitarias limpias sin efectos secundarios en producción.

### 2. Hardening de Seniority (SUPER_ADMIN)
- **Vulnerabilidad:** Inconsistencia de tipos (Objeto vs String) que permitía a administradores recientes desactivar a los fundadores.
- **Corrección:** Validación robusta en `jerarquia.js` que soporta objetos de asociación de Sequelize y compara fechas de creación (`createdAt`).
- **Riesgo Mitigado:** Escalada de privilegios y toma de control hostil del sistema por parte de administradores nuevos.

### 3. Protección de Ownership (Propiedad de Recursos)
- **Vulnerabilidad:** Los clientes podían acceder o modificar perfiles y registros de otros clientes manipulando el ID en la URL (Broken Object Level Authorization - BOLA).
- **Corrección:** Integración de validación de propiedad en el middleware `verificarPropiedad.js` y protección a nivel de controlador para la entidad `Usuario`.
- **Riesgo Mitigado:** Fuga de datos personales (PII) y manipulación no autorizada de cuentas de terceros.

### 4. Categorización de Errores (401 vs 403)
- **Mejora:** Diferenciación clara entre errores de sesión (401) y permisos insuficientes (403).
- **Impacto:** Mejor integración con el Frontend y auditoría de seguridad más precisa.

### 5. Auditoría Ágil (`auditRequest`)
- **Mejora:** Implementación de helper `auditRequest` que captura automáticamente el usuario y la IP desde la petición.
- **Impacto:** Reducción de código repetitivo y menor probabilidad de omitir registros de auditoría en nuevos endpoints.

---

## Actualización de Suite Jest (Fase 3: Senior QA)

### 1. Corrección de Falsos Negativos y Mocks de Alta Fidelidad
- **Problema:** Los tests antiguos fallaban con errores `500` porque los mocks de Sequelize carecían de métodos como `.toJSON()` y `.update()`, los cuales ahora son esenciales para la lógica de seguridad y auditoría.
- **Solución:** Se implementaron helpers de creación de instancias mock que imitan el comportamiento real de los modelos de Sequelize, incluyendo persistencia simulada en memoria para el método `.update()`.
- **Resultado:** Eliminación de bloqueos técnicos en la suite de pruebas.

### 2. Detección y Resolución de Bugs Legítimos
- **Hallazgo Crítico:** Se detectó que `UsuarioController.js` utilizaba la constante `ROLES` y la utilidad `tieneDerechoAcceso` sin haberlas importado, lo que disparaba errores fatales en tiempo de ejecución al listar o consultar usuarios.
- **Corrección:** Se sincronizaron las importaciones en el controlador, resolviendo el bug "fantasma" que afectaba la estabilidad del backend.

### 3. Alineación con Reglas de Gobernanza y Ownership
- **Ajuste de Expectativas:** Pruebas que antes fallaban al intentar realizar acciones no autorizadas (como un `CLIENTE` editando a otro) ahora validan correctamente el código `403 Forbidden` y los mensajes de error específicos de **Ownership**.
- **Jerarquía:** Se actualizaron los tests de reactivación y desactivación para validar estrictamente las reglas de **Seniority** (SUPER_ADMIN antiguo protegido) y **RBAC Jerárquico** (ADMIN > GERENTE).

### 4. Sincronización de Autenticación (401 vs 403)
- **Mejora:** Se corrigieron los mocks de JWT y sesión para asegurar que los campos `cuentaActiva` y `usuarioLogeado` sean validados correctamente por el middleware `autenticarToken.js`.
- **Impacto:** Transición de una suite con fallos aleatorios a una suite determinista alineada con la seguridad productiva.


### usuario.test.js
- **Qué valida:** La gestión de usuarios y la restricción de acceso por rol (RBAC).
- **Por qué es importante:** Controla quién puede ver y gestionar la lista de usuarios del sistema.
- **Qué riesgo evita:** Fugas de información sensible de otros usuarios.
- **Qué regla protege:** Las políticas de visibilidad de staff bancario (ADMIN, GERENTE, EMPLEADO).

### usuariocompleto.test.js
- **Qué valida:** La creación transaccional de un usuario junto con su entidad asociada (Cliente o Empleado) y los límites de SUPER_ADMIN.
- **Por qué es importante:** Garantiza que no queden datos huérfanos si una parte del registro falla (atomicidad).
- **Qué riesgo evita:** Escalamiento de privilegios y desbordamiento de cuentas administrativas.
- **Qué regla protege:** La jerarquía de creación de roles y el límite máximo de 2 SUPER_ADMIN.

### empleado.test.js
- **Qué valida:** El registro y consulta de empleados bancarios.
- **Por qué es importante:** Asegura que los datos del personal operativo sean consistentes.
- **Qué riesgo evita:** Creación de empleados con datos incompletos o sin banco asociado.
- **Qué regla protege:** La integridad de la estructura organizacional del banco.

### cliente.test.js
- **Qué valida:** La gestión de clientes y sus validaciones de campos obligatorios.
- **Por qué es importante:** Los clientes son la entidad principal de las operaciones bancarias.
- **Qué riesgo evita:** Registros de clientes corruptos o duplicados.
- **Qué regla protege:** La integridad de los datos personales y de contacto de los cuentahabientes.

### historialauditoria.test.js
- **Qué valida:** El acceso restringido a los logs del sistema y el correcto registro de acciones.
- **Por qué es importante:** Proporciona trazabilidad total sobre lo que ocurre en el sistema.
- **Qué riesgo evita:** Manipulación o lectura no autorizada de evidencias de auditoría.
- **Qué regla protege:** La gobernanza y el cumplimiento normativo de transparencia bancaria.

---

## Ampliación de Cobertura: Seguridad y Gobernanza Avanzada

### governance.test.js (Nuevo)
- **Límite de SUPER_ADMIN:** Valida que el sistema rechace la creación de un tercer SUPER_ADMIN activo, protegiendo el quórum administrativo.
- **Protección de Seniority:** Verifica que un SUPER_ADMIN reciente no pueda desactivar a uno más antiguo, evitando "golpes de estado" internos.
- **Abandono de Cargo:** Asegura que el último SUPER_ADMIN no pueda auto-rebajarse de rol, garantizando que el sistema nunca se quede sin administración suprema.
- **Jerarquía de Creación:** Valida que los roles solo puedan crear usuarios de nivel inferior (ej: GERENTE no puede crear ADMIN), protegiendo la estructura RBAC.
- **Transiciones de Rol (422):** Verifica que el sistema solicite datos de empleado (status 422) cuando un usuario CLIENTE es promovido a un rol operativo, asegurando la integridad de la base de datos de recursos humanos.

### Seguridad en auth.test.js (Ampliación)
- **Sesiones Inactivas:** Valida que si una cuenta se desactiva mientras tiene un token válido, el acceso sea revocado inmediatamente en la siguiente petición.
- **Tokens Corruptos:** Asegura que cualquier intento de usar un JWT alterado o corrupto resulte en un error 403, protegiendo contra ataques de sesión.

### Jerarquía en usuario.test.js (Ampliación)
- **Auto-Desactivación (Soft Delete):** Verifica que los usuarios puedan cerrar su propia cuenta de forma segura.
- **Reactivación Jerárquica:** Garantiza que un usuario de menor rango no pueda reactivar cuentas de rangos superiores, manteniendo el control de acceso en niveles adecuados.

### Transaccionalidad en usuariocompleto.test.js (Ampliación)
- **Rollback Transaccional:** Valida que si la creación de un usuario falla (ej: error inesperado), la creación previa del cliente o empleado se revierta automáticamente, evitando la corrupción de datos y registros huérfanos.
