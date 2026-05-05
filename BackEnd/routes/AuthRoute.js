// ============================================
// Rutas: Auth
// POST /auth/login  → login + JWT
// POST /auth/login    → login + JWT
// POST /auth/register → registro de usuario
// GET  /auth/me       → perfil del token activo
// ============================================

const express = require('express');
const router  = express.Router();

const { login, me, register } = require('../controllers/AuthController');
const { autenticarToken }     = require('../middlewares/autenticarToken');

// Pública: login y registro
router.post('/login', login);
router.post('/register', register);

// Privada: perfil del usuario autenticado
router.get('/me', autenticarToken, me);

module.exports = router;
