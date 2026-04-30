// ============================================
// Modelo: TipoCuenta
// Tabla: TIPOS_CUENTA
// ============================================

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TipoCuenta = sequelize.define('TipoCuenta', {
    idTipoCuenta: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_tipo_cuenta',
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'El nombre del tipo de cuenta es obligatorio' },
      },
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tasaInteres: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: 'tasa_interes',
      defaultValue: 0.00,
    },
    comisionMensual: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'comision_mensual',
      defaultValue: 0.00,
    },
    saldoMinimo: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'saldo_minimo',
      defaultValue: 0.00,
    },
  }, {
    tableName: 'TIPOS_CUENTA',
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return TipoCuenta;
};
