'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('HISTORIAL_AUDITORIA', {
      id_auditoria: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      accion: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      tabla_afectada: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      id_registro: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      fecha: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      ip: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      id_usuario: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'USUARIOS',
          key: 'id_usuario',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('HISTORIAL_AUDITORIA');
  },
};
