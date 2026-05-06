// ============================================
// Archivo principal del servidor Express
// Sistema Bancario - BackEnd
// ============================================

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const db = require("./models");

const app = express();

// --- Middlewares globales ---
app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// ============================================
// Importar Rutas
// ============================================

// Catálogos base
const rolRoute = require("./routes/RolRoute");
const permisoRoute = require("./routes/PermisoRoute");
const rolPermisoRoute = require("./routes/RolPermisoRoute");
const tipoCuentaRoute = require("./routes/TipoCuentaRoute");
const tipoTarjetaRoute = require("./routes/TipoTarjetaRoute");
const marcaTarjetaRoute = require("./routes/MarcaTarjetaRoute");
const estadoTarjetaRoute = require("./routes/EstadoTarjetaRoute");
const tipoTransaccionRoute = require("./routes/TipoTransaccionRoute");
const estadoTransaccionRoute = require("./routes/EstadoTransaccionRoute");
const canalRoute = require("./routes/CanalRoute");
const estadoPrestamoRoute = require("./routes/EstadoPrestamoRoute");

// Autenticación
const authRoute = require("./routes/AuthRoute");

// Entidades principales
const bancoRoute = require("./routes/BancoRoute");
const clienteRoute = require("./routes/ClienteRoute");
const empleadoRoute = require("./routes/EmpleadoRoute");
const usuarioRoute = require("./routes/UsuarioRoute");
const cuentaRoute = require("./routes/CuentaRoute");
const clienteCuentaRoute = require("./routes/ClienteCuentaRoute");
const tarjetaRoute = require("./routes/TarjetaRoute");
const transaccionRoute = require("./routes/TransaccionRoute");
const movimientoRoute = require("./routes/MovimientoRoute");
const prestamoRoute = require("./routes/PrestamoRoute");
const pagoPrestamoRoute = require("./routes/PagoPrestamoRoute");
const historialAuditoriaRoute = require("./routes/HistorialAuditoriaRoute");

// ============================================
// Registrar Rutas
// ============================================

// Catálogos base
app.use("/roles", rolRoute);
app.use("/permisos", permisoRoute);
app.use("/roles-permisos", rolPermisoRoute);
app.use("/tipos-cuenta", tipoCuentaRoute);
app.use("/tipos-tarjeta", tipoTarjetaRoute);
app.use("/marcas-tarjeta", marcaTarjetaRoute);
app.use("/estados-tarjeta", estadoTarjetaRoute);
app.use("/tipos-transaccion", tipoTransaccionRoute);
app.use("/estados-transaccion", estadoTransaccionRoute);
app.use("/canales", canalRoute);
app.use("/estados-prestamo", estadoPrestamoRoute);

// Autenticación (pública)
app.use("/auth", authRoute);

// Entidades principales
app.use("/bancos", bancoRoute);
app.use("/clientes", clienteRoute);
app.use("/empleados", empleadoRoute);
app.use("/usuarios", usuarioRoute);
app.use("/cuentas", cuentaRoute);
app.use("/clientes-cuentas", clienteCuentaRoute);
app.use("/tarjetas", tarjetaRoute);
app.use("/transacciones", transaccionRoute);
app.use("/movimientos", movimientoRoute);
app.use("/prestamos", prestamoRoute);
app.use("/pagos-prestamo", pagoPrestamoRoute);
app.use("/historial-auditoria", historialAuditoriaRoute);

// ============================================
// Iniciar servidor
// ============================================

const PORT = process.env.PORT || 3000;

const iniciarServidor = async () => {
    try {
        // Verificar conexión a MySQL
        await db.sequelize.authenticate();
        console.log("✅  Conexión a la base de datos establecida correctamente.");

        // Sincronizar tablas (no borra datos existentes)
        await db.sequelize.sync();
        console.log("✅  Tablas sincronizadas correctamente.");

        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("❌  Error al iniciar el servidor:", error.message);
        process.exit(1);
    }
};

iniciarServidor();