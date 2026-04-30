// ============================================
// Modelo: Tarjeta
// Tabla: TARJETAS
// ============================================

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Tarjeta = sequelize.define('Tarjeta', {
    idTarjeta: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_tarjeta',
    },
    numeroTarjeta: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'numero_tarjeta',
      validate: {
        notEmpty: { msg: 'El número de tarjeta es obligatorio' },
      },
    },
    fechaExpiracion: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'fecha_expiracion',
    },
    idCuenta: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'id_cuenta',
      references: {
        model: 'CUENTAS',
        key: 'id_cuenta',
      },
    },
    idTipoTarjeta: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'id_tipo_tarjeta',
      references: {
        model: 'TIPOS_TARJETA',
        key: 'id_tipo_tarjeta',
      },
    },
    idMarcaTarjeta: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'id_marca_tarjeta',
      references: {
        model: 'MARCAS_TARJETA',
        key: 'id_marca_tarjeta',
      },
    },
    idEstadoTarjeta: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'id_estado_tarjeta',
      references: {
        model: 'ESTADOS_TARJETA',
        key: 'id_estado_tarjeta',
      },
    },
  }, {
    tableName: 'TARJETAS',
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return Tarjeta;
};
