'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // 1. Add email column to USUARIOS
    await queryInterface.addColumn('USUARIOS', 'email', {
      type: Sequelize.STRING(100),
      allowNull: true,
      unique: true
    });

    // 2. Populate email column from CLIENTES
    await queryInterface.sequelize.query(`
      UPDATE USUARIOS U
      INNER JOIN CLIENTES C ON U.id_cliente = C.id_cliente
      SET U.email = C.email
      WHERE C.email IS NOT NULL;
    `);
  },

  async down (queryInterface, Sequelize) {
    // Remove email column from USUARIOS
    await queryInterface.removeColumn('USUARIOS', 'email');
  }
};

