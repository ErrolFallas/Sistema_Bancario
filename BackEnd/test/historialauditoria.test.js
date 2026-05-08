const request = require('supertest');
const app = require('../app');
const { HistorialAuditoria, Usuario } = require('../models');
const jwt = require('jsonwebtoken');

jest.mock('../models', () => ({
    HistorialAuditoria: {
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

describe('Pruebas de Historial de Auditoría (Auditoría)', () => {
    
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

    it('Debe permitir listar registros de auditoría a un ADMIN (200)', async () => {
        HistorialAuditoria.findAll.mockResolvedValue([{ idAuditoria: 1, accion: 'LOGIN' }]);

        const res = await request(app)
            .get('/historial-auditoria')
            .set('Cookie', ['token=fake_token']);

        expect(res.statusCode).toEqual(200);
        expect(res.body[0].accion).toBe('LOGIN');
    });

    it('Debe rechazar el acceso a un CLIENTE (403)', async () => {
        jest.spyOn(jwt, 'verify').mockReturnValue({ idUsuario: 3, rol: 'CLIENTE' });
        
        const { Usuario: MockUsuario } = require('../models');
        MockUsuario.findByPk.mockResolvedValue({ 
            idUsuario: 3, 
            username: 'cliente', 
            cuentaActiva: true, 
            usuarioLogeado: true,
            rol: { nombre: 'CLIENTE', isActive: true } 
        });

        const res = await request(app)
            .get('/historial-auditoria')
            .set('Cookie', ['token=fake_token']);

        expect(res.statusCode).toEqual(403);
    });
});
