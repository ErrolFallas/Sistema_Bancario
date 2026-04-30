'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CLIENTES', {
      id_cliente: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      apellido: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      cedula: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      telefono: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      direccion: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      fecha_registro: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
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
    await queryInterface.dropTable('CLIENTES');
  },
};
