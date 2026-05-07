// ============================================
// Modelo: Banco
// Tabla: BANCOS
// ============================================

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Banco = sequelize.define('Banco', {
    idBanco: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_banco',
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'El nombre del banco es obligatorio' },
      },
    },
    codigo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'El código del banco es obligatorio' },
      },
    },
    direccion: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
  }, {
    tableName: 'BANCOS',
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return Banco;
};
