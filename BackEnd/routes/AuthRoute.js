// ============================================
// Rutas: Auth
// POST /auth/login    → login + JWT
// POST /auth/logout   → cerrar sesión
// POST /auth/register → registro de usuario
// GET  /auth/me       → perfil del usuario autenticado
// ============================================

const express = require('express');
const router  = express.Router();

const { login, logout, me, register } = require('../controllers/AuthController');
const { autenticarToken }             = require('../middlewares/autenticarToken');

// Pública: login y registro
router.post('/login', login);
router.post('/register', register);

// Privada: logout y perfil del usuario autenticado
router.post('/logout', autenticarToken, logout);
router.get('/me', autenticarToken, me);

module.exports = router;
