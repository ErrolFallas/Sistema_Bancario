// ============================================
// Configuración central del Backend (MVC)
// Lee las variables de entorno desde .env
// ============================================

const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno desde el archivo .env
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// --- Configuración reutilizable ---
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'SistemaBancario',
  dialect: process.env.DB_DIALECT || 'mysql',
  pool: {
    max: parseInt(process.env.DB_POOL_MAX, 10) || 10,
    min: parseInt(process.env.DB_POOL_MIN, 10) || 0,
    acquire: parseInt(process.env.DB_POOL_ACQUIRE, 10) || 30000,
    idle: parseInt(process.env.DB_POOL_IDLE, 10) || 10000,
  },
  define: {
    underscored: true,
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
};

module.exports = {
  // --- Configuración del Servidor ---
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
  },

  // --- Configuración de Base de Datos (MySQL) ---
  // Compatibilidad con database.js existente
  database: {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.username,
    password: dbConfig.password,
    name: dbConfig.database,
    dialect: dbConfig.dialect,
    pool: dbConfig.pool,
  },

  // --- Configuración de JWT ---
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },

  // --- Configuración de CORS ---
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },

  // --- Sequelize CLI (migraciones) ---
  development: {
    ...dbConfig,
    logging: console.log,
  },
  test: {
    ...dbConfig,
    logging: false,
  },
  production: {
    ...dbConfig,
    logging: false,
  },
};
