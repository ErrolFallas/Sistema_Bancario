// ============================================
// Modelo: RolPermiso
// Tabla: ROLES_PERMISOS (tabla pivote N:M)
// ============================================

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RolPermiso = sequelize.define('RolPermiso', {
    idRolPermiso: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_rol_permiso',
    },
    idRol: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'id_rol',
      references: {
        model: 'ROLES',
        key: 'id_rol',
      },
    },
    idPermiso: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'id_permiso',
      references: {
        model: 'PERMISOS',
        key: 'id_permiso',
      },
    },
  }, {
    tableName: 'ROLES_PERMISOS',
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['id_rol', 'id_permiso'],
        name: 'unique_rol_permiso',
      },
    ],
  });

  return RolPermiso;
};
