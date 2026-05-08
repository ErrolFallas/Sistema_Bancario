const jwt = require('jsonwebtoken');
jest.mock('jsonwebtoken', () => ({
    verify: jest.fn(),
    sign: jest.fn()
}));

const request = require('supertest');
const app = require('../app');
const { Usuario, Rol, Cliente, Empleado } = require('../models');
const { ROLES } = require('../constants/roles');

// Mockear modelos
jest.mock('../models', () => ({
    Usuario: {
        findAll: jest.fn(),
        create: jest.fn(),
        findByPk: jest.fn(),
        findOne: jest.fn(),
        count: jest.fn()
    },
    Rol: {
        findOne: jest.fn(),
        findByPk: jest.fn()
    },
    Cliente: {
        findByPk: jest.fn()
    },
    Empleado: {
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

    const createMockUser = (data) => ({
        ...data,
        cuentaActiva: data.cuentaActiva !== undefined ? data.cuentaActiva : true,
        usuarioLogeado: data.usuarioLogeado !== undefined ? data.usuarioLogeado : true,
        update: jest.fn().mockResolvedValue(true),
        destroy: jest.fn().mockResolvedValue(true),
        toJSON: function() { 
            const obj = { ...this };
            delete obj.update;
            delete obj.destroy;
            delete obj.toJSON;
            return obj;
        }
    });

    describe('GET /usuarios', () => {
        it('Debe retornar lista de usuarios para un ADMIN', async () => {
            jwt.verify.mockReturnValue({ idUsuario: 1, rol: ROLES.ADMIN });
            
            const mockAdmin = createMockUser({ 
                idUsuario: 1, 
                username: 'admin', 
                rol: { nombre: ROLES.ADMIN, isActive: true } 
            });

            Usuario.findByPk.mockResolvedValue(mockAdmin);
            Usuario.findAll.mockResolvedValue([mockAdmin.toJSON()]);

            const res = await request(app)
                .get('/usuarios')
                .set('Cookie', ['token=fake_token']);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
        });

        it('Debe permitir el acceso a CLIENTE pero retornar solo su propio registro (Filtro Ownership)', async () => {
            jwt.verify.mockReturnValue({ idUsuario: 3, rol: ROLES.CLIENTE });
            
            const mockCliente = createMockUser({ 
                idUsuario: 3, 
                username: 'cliente', 
                rol: { nombre: ROLES.CLIENTE, isActive: true } 
            });

            Usuario.findByPk.mockResolvedValue(mockCliente);
            // El controller filtrará por idUsuario: 3
            Usuario.findAll.mockResolvedValue([mockCliente.toJSON()]);

            const res = await request(app)
                .get('/usuarios')
                .set('Cookie', ['token=fake_token']);

            expect(res.statusCode).toEqual(200);
            expect(res.body.length).toBe(1);
            expect(res.body[0].idUsuario).toBe(3);
        });
    });

    describe('Operaciones de Cuenta y Jerarquía', () => {
        it('Debe permitir que un CLIENTE desactive su propia cuenta (Soft Delete)', async () => {
            const mockUser = createMockUser({ 
                idUsuario: 3, 
                rol: { nombre: ROLES.CLIENTE, isActive: true }
            });
            jwt.verify.mockReturnValue({ idUsuario: 3, rol: ROLES.CLIENTE });
            Usuario.findByPk.mockResolvedValue(mockUser);
            Rol.findByPk.mockResolvedValue({ nombre: ROLES.CLIENTE });

            const res = await request(app)
                .patch('/usuarios/eliminar-cuenta')
                .set('Cookie', ['token=my_token']);

            expect(res.statusCode).toEqual(200);
            expect(mockUser.update).toHaveBeenCalledWith(expect.objectContaining({ cuentaActiva: false }));
        });

        it('Debe impedir que un EMPLEADO reactive a un ADMIN (Jerarquía de Reactivación)', async () => {
            const adminTarget = createMockUser({ idUsuario: 2, idRol: 2, username: 'admin_target' });
            const actorEmpleado = createMockUser({ 
                idUsuario: 5, 
                rol: { nombre: ROLES.EMPLEADO, isActive: true }
            });

            jwt.verify.mockReturnValue({ idUsuario: 5, rol: ROLES.EMPLEADO });
            
            Usuario.findByPk.mockImplementation((id) => {
                if (id == 2) return Promise.resolve(adminTarget);
                if (id == 5) return Promise.resolve(actorEmpleado);
                return Promise.resolve(null);
            });
            Rol.findByPk.mockResolvedValue({ nombre: ROLES.ADMIN });

            const res = await request(app)
                .patch('/usuarios/2/reactivar')
                .set('Cookie', ['token=token_empleado']);

            expect(res.statusCode).toEqual(403);
            // El mensaje ahora es más específico por jerarquía
            expect(res.body.error.toLowerCase()).toContain('permisos insuficientes');
            expect(res.body.error.toLowerCase()).toContain('empleado');
        });
    });
});
