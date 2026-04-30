// ============================================
// Modelo: ClienteCuenta
// Tabla: CLIENTES_CUENTAS (tabla pivote N:M)
// ============================================

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ClienteCuenta = sequelize.define('ClienteCuenta', {
    idClienteCuenta: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_cliente_cuenta',
    },
    idCliente: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'id_cliente',
      references: {
        model: 'CLIENTES',
        key: 'id_cliente',
      },
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
  }, {
    tableName: 'CLIENTES_CUENTAS',
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['id_cliente', 'id_cuenta'],
        name: 'unique_cliente_cuenta',
      },
    ],
  });

  return ClienteCuenta;
};
