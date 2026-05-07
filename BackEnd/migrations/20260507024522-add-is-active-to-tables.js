'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    const tables = ['ROLES', 'CUENTAS', 'TARJETAS', 'PRESTAMOS', 'BANCOS'];
    
    for (const table of tables) {
      await queryInterface.addColumn(table, 'is_active', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      });
    }
  },

  async down (queryInterface, Sequelize) {
    const tables = ['ROLES', 'CUENTAS', 'TARJETAS', 'PRESTAMOS', 'BANCOS'];
    
    for (const table of tables) {
      await queryInterface.removeColumn(table, 'is_active');
    }
  }
};

