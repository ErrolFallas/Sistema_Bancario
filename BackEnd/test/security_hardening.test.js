const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');
const { Usuario, Rol, Cliente } = require('../models');
const { ROLES } = require('../constants/roles');

// Mockear JWT
jest.mock('jsonwebtoken');

describe('Pruebas de Hardening de Seguridad y Ownership', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
        
        // Mock default for auth
        jwt.verify.mockReturnValue({ idUsuario: 1, rol: ROLES.CLIENTE, idCliente: 10 });
        
        const mockUser = {
            idUsuario: 1, idCliente: 10, username: 'owner', 
            cuentaActiva: true, usuarioLogeado: true,
            rol: { nombre: ROLES.CLIENTE, isActive: true },
            update: jest.fn().mockResolvedValue(true),
            toJSON: () => ({ idUsuario: 1, idCliente: 10, username: 'owner' })
        };

        const mockOther = {
            idUsuario: 2, idCliente: 20, username: 'other', 
            cuentaActiva: true, usuarioLogeado: true,
            rol: { nombre: ROLES.CLIENTE, isActive: true },
            update: jest.fn().mockResolvedValue(true),
            toJSON: () => ({ idUsuario: 2, idCliente: 20, username: 'other' })
        };

        // Usar spyOn en lugar de jest.mock('../models') para mayor fidelidad
        jest.spyOn(Usuario, 'findByPk').mockImplementation(async (id) => {
            if (id == 1) return mockUser;
            if (id == 2) return mockOther;
            return null;
        });

        jest.spyOn(Cliente, 'findByPk').mockImplementation(async (id) => {
            if (id == 10) return { idCliente: 10 };
            if (id == 20) return { idCliente: 20 };
            return null;
        });

        jest.spyOn(Rol, 'findByPk').mockResolvedValue({ nombre: ROLES.CLIENTE });
    });

    afterAll(() => {
        jest.restoreAllMocks();
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
            const res = await request(app).patch('/clientes/20').set('Cookie', ['token=v']).send({ n: 'x' });
            expect(res.statusCode).toBe(403);
            expect(res.body.error).toContain('No tiene permisos de propiedad');
        });
    });

    describe('Hardening de Seniority', () => {
        it('Seniority: SUPER_ADMIN reciente no puede tocar a uno antiguo', async () => {
            jwt.verify.mockReturnValue({ idUsuario: 2, rol: ROLES.SUPER_ADMIN });
            Usuario.findByPk.mockImplementation(async (id) => {
                if (id == 2) return { idUsuario: 2, createdAt: '2025-01-01', cuentaActiva: true, usuarioLogeado: true, rol: { nombre: ROLES.SUPER_ADMIN, isActive: true }, toJSON: () => ({}) };
                if (id == 1) return { idUsuario: 1, createdAt: '2020-01-01', cuentaActiva: true, usuarioLogeado: true, rol: { nombre: ROLES.SUPER_ADMIN, isActive: true }, toJSON: () => ({}) };
                return null;
            });
            Rol.findByPk.mockResolvedValue({ nombre: ROLES.SUPER_ADMIN });

            const res = await request(app).patch('/usuarios/1/desactivar').set('Cookie', ['token=v']);
            expect(res.statusCode).toBe(403);
            expect(res.body.error).toContain('más reciente no puede desactivar a uno más antiguo');
        });
    });
});
