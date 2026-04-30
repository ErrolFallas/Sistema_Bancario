// ============================================
// Modelo: HistorialAuditoria
// Tabla: HISTORIAL_AUDITORIA
// ============================================

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const HistorialAuditoria = sequelize.define('HistorialAuditoria', {
    idAuditoria: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_auditoria',
    },
    accion: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'La acción es obligatoria' },
      },
    },
    tablaAfectada: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'tabla_afectada',
    },
    idRegistro: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'id_registro',
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    ip: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    idUsuario: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'id_usuario',
      references: { model: 'USUARIOS', key: 'id_usuario' },
    },
  }, {
    tableName: 'HISTORIAL_AUDITORIA',
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return HistorialAuditoria;
};
