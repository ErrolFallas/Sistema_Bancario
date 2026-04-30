'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('USUARIOS', {
      id_usuario: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      id_rol: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ROLES',
          key: 'id_rol',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      id_cliente: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'CLIENTES',
          key: 'id_cliente',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      id_empleado: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'EMPLEADOS',
          key: 'id_empleado',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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
    await queryInterface.dropTable('USUARIOS');
  },
};
