const request = require('supertest');
const app = require('../app');
const { Usuario, Rol, Cliente, sequelize } = require('../models');
const jwt = require('jsonwebtoken');

jest.mock('../models', () => {
    const mSequelize = {
        transaction: jest.fn(() => ({
            commit: jest.fn(),
            rollback: jest.fn(),
        })),
        authenticate: jest.fn().mockResolvedValue(),
        sync: jest.fn().mockResolvedValue()
    };
    return {
        sequelize: mSequelize,
        Usuario: {
            findOne: jest.fn(),
            create: jest.fn(),
            count: jest.fn(),
            findByPk: jest.fn()
        },
        Rol: {
            findByPk: jest.fn()
        },
        Cliente: {
            create: jest.fn(),
            findByPk: jest.fn()
        },
        Empleado: {
            create: jest.fn()
        },
        Banco: {
            findByPk: jest.fn()
        }
    };
});

jest.mock('../utils/auditoria', () => ({
    registrarAuditoria: jest.fn().mockResolvedValue(),
    descripcionCrearUsuario: jest.fn().mockResolvedValue('test'),
    descripcionCrearCliente: jest.fn().mockResolvedValue('test'),
    descripcionCrearEmpleado: jest.fn().mockResolvedValue('test')
}));

describe('Pruebas de Usuario Completo (Transaccional)', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(jwt, 'verify').mockReturnValue({ idUsuario: 1, rol: 'ADMIN' });
        
        // Mockear el usuario en el middleware
        const { Usuario: MockUsuario } = require('../models');
        MockUsuario.findByPk.mockResolvedValue({ 
            idUsuario: 1, 
            username: 'admin', 
            cuentaActiva: true, 
            usuarioLogeado: true,
            rol: { nombre: 'ADMIN', isActive: true } 
        });
    });

    it('Debe crear un usuario y cliente exitosamente (201)', async () => {
        const { Usuario: MockUsuario, Rol: MockRol, Cliente: MockCliente } = require('../models');
        
        MockRol.findByPk.mockResolvedValue({ idRol: 2, nombre: 'CLIENTE' });
        MockUsuario.findOne.mockResolvedValue(null); // No existe username
        MockCliente.create.mockResolvedValue({ idCliente: 10, nombre: 'Juan' });
        MockUsuario.create.mockResolvedValue({ 
            idUsuario: 5, 
            username: 'juanito', 
            toJSON: () => ({ idUsuario: 5, username: 'juanito' }) 
        });

        const res = await request(app)
            .post('/usuarios/completo')
            .set('Cookie', ['token=fake_token'])
            .send({
                username: 'juanito',
                password: 'password123',
                idRol: 2,
                clienteNombre: 'Juan',
                clienteApellido: 'Perez',
                clienteCedula: '1234567'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.mensaje).toContain('creado exitosamente');
        expect(res.body.entidadCreada).toBe('CLIENTE');
    });

    it('Debe rechazar la creación de un tercer SUPER_ADMIN (403)', async () => {
        const { Usuario: MockUsuario, Rol: MockRol } = require('../models');
        
        MockRol.findByPk.mockResolvedValue({ idRol: 1, nombre: 'SUPER_ADMIN' });
        MockUsuario.findOne.mockResolvedValue(null);
        MockUsuario.count.mockResolvedValue(2); // Ya hay 2

        const res = await request(app)
            .post('/usuarios/completo')
            .set('Cookie', ['token=fake_token'])
            .send({
                username: 'super2',
                password: 'password123',
                idRol: 1
            });

        expect(res.statusCode).toEqual(403);
        expect(res.body.error).toContain('límite máximo de 2 SUPER_ADMIN');
    });

    it('Debe realizar rollback si la creación del usuario falla después de crear un cliente', async () => {
        const { Usuario: MockUsuario, Rol: MockRol, Cliente: MockCliente, sequelize: MockSequelize } = require('../models');
        
        MockRol.findByPk.mockResolvedValue({ idRol: 2, nombre: 'CLIENTE' });
        MockUsuario.findOne.mockResolvedValue(null);
        MockCliente.create.mockResolvedValue({ idCliente: 20 });
        MockUsuario.create.mockRejectedValue(new Error('Fallo inesperado al crear usuario'));

        const res = await request(app)
            .post('/usuarios/completo')
            .set('Cookie', ['token=fake_token'])
            .send({
                username: 'error_user',
                password: 'password123',
                idRol: 2,
                clienteNombre: 'Error',
                clienteApellido: 'User',
                clienteCedula: '999999'
            });

        expect(res.statusCode).toEqual(500);
        // Verificar que rollback fue llamado
        const t = await MockSequelize.transaction.mock.results[0].value;
        expect(t.rollback).toHaveBeenCalled();
    });
});
