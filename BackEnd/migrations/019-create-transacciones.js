'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('TRANSACCIONES', {
      id_transaccion: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
      descripcion: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      id_cliente: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'CLIENTES',
          key: 'id_cliente',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      id_cuenta_origen: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'CUENTAS',
          key: 'id_cuenta',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      id_cuenta_destino: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'CUENTAS',
          key: 'id_cuenta',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      id_canal: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'CANALES',
          key: 'id_canal',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      id_tipo_transaccion: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'TIPOS_TRANSACCION',
          key: 'id_tipo_transaccion',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      id_estado_transaccion: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ESTADOS_TRANSACCION',
          key: 'id_estado_transaccion',
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
    await queryInterface.dropTable('TRANSACCIONES');
  },
};
