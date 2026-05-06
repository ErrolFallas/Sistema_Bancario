'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Definimos el banco principal tipo Fintech Core Bancario
    const bancoPrincipal = {
      nombre: 'Nexen Bank Core',
      codigo: 'NEX-CR-001',
      direccion: 'Torre Financiera Nexen, Piso 15, San José, Costa Rica',
      telefono: '+506 8000-NEXEN',
      created_at: new Date(),
      updated_at: new Date()
    };

    // Insertar el registro usando bulkInsert. 
    // Utilizamos ignoreDuplicates: true (o manejo de try/catch en raw query dependiendo del dialecto)
    // para evitar fallos si el seeder se ejecuta múltiples veces.
    
    // Verificamos si ya existe para evitar error de clave única en 'codigo'
    const bancoExistente = await queryInterface.rawSelect('BANCOS', {
      where: {
        codigo: bancoPrincipal.codigo,
      },
    }, ['id_banco']);

    if (!bancoExistente) {
      await queryInterface.bulkInsert('BANCOS', [bancoPrincipal], {});
      console.log('✅ Seeder: Banco "Nexen Bank Core" creado exitosamente.');
    } else {
      console.log('ℹ️ Seeder: El banco "Nexen Bank Core" ya existía en la base de datos.');
    }
  },

  async down(queryInterface, Sequelize) {
    // Eliminar el banco por su código único en caso de hacer rollback
    await queryInterface.bulkDelete('BANCOS', {
      codigo: 'NEX-CR-001'
    }, {});
    console.log('🗑️ Seeder Rollback: Banco "Nexen Bank Core" eliminado.');
  }
};
