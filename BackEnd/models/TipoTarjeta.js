// ============================================
// Modelo: TipoTarjeta
// Tabla: TIPOS_TARJETA
// ============================================

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TipoTarjeta = sequelize.define('TipoTarjeta', {
    idTipoTarjeta: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_tipo_tarjeta',
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'El nombre del tipo de tarjeta es obligatorio' },
      },
    },
  }, {
    tableName: 'TIPOS_TARJETA',
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return TipoTarjeta;
};
