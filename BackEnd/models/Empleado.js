// ============================================
// Modelo: Empleado
// Tabla: EMPLEADOS
// ============================================

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Empleado = sequelize.define('Empleado', {
    idEmpleado: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_empleado',
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'El nombre del empleado es obligatorio' },
      },
    },
    apellido: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'El apellido del empleado es obligatorio' },
      },
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    idBanco: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'id_banco',
      references: {
        model: 'BANCOS',
        key: 'id_banco',
      },
    },
  }, {
    tableName: 'EMPLEADOS',
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return Empleado;
};
