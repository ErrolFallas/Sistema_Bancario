// ============================================
// Modelo: EstadoTransaccion
// Tabla: ESTADOS_TRANSACCION
// ============================================

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const EstadoTransaccion = sequelize.define('EstadoTransaccion', {
    idEstadoTransaccion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_estado_transaccion',
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'El nombre del estado de transacción es obligatorio' },
      },
    },
  }, {
    tableName: 'ESTADOS_TRANSACCION',
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return EstadoTransaccion;
};
