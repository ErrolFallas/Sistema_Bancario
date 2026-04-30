'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CLIENTES_CUENTAS', {
      id_cliente_cuenta: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_cliente: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'CLIENTES',
          key: 'id_cliente',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      id_cuenta: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'CUENTAS',
          key: 'id_cuenta',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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

    await queryInterface.addIndex('CLIENTES_CUENTAS', ['id_cliente', 'id_cuenta'], {
      unique: true,
      name: 'unique_cliente_cuenta',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('CLIENTES_CUENTAS');
  },
};
