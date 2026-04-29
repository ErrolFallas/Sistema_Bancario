// ============================================
// Conexión a la Base de Datos MySQL
// Utiliza Sequelize como ORM
// ============================================

const { Sequelize } = require('sequelize');
const config = require('./config/config');

// Crear instancia de Sequelize con la configuración del .env
const sequelize = new Sequelize(
  config.database.name,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    pool: {
      max: config.database.pool.max,
      min: config.database.pool.min,
      acquire: config.database.pool.acquire,
      idle: config.database.pool.idle,
    },
    logging: config.server.env === 'development' ? console.log : false,
  }
);

// Función para validar la conexión a la base de datos
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
  } catch (error) {
    console.error('❌ No se pudo conectar a la base de datos:', error.message);
  }
};

module.exports = { sequelize, testConnection };
