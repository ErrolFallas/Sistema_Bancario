// ============================================
// Archivo central de modelos y asociaciones
// Importa todos los modelos, define relaciones
// y exporta la instancia de Sequelize
// ============================================

const { Sequelize } = require('sequelize');
const config = require('../config/config');

// --- Determinar entorno ---
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// --- Crear instancia de Sequelize ---
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    pool: dbConfig.pool,
    logging: dbConfig.logging,
    define: dbConfig.define,
  }
);

// ============================================
// Importar modelos
// ============================================
const Rol = require('./Rol')(sequelize);
const Permiso = require('./Permiso')(sequelize);
const RolPermiso = require('./RolPermiso')(sequelize);
const TipoCuenta = require('./TipoCuenta')(sequelize);
const TipoTarjeta = require('./TipoTarjeta')(sequelize);
const MarcaTarjeta = require('./MarcaTarjeta')(sequelize);
const EstadoTarjeta = require('./EstadoTarjeta')(sequelize);
const TipoTransaccion = require('./TipoTransaccion')(sequelize);
const EstadoTransaccion = require('./EstadoTransaccion')(sequelize);
const Canal = require('./Canal')(sequelize);
const EstadoPrestamo = require('./EstadoPrestamo')(sequelize);
const Banco = require('./Banco')(sequelize);
const Cliente = require('./Cliente')(sequelize);
const Empleado = require('./Empleado')(sequelize);
const Usuario = require('./Usuario')(sequelize);
const Cuenta = require('./Cuenta')(sequelize);
const ClienteCuenta = require('./ClienteCuenta')(sequelize);
const Tarjeta = require('./Tarjeta')(sequelize);
const Transaccion = require('./Transaccion')(sequelize);
const Movimiento = require('./Movimiento')(sequelize);
const Prestamo = require('./Prestamo')(sequelize);
const PagoPrestamo = require('./PagoPrestamo')(sequelize);
const HistorialAuditoria = require('./HistorialAuditoria')(sequelize);

// ============================================
// Definir Asociaciones
// ============================================

// --- ROLES ↔ PERMISOS (N:M) ---
Rol.belongsToMany(Permiso, {
  through: RolPermiso,
  foreignKey: 'id_rol',
  otherKey: 'id_permiso',
  as: 'permisos',
});
Permiso.belongsToMany(Rol, {
  through: RolPermiso,
  foreignKey: 'id_permiso',
  otherKey: 'id_rol',
  as: 'roles',
});

// --- USUARIO → ROL ---
Usuario.belongsTo(Rol, { foreignKey: 'id_rol', as: 'rol' });
Rol.hasMany(Usuario, { foreignKey: 'id_rol', as: 'usuarios' });

// --- USUARIO → CLIENTE (nullable) ---
Usuario.belongsTo(Cliente, { foreignKey: 'id_cliente', as: 'cliente' });
Cliente.hasMany(Usuario, { foreignKey: 'id_cliente', as: 'usuarios' });

// --- USUARIO → EMPLEADO (nullable) ---
Usuario.belongsTo(Empleado, { foreignKey: 'id_empleado', as: 'empleado' });
Empleado.hasMany(Usuario, { foreignKey: 'id_empleado', as: 'usuarios' });

// --- EMPLEADO → BANCO ---
Empleado.belongsTo(Banco, { foreignKey: 'id_banco', as: 'banco' });
Banco.hasMany(Empleado, { foreignKey: 'id_banco', as: 'empleados' });

// --- CUENTA → BANCO ---
Cuenta.belongsTo(Banco, { foreignKey: 'id_banco', as: 'banco' });
Banco.hasMany(Cuenta, { foreignKey: 'id_banco', as: 'cuentas' });

// --- CUENTA → TIPO_CUENTA ---
Cuenta.belongsTo(TipoCuenta, { foreignKey: 'id_tipo_cuenta', as: 'tipoCuenta' });
TipoCuenta.hasMany(Cuenta, { foreignKey: 'id_tipo_cuenta', as: 'cuentas' });

// --- CLIENTE ↔ CUENTA (N:M) ---
Cliente.belongsToMany(Cuenta, {
  through: ClienteCuenta,
  foreignKey: 'id_cliente',
  otherKey: 'id_cuenta',
  as: 'cuentas',
});
Cuenta.belongsToMany(Cliente, {
  through: ClienteCuenta,
  foreignKey: 'id_cuenta',
  otherKey: 'id_cliente',
  as: 'clientes',
});

// --- TARJETA → CUENTA, TIPO, MARCA, ESTADO ---
Tarjeta.belongsTo(Cuenta, { foreignKey: 'id_cuenta', as: 'cuenta' });
Cuenta.hasMany(Tarjeta, { foreignKey: 'id_cuenta', as: 'tarjetas' });

Tarjeta.belongsTo(TipoTarjeta, { foreignKey: 'id_tipo_tarjeta', as: 'tipoTarjeta' });
TipoTarjeta.hasMany(Tarjeta, { foreignKey: 'id_tipo_tarjeta', as: 'tarjetas' });

