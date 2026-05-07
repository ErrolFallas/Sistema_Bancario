// ============================================
// Modelo: Rol
// Tabla: ROLES
// ============================================

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Rol = sequelize.define('Rol', {
    idRol: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_rol',
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'El nombre del rol es obligatorio' },
      },
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
  }, {
    tableName: 'ROLES',
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return Rol;
};
