'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('EMPLEADOS', {
      id_empleado: {
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
      puesto: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
    await queryInterface.dropTable('EMPLEADOS');
  },
};
