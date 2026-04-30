// ============================================
// Modelo: Cuenta
// Tabla: CUENTAS
// ============================================

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Cuenta = sequelize.define('Cuenta', {
    idCuenta: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_cuenta',
    },
    numeroCuenta: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'numero_cuenta',
      validate: {
        notEmpty: { msg: 'El número de cuenta es obligatorio' },
      },
    },
    saldo: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: { args: [0], msg: 'El saldo no puede ser negativo' },
      },
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    fechaApertura: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: DataTypes.NOW,
      field: 'fecha_apertura',
    },
    idBanco: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'id_banco',
      references: {
        model: 'BANCOS',
        key: 'id_banco',
      },
    },
    idTipoCuenta: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'id_tipo_cuenta',
      references: {
        model: 'TIPOS_CUENTA',
        key: 'id_tipo_cuenta',
      },
    },
  }, {
    tableName: 'CUENTAS',
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return Cuenta;
};
