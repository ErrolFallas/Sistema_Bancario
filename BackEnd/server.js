const app = require("./app");
const db = require("./models");
const { inicializarDatosBase } = require("./config/initSetup");

const PORT = process.env.PORT || 3000;

/**
 * Función para iniciar el servidor bancario de forma segura
 * Maneja la conexión a DB, sincronización e inicialización de datos base.
 */
const iniciarServidor = async () => {
    try {
        // Verificar conexión a MySQL
        await db.sequelize.authenticate();
        console.log("✅  Conexión a la base de datos establecida correctamente.");

        // Sincronizar tablas
        await db.sequelize.sync();
        console.log("✅  Tablas sincronizadas correctamente.");

        // Poblar base de datos con Roles y Permisos base
        await inicializarDatosBase();

        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("❌  Error al iniciar el servidor:", error.message);
        process.exit(1);
    }
};

iniciarServidor();
