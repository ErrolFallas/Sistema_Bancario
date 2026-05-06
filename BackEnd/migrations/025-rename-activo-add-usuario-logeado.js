'use strict';

// ============================================
// Migración 025: Renombrar activo → cuenta_activa
// y agregar columna usuario_logeado
// ============================================

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Renombrar columna activo → cuenta_activa
    await queryInterface.renameColumn('USUARIOS', 'activo', 'cuenta_activa');

    // 2. Agregar columna usuario_logeado
    await queryInterface.addColumn('USUARIOS', 'usuario_logeado', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface, Sequelize) {
    // Revertir: eliminar usuario_logeado y renombrar cuenta_activa → activo
    await queryInterface.removeColumn('USUARIOS', 'usuario_logeado');
    await queryInterface.renameColumn('USUARIOS', 'cuenta_activa', 'activo');
  },
};
