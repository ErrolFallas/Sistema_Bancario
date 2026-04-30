'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('MOVIMIENTOS', {
      id_movimiento: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      tipo: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      monto: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      fecha: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      id_cuenta: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'CUENTAS',
          key: 'id_cuenta',
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
    await queryInterface.dropTable('MOVIMIENTOS');
  },
};
