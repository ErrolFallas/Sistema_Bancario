const request = require('supertest');
const app = require('../app');
const { Usuario, Rol } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mockear los modelos para evitar conexión real a BD
jest.mock('../models', () => ({
    Usuario: {
        findOne: jest.fn(),
        findByPk: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
        create: jest.fn()
    },
    Rol: {
        findOne: jest.fn(),
        create: jest.fn()
    },
    sequelize: {
        authenticate: jest.fn().mockResolvedValue(),
        sync: jest.fn().mockResolvedValue()
    }
}));

// Mockear utilidades de auditoría para no fallar por falta de registros
jest.mock('../utils/auditoria', () => ({
    registrarAuditoria: jest.fn().mockResolvedValue()
}));

describe('Pruebas de Autenticación (Auth)', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /auth/login', () => {
        it('Debe retornar 200 y un mensaje de éxito para login válido', async () => {
            const mockUser = {
                idUsuario: 1,
                username: 'admin',
                passwordHash: 'hashed_password',
                cuentaActiva: true,
                usuarioLogeado: false,
                update: jest.fn().mockResolvedValue(true),
                rol: { nombre: 'SUPER_ADMIN', isActive: true }
            };

            Usuario.findOne.mockResolvedValue(mockUser);
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

            const res = await request(app)
                .post('/auth/login')
                .send({ username: 'admin', password: 'password123' });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('mensaje', 'Inicio de sesión exitoso. Bienvenido al sistema.');
            expect(res.headers['set-cookie']).toBeDefined();
        });

        it('Debe retornar 401 para un usuario inexistente', async () => {
            Usuario.findOne.mockResolvedValue(null);

            const res = await request(app)
                .post('/auth/login')
                .send({ username: 'fantasma', password: 'password123' });

            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty('error');
        });

        it('Debe retornar 403 si la cuenta está inactiva', async () => {
            const mockUser = {
                idUsuario: 2,
                username: 'inactivo',
                cuentaActiva: false,
                rol: { nombre: 'CLIENTE', isActive: true }
            };

            Usuario.findOne.mockResolvedValue(mockUser);

            const res = await request(app)
                .post('/auth/login')
                .send({ username: 'inactivo', password: 'password123' });

            expect(res.statusCode).toEqual(403);
            expect(res.body.error).toContain('inactiva');
        });
    });

    describe('GET /auth/me (Protección)', () => {
        it('Debe rechazar acceso si la cuenta se inactivó después de emitir el token (403)', async () => {
            const mockUser = {
                idUsuario: 1,
                cuentaActiva: false, // Se inactivó
                usuarioLogeado: true,
                rol: { nombre: 'CLIENTE', isActive: true }
            };

            jest.spyOn(jwt, 'verify').mockReturnValue({ idUsuario: 1 });
            Usuario.findByPk.mockResolvedValue(mockUser);

            const res = await request(app)
                .get('/auth/me')
                .set('Cookie', ['token=valid_token_but_inactive_account']);

            expect(res.statusCode).toEqual(403);
            expect(res.body.error).toContain('cuenta se encuentra inactiva');
        });

        it('Debe retornar 403 si el token es corrupto o inválido', async () => {
            jest.spyOn(jwt, 'verify').mockImplementation(() => {
                throw new Error('JsonWebTokenError');
            });

            const res = await request(app)
                .get('/auth/me')
                .set('Cookie', ['token=corrupt_token']);

            expect(res.statusCode).toEqual(403);
            expect(res.body.error).toContain('Token proporcionado es inválido');
        });
    });
});
