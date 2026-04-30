// ============================================
// Modelo: Movimiento
// Tabla: MOVIMIENTOS
// ============================================

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Movimiento = sequelize.define('Movimiento', {
    idMovimiento: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_movimiento',
    },
    tipo: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'El tipo de movimiento es obligatorio' },
        isIn: {
          args: [['debito', 'credito']],
          msg: 'El tipo debe ser "debito" o "credito"',
        },
      },
    },
    monto: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: { args: [0], msg: 'El monto no puede ser negativo' },
      },
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    idCuenta: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'id_cuenta',
      references: {
        model: 'CUENTAS',
        key: 'id_cuenta',
      },
    },
    idTransaccion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'id_transaccion',
      references: {
        model: 'TRANSACCIONES',
        key: 'id_transaccion',
      },
    },
  }, {
    tableName: 'MOVIMIENTOS',
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return Movimiento;
};
