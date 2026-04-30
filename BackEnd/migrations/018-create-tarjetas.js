'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('TARJETAS', {
      id_tarjeta: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      numero_tarjeta: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      fecha_expiracion: {
        type: Sequelize.DATEONLY,
        allowNull: true,
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
      id_tipo_tarjeta: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'TIPOS_TARJETA',
          key: 'id_tipo_tarjeta',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      id_marca_tarjeta: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'MARCAS_TARJETA',
          key: 'id_marca_tarjeta',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      id_estado_tarjeta: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ESTADOS_TARJETA',
          key: 'id_estado_tarjeta',
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
    await queryInterface.dropTable('TARJETAS');
  },
};
