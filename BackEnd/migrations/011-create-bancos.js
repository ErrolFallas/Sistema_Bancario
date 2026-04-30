'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('BANCOS', {
      id_banco: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      codigo: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      direccion: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      telefono: {
        type: Sequelize.STRING(20),
        allowNull: true,
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
    await queryInterface.dropTable('BANCOS');
  },
};
