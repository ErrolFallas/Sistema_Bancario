// ============================================
// Modelo: PagoPrestamo
// Tabla: PAGOS_PRESTAMO
// ============================================

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PagoPrestamo = sequelize.define('PagoPrestamo', {
    idPago: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_pago',
    },
    idPrestamo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'id_prestamo',
      references: { model: 'PRESTAMOS', key: 'id_prestamo' },
    },
    idTransaccion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'id_transaccion',
      references: { model: 'TRANSACCIONES', key: 'id_transaccion' },
    },
  }, {
    tableName: 'PAGOS_PRESTAMO',
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return PagoPrestamo;
};