Tarjeta.belongsTo(MarcaTarjeta, { foreignKey: 'id_marca_tarjeta', as: 'marcaTarjeta' });
MarcaTarjeta.hasMany(Tarjeta, { foreignKey: 'id_marca_tarjeta', as: 'tarjetas' });

Tarjeta.belongsTo(EstadoTarjeta, { foreignKey: 'id_estado_tarjeta', as: 'estadoTarjeta' });
EstadoTarjeta.hasMany(Tarjeta, { foreignKey: 'id_estado_tarjeta', as: 'tarjetas' });

// --- TRANSACCION → CLIENTE ---
Transaccion.belongsTo(Cliente, { foreignKey: 'id_cliente', as: 'cliente' });
Cliente.hasMany(Transaccion, { foreignKey: 'id_cliente', as: 'transacciones' });

// --- TRANSACCION → CUENTA ORIGEN (con alias + foreignKey explícito) ---
Transaccion.belongsTo(Cuenta, { foreignKey: 'id_cuenta_origen', as: 'cuentaOrigen' });
Cuenta.hasMany(Transaccion, { foreignKey: 'id_cuenta_origen', as: 'transaccionesOrigen' });

// --- TRANSACCION → CUENTA DESTINO (con alias + foreignKey explícito) ---
Transaccion.belongsTo(Cuenta, { foreignKey: 'id_cuenta_destino', as: 'cuentaDestino' });
Cuenta.hasMany(Transaccion, { foreignKey: 'id_cuenta_destino', as: 'transaccionesDestino' });

// --- TRANSACCION → CANAL ---
Transaccion.belongsTo(Canal, { foreignKey: 'id_canal', as: 'canal' });
Canal.hasMany(Transaccion, { foreignKey: 'id_canal', as: 'transacciones' });

// --- TRANSACCION → TIPO_TRANSACCION ---
Transaccion.belongsTo(TipoTransaccion, { foreignKey: 'id_tipo_transaccion', as: 'tipoTransaccion' });
TipoTransaccion.hasMany(Transaccion, { foreignKey: 'id_tipo_transaccion', as: 'transacciones' });

// --- TRANSACCION → ESTADO_TRANSACCION ---
Transaccion.belongsTo(EstadoTransaccion, { foreignKey: 'id_estado_transaccion', as: 'estadoTransaccion' });
EstadoTransaccion.hasMany(Transaccion, { foreignKey: 'id_estado_transaccion', as: 'transacciones' });

// --- MOVIMIENTO → CUENTA, TRANSACCION ---
Movimiento.belongsTo(Cuenta, { foreignKey: 'id_cuenta', as: 'cuenta' });
Cuenta.hasMany(Movimiento, { foreignKey: 'id_cuenta', as: 'movimientos' });

Movimiento.belongsTo(Transaccion, { foreignKey: 'id_transaccion', as: 'transaccion' });
Transaccion.hasMany(Movimiento, { foreignKey: 'id_transaccion', as: 'movimientos' });

// --- PRESTAMO → CLIENTE, BANCO, ESTADO ---
Prestamo.belongsTo(Cliente, { foreignKey: 'id_cliente', as: 'cliente' });
Cliente.hasMany(Prestamo, { foreignKey: 'id_cliente', as: 'prestamos' });

Prestamo.belongsTo(Banco, { foreignKey: 'id_banco', as: 'banco' });
Banco.hasMany(Prestamo, { foreignKey: 'id_banco', as: 'prestamos' });

Prestamo.belongsTo(EstadoPrestamo, { foreignKey: 'id_estado_prestamo', as: 'estadoPrestamo' });
EstadoPrestamo.hasMany(Prestamo, { foreignKey: 'id_estado_prestamo', as: 'prestamos' });

// --- PAGO_PRESTAMO → PRESTAMO, TRANSACCION (1:1 con Transaccion) ---
PagoPrestamo.belongsTo(Prestamo, { foreignKey: 'id_prestamo', as: 'prestamo' });
Prestamo.hasMany(PagoPrestamo, { foreignKey: 'id_prestamo', as: 'pagos' });

PagoPrestamo.belongsTo(Transaccion, { foreignKey: 'id_transaccion', as: 'transaccion' });
Transaccion.hasOne(PagoPrestamo, { foreignKey: 'id_transaccion', as: 'pagoPrestamo' });

// --- HISTORIAL_AUDITORIA → USUARIO (onDelete: SET NULL) ---
HistorialAuditoria.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });
Usuario.hasMany(HistorialAuditoria, { foreignKey: 'id_usuario', as: 'auditorias' });

// ============================================
// Exportar todo
// ============================================
module.exports = {
  sequelize,
  Sequelize,
  Rol,
  Permiso,
  RolPermiso,
  TipoCuenta,
  TipoTarjeta,
  MarcaTarjeta,
  EstadoTarjeta,
  TipoTransaccion,
  EstadoTransaccion,
  Canal,
  EstadoPrestamo,
  Banco,
  Cliente,
  Empleado,
  Usuario,
  Cuenta,
  ClienteCuenta,
  Tarjeta,
  Transaccion,
  Movimiento,
  Prestamo,
  PagoPrestamo,
  HistorialAuditoria,
};
