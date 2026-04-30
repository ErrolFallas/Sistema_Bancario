'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PRESTAMOS', {
      id_prestamo: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      monto: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      tasa_interes: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },
      plazo_meses: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      fecha_inicio: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      fecha_fin: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      saldo_pendiente: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
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
      id_banco: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'BANCOS',
          key: 'id_banco',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      id_estado_prestamo: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ESTADOS_PRESTAMO',
          key: 'id_estado_prestamo',
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
    await queryInterface.dropTable('PRESTAMOS');
  },
};
