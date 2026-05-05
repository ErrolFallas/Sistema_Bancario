// ============================================
// Rutas: Auth
// POST /auth/login  → login + JWT
// GET  /auth/me     → perfil del token activo
// ============================================

const express = require('express');
const router  = express.Router();

const { login, me }           = require('../controllers/AuthController');
const { autenticarToken }     = require('../middlewares/autenticarToken');

// Pública: login
router.post('/login', login);

// Privada: perfil del usuario autenticado
router.get('/me', autenticarToken, me);

module.exports = router;
