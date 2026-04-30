// ============================================
// Modelo: Prestamo
// Tabla: PRESTAMOS
// ============================================

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Prestamo = sequelize.define('Prestamo', {
    idPrestamo: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_prestamo',
    },
    monto: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: { args: [0], msg: 'El monto del préstamo no puede ser negativo' },
      },
    },
    tasaInteres: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      field: 'tasa_interes',
    },
    plazoMeses: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'plazo_meses',
      validate: {
        min: { args: [1], msg: 'El plazo debe ser al menos 1 mes' },
      },
    },
    fechaInicio: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'fecha_inicio',
    },
    fechaFin: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'fecha_fin',
    },
    saldoPendiente: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      field: 'saldo_pendiente',
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
    idBanco: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'id_banco',
      references: {
        model: 'BANCOS',
        key: 'id_banco',
      },
    },
    idEstadoPrestamo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'id_estado_prestamo',
      references: {
        model: 'ESTADOS_PRESTAMO',
        key: 'id_estado_prestamo',
      },
    },
  }, {
    tableName: 'PRESTAMOS',
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return Prestamo;
};
