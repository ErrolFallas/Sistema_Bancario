'use strict';

// ============================================
// Migración 024: Mover fecha_registro
// De: tabla CLIENTES → A: tabla USUARIOS
// ============================================

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Agregar fecha_registro a USUARIOS
    await queryInterface.addColumn('USUARIOS', 'fecha_registro', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    });

    // 2. Eliminar fecha_registro de CLIENTES
    await queryInterface.removeColumn('CLIENTES', 'fecha_registro');
  },

  async down(queryInterface, Sequelize) {
    // Revertir: quitar de USUARIOS y restaurar en CLIENTES
    await queryInterface.removeColumn('USUARIOS', 'fecha_registro');

    await queryInterface.addColumn('CLIENTES', 'fecha_registro', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    });
  },
};
