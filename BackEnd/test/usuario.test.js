const jwt = require('jsonwebtoken');
jest.mock('jsonwebtoken', () => ({
    verify: jest.fn(),
    sign: jest.fn()
}));

const request = require('supertest');
const app = require('../app');
const { Usuario, Rol } = require('../models');

// Mockear modelos
jest.mock('../models', () => ({
    Usuario: {
        findAll: jest.fn(),
        create: jest.fn(),
        findByPk: jest.fn()
    },
    Rol: {
        findOne: jest.fn(),
        findByPk: jest.fn()
    },
    sequelize: {
        authenticate: jest.fn().mockResolvedValue(),
        sync: jest.fn().mockResolvedValue()
    }
}));

describe('Pruebas de Usuarios (Usuario)', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /usuarios', () => {
        it('Debe retornar lista de usuarios para un ADMIN', async () => {
            jwt.verify.mockReturnValue({ idUsuario: 1, rol: 'ADMIN' });
            Usuario.findAll.mockResolvedValue([{ idUsuario: 1, username: 'testuser' }]);
            
            Usuario.findByPk.mockResolvedValue({ 
                idUsuario: 1, 
                username: 'admin', 
                cuentaActiva: true, 
                usuarioLogeado: true,
                rol: { nombre: 'ADMIN', isActive: true } 
            });

            const res = await request(app)
                .get('/usuarios')
                .set('Cookie', ['token=fake_token']);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
        });

        it('Debe rechazar el acceso si el rol no es permitido (ej: CLIENTE)', async () => {
            jwt.verify.mockReturnValue({ idUsuario: 3, rol: 'CLIENTE' });
            
            Usuario.findByPk.mockResolvedValue({ 
                idUsuario: 3, 
                username: 'cliente', 
                cuentaActiva: true, 
                usuarioLogeado: true,
                rol: { nombre: 'CLIENTE', isActive: true } 
            });

            const res = await request(app)
                .get('/usuarios')
                .set('Cookie', ['token=fake_token']);

            expect(res.statusCode).toEqual(403);
            expect(res.body.error.toLowerCase()).toContain('permisos insuficientes');
        });
    });

    describe('Operaciones de Cuenta y Jerarquía', () => {
        it('Debe permitir que un CLIENTE desactive su propia cuenta (Soft Delete)', async () => {
            const mockUser = { 
                idUsuario: 3, 
                cuentaActiva: true, 
                usuarioLogeado: true,
                update: jest.fn().mockResolvedValue(true),
                rol: { nombre: 'CLIENTE', isActive: true }
            };
            jwt.verify.mockReturnValue({ idUsuario: 3, rol: 'CLIENTE' });
            Usuario.findByPk.mockResolvedValue(mockUser);
            Rol.findByPk.mockResolvedValue({ nombre: 'CLIENTE' });

            const res = await request(app)
                .patch('/usuarios/eliminar-cuenta')
                .set('Cookie', ['token=my_token']);

            expect(res.statusCode).toEqual(200);
            expect(mockUser.update).toHaveBeenCalledWith(expect.objectContaining({ cuentaActiva: false }));
        });

        it('Debe impedir que un EMPLEADO reactive a un ADMIN (Jerarquía de Reactivación)', async () => {
            const adminUser = { idUsuario: 2, idRol: 2, username: 'admin_target' };
            jwt.verify.mockReturnValue({ idUsuario: 5, rol: 'EMPLEADO' });
            Usuario.findByPk.mockImplementation((id) => {
                if (id == 2) return Promise.resolve(adminUser);
                if (id == 5) return Promise.resolve({ 
                    idUsuario: 5, 
                    rol: { nombre: 'EMPLEADO', isActive: true }, 
                    cuentaActiva: true, 
                    usuarioLogeado: true 
                });
                return Promise.resolve(null);
            });
            Rol.findByPk.mockResolvedValue({ nombre: 'ADMIN' });

            const res = await request(app)
                .patch('/usuarios/2/reactivar')
                .set('Cookie', ['token=token_empleado']);

            expect(res.statusCode).toEqual(403);
            expect(res.body.error.toLowerCase()).toContain('no tiene permisos para reactivar');
        });
    });
});
