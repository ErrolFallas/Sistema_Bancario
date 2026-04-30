// ============================================
// Modelo: EstadoPrestamo
// Tabla: ESTADOS_PRESTAMO
// ============================================

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const EstadoPrestamo = sequelize.define('EstadoPrestamo', {
    idEstadoPrestamo: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_estado_prestamo',
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'El nombre del estado de préstamo es obligatorio' },
      },
    },
  }, {
    tableName: 'ESTADOS_PRESTAMO',
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return EstadoPrestamo;
};
