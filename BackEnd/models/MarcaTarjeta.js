// ============================================
// Modelo: MarcaTarjeta
// Tabla: MARCAS_TARJETA
// ============================================

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MarcaTarjeta = sequelize.define('MarcaTarjeta', {
    idMarcaTarjeta: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_marca_tarjeta',
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'El nombre de la marca de tarjeta es obligatorio' },
      },
    },
  }, {
    tableName: 'MARCAS_TARJETA',
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return MarcaTarjeta;
};
