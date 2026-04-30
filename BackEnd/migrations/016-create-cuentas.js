'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CUENTAS', {
      id_cuenta: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      numero_cuenta: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      saldo: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
      activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      fecha_apertura: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        defaultValue: Sequelize.literal('(CURRENT_DATE)'),
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
      id_tipo_cuenta: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'TIPOS_CUENTA',
          key: 'id_tipo_cuenta',
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
    await queryInterface.dropTable('CUENTAS');
  },
};
