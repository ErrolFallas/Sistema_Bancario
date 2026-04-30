'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('TIPOS_CUENTA', {
      id_tipo_cuenta: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      nombre: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      descripcion: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      tasa_interes: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0.00,
      },
      comision_mensual: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00,
      },
      saldo_minimo: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00,
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
    await queryInterface.dropTable('TIPOS_CUENTA');
  },
};
