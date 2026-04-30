// ============================================
// Modelo: Permiso
// Tabla: PERMISOS
// ============================================

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Permiso = sequelize.define('Permiso', {
    idPermiso: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_permiso',
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'El nombre del permiso es obligatorio' },
      },
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  }, {
    tableName: 'PERMISOS',
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return Permiso;
};
