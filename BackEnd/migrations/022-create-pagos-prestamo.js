'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PAGOS_PRESTAMO', {
      id_pago: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_prestamo: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'PRESTAMOS',
          key: 'id_prestamo',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      id_transaccion: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'TRANSACCIONES',
          key: 'id_transaccion',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
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
    await queryInterface.dropTable('PAGOS_PRESTAMO');
  },
};
