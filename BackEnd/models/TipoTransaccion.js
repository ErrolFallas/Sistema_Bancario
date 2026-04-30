// ============================================
// Modelo: TipoTransaccion
// Tabla: TIPOS_TRANSACCION
// ============================================

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TipoTransaccion = sequelize.define('TipoTransaccion', {
    idTipoTransaccion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_tipo_transaccion',
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'El nombre del tipo de transacción es obligatorio' },
      },
    },
  }, {
    tableName: 'TIPOS_TRANSACCION',
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return TipoTransaccion;
};
