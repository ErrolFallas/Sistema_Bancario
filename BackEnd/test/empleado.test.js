const request = require('supertest');
const app = require('../app');
const { Empleado, Usuario } = require('../models');
const jwt = require('jsonwebtoken');

jest.mock('../models', () => ({
    Empleado: {
        create: jest.fn(),
        findAll: jest.fn(),
        findByPk: jest.fn()
    },
    Banco: {},
    Usuario: {
        findByPk: jest.fn()
    },
    sequelize: {
        authenticate: jest.fn().mockResolvedValue(),
        sync: jest.fn().mockResolvedValue()
    }
}));

jest.mock('../utils/auditoria', () => ({
    registrarAuditoria: jest.fn().mockResolvedValue(),
    descripcionCrearEmpleado: jest.fn().mockResolvedValue('test')
}));

describe('Pruebas de Empleados (Empleado)', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(jwt, 'verify').mockReturnValue({ idUsuario: 1, rol: 'ADMIN' });
        
        const { Usuario: MockUsuario } = require('../models');
        MockUsuario.findByPk.mockResolvedValue({ 
            idUsuario: 1, 
            username: 'admin', 
            cuentaActiva: true, 
            usuarioLogeado: true,
            rol: { nombre: 'ADMIN', isActive: true } 
        });
    });

    it('Debe listar empleados exitosamente (200)', async () => {
        Empleado.findAll.mockResolvedValue([{ idEmpleado: 1, nombre: 'Ana' }]);

        const res = await request(app)
            .get('/empleados')
            .set('Cookie', ['token=fake_token']);

        expect(res.statusCode).toEqual(200);
        expect(res.body[0].nombre).toBe('Ana');
    });

    it('Debe crear un empleado exitosamente (201)', async () => {
        Empleado.create.mockResolvedValue({ idEmpleado: 2, nombre: 'Luis' });

        const res = await request(app)
            .post('/empleados')
            .set('Cookie', ['token=fake_token'])
            .send({ nombre: 'Luis', apellido: 'Gomez', idBanco: 1 });

        expect(res.statusCode).toEqual(201);
        expect(res.body.nombre).toBe('Luis');
    });
});
