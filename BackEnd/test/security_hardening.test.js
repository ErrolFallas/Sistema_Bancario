const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');
const { Usuario, Rol, Cliente } = require('../models');
const { ROLES } = require('../constants/roles');

jest.mock('../models');
jest.mock('jsonwebtoken');

describe('Pruebas de Hardening de Seguridad y Ownership', () => {
    const mockUserOwner = {
        idUsuario: 1, idCliente: 10, username: 'owner', cuentaActiva: true, usuarioLogeado: true,
        rol: { nombre: ROLES.CLIENTE, isActive: true },
        toJSON: () => ({ idUsuario: 1, idCliente: 10, username: 'owner' }),
        update: jest.fn().mockResolvedValue(true)
    };

    const mockOtherUser = {
        idUsuario: 2, idCliente: 20, username: 'other', cuentaActiva: true, usuarioLogeado: true,
        rol: { nombre: ROLES.CLIENTE, isActive: true },
        toJSON: () => ({ idUsuario: 2, idCliente: 20, username: 'other' }),
        update: jest.fn().mockResolvedValue(true)
    };

    const mockAdmin = {
        idUsuario: 3, username: 'admin', cuentaActiva: true, usuarioLogeado: true,
        rol: { nombre: ROLES.ADMIN, isActive: true },
        toJSON: () => ({ idUsuario: 3, username: 'admin' }),
        update: jest.fn().mockResolvedValue(true)
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jwt.verify.mockReturnValue({ idUsuario: 1, rol: ROLES.CLIENTE, idCliente: 10 });
        Usuario.findByPk.mockImplementation(async (id) => {
            if (String(id) === '1') return mockUserOwner;
            if (String(id) === '2') return mockOtherUser;
            if (String(id) === '3') return mockAdmin;
            return null;
        });
        Cliente.findByPk.mockImplementation(async (id) => {
            if (String(id) === '10') return { idCliente: 10 };
            if (String(id) === '20') return { idCliente: 20 };
            return null;
        });
        Rol.findByPk.mockImplementation(async (id) => {
            if (id == 1) return { nombre: ROLES.SUPER_ADMIN };
            return { nombre: ROLES.CLIENTE };
        });
    });

    describe('Control de Acceso y Ownership', () => {
        it('Debe permitir acceso al propio perfil (200)', async () => {
            const res = await request(app).get('/usuarios/1').set('Cookie', ['token=v']);
            expect(res.statusCode).toBe(200);
        });

        it('Debe denegar acceso a perfil ajeno (403)', async () => {
            const res = await request(app).get('/usuarios/2').set('Cookie', ['token=v']);
            expect(res.statusCode).toBe(403);
            expect(res.body.error).toContain('No tiene permisos de propiedad');
        });

        it('Debe denegar modificación de cliente ajeno (403)', async () => {
            const res = await request(app).patch('/clientes/20').set('Cookie', ['token=v']).send({n:'x'});
            expect(res.statusCode).toBe(403);
            expect(res.body.error).toContain('No tiene permisos de propiedad');
        });
    });

    describe('Hardening de Seniority', () => {
        it('Seniority: SUPER_ADMIN reciente no puede tocar a uno antiguo', async () => {
            jwt.verify.mockReturnValue({ idUsuario: 2, rol: ROLES.SUPER_ADMIN });
            Usuario.findByPk.mockImplementation(async (id) => {
                if (String(id) === '2') return { ...mockOtherUser, rol: {nombre: ROLES.SUPER_ADMIN}, createdAt: '2025-01-01' };
                if (String(id) === '1') return { ...mockUserOwner, rol: {nombre: ROLES.SUPER_ADMIN}, createdAt: '2020-01-01' };
                return null;
            });
            Rol.findByPk.mockResolvedValue({ nombre: ROLES.SUPER_ADMIN });

            const res = await request(app).patch('/usuarios/1/desactivar').set('Cookie', ['token=v']);
            expect(res.statusCode).toBe(403);
            expect(res.body.error).toContain('más reciente no puede desactivar a uno más antiguo');
        });
    });
});
