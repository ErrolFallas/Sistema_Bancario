// ============================================
// Modelo: Canal
// Tabla: CANALES
// ============================================

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Canal = sequelize.define('Canal', {
    idCanal: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_canal',
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'El nombre del canal es obligatorio' },
      },
    },
  }, {
    tableName: 'CANALES',
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return Canal;
};
