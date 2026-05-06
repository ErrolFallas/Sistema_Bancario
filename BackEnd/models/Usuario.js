// ============================================
// Modelo: Usuario
// Tabla: USUARIOS
// ============================================

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Usuario = sequelize.define('Usuario', {
    idUsuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_usuario',
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'El nombre de usuario es obligatorio' },
        len: {
          args: [3, 50],
          msg: 'El nombre de usuario debe tener entre 3 y 50 caracteres',
        },
      },
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password_hash',
      validate: {
        notEmpty: { msg: 'La contraseña es obligatoria' },
      },
    },
    cuentaActiva: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'cuenta_activa',
    },
    usuarioLogeado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'usuario_logeado',
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
    idCliente: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'id_cliente',
      references: {
        model: 'CLIENTES',
        key: 'id_cliente',
      },
    },
    idEmpleado: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'id_empleado',
      references: {
        model: 'EMPLEADOS',
        key: 'id_empleado',
      },
    },
    fechaRegistro: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
      field: 'fecha_registro',
    },
  }, {
    tableName: 'USUARIOS',
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return Usuario;
};
