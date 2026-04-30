'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ROLES_PERMISOS', {
      id_rol_permiso: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_rol: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ROLES',
          key: 'id_rol',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      id_permiso: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'PERMISOS',
          key: 'id_permiso',
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

    // Unique constraint on id_rol + id_permiso
    await queryInterface.addIndex('ROLES_PERMISOS', ['id_rol', 'id_permiso'], {
      unique: true,
      name: 'unique_rol_permiso',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ROLES_PERMISOS');
  },
};
