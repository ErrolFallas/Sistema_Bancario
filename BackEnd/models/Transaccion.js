// ============================================
// Modelo: Transaccion
// Tabla: TRANSACCIONES
// ============================================

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Transaccion = sequelize.define('Transaccion', {
    idTransaccion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_transaccion',
    },
    monto: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: { args: [0], msg: 'El monto no puede ser negativo' },
      },
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    idCliente: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'id_cliente',
      references: {
        model: 'CLIENTES',
        key: 'id_cliente',
      },
    },
    idCuentaOrigen: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'id_cuenta_origen',
      references: {
        model: 'CUENTAS',
        key: 'id_cuenta',
      },
    },
    idCuentaDestino: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'id_cuenta_destino',
      references: {
        model: 'CUENTAS',
        key: 'id_cuenta',
      },
    },
    idCanal: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'id_canal',
      references: {
        model: 'CANALES',
        key: 'id_canal',
      },
    },
    idTipoTransaccion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'id_tipo_transaccion',
      references: {
        model: 'TIPOS_TRANSACCION',
        key: 'id_tipo_transaccion',
      },
    },
    idEstadoTransaccion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'id_estado_transaccion',
      references: {
        model: 'ESTADOS_TRANSACCION',
        key: 'id_estado_transaccion',
      },
    },
  }, {
    tableName: 'TRANSACCIONES',
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return Transaccion;
};
