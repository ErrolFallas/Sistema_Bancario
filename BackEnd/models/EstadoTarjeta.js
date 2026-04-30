// ============================================
// Modelo: EstadoTarjeta
// Tabla: ESTADOS_TARJETA
// ============================================

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const EstadoTarjeta = sequelize.define('EstadoTarjeta', {
    idEstadoTarjeta: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_estado_tarjeta',
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'El nombre del estado de tarjeta es obligatorio' },
      },
    },
  }, {
    tableName: 'ESTADOS_TARJETA',
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return EstadoTarjeta;
};
