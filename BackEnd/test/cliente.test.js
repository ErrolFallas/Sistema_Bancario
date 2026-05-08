const request = require('supertest');
const app = require('../app');
const { Cliente, Usuario } = require('../models');
const jwt = require('jsonwebtoken');

jest.mock('../models', () => ({
    Cliente: {
        create: jest.fn(),
        findAll: jest.fn(),
        findByPk: jest.fn()
    },
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
    descripcionCrearCliente: jest.fn().mockResolvedValue('test')
}));

describe('Pruebas de Clientes (Cliente)', () => {
    
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

    it('Debe listar clientes para un administrador (200)', async () => {
        Cliente.findAll.mockResolvedValue([{ idCliente: 1, nombre: 'Maria' }]);

        const res = await request(app)
            .get('/clientes')
            .set('Cookie', ['token=fake_token']);

        expect(res.statusCode).toEqual(200);
        expect(res.body[0].nombre).toBe('Maria');
    });

    it('Debe retornar 400 si fallan las validaciones al crear cliente', async () => {
        Cliente.create.mockRejectedValue(new Error('Validación fallida'));

        const res = await request(app)
            .post('/clientes')
            .set('Cookie', ['token=fake_token'])
            .send({ nombre: '' }); // Nombre vacío

        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toContain('Error de validación');
    });
});
