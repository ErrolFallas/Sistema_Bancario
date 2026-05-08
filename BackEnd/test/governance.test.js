const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');
const { Usuario, Rol, Cliente, Empleado } = require('../models');
const { ROLES } = require('../constants/roles');

// Mockear JWT
jest.mock('jsonwebtoken');

describe('Pruebas de Gobernanza y Seguridad Avanzada', () => {
    
    const createMockInstance = (data) => ({
        ...data,
        cuentaActiva: data.cuentaActiva !== undefined ? data.cuentaActiva : true,
        usuarioLogeado: data.usuarioLogeado !== undefined ? data.usuarioLogeado : true,
        update: jest.fn().mockImplementation(function(newData) {
            Object.assign(this, newData);
            return Promise.resolve(this);
        }),
        toJSON: function() {
            const plain = { ...this };
            delete plain.update;
            delete plain.toJSON;
            return plain;
        }
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jwt.verify.mockReturnValue({ idUsuario: 1, rol: ROLES.SUPER_ADMIN });
        
        jest.spyOn(Usuario, 'findByPk').mockImplementation(async (id) => {
            if (id == 1) return createMockInstance({ 
                idUsuario: 1, username: 'admin', 
                rol: { nombre: ROLES.SUPER_ADMIN, isActive: true } 
            });
            return null;
        });

        jest.spyOn(Rol, 'findByPk').mockImplementation(async (id) => {
            if (id == 1) return createMockInstance({ nombre: ROLES.SUPER_ADMIN });
            if (id == 2) return createMockInstance({ nombre: ROLES.ADMIN });
            return null;
        });

        jest.spyOn(Usuario, 'count').mockResolvedValue(0);
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    describe('Gobernanza de SUPER_ADMIN', () => {
        it('Debe impedir la creación de un tercer SUPER_ADMIN activo (Límite 2)', async () => {
            Usuario.count.mockResolvedValue(2); 
            Rol.findByPk.mockResolvedValue(createMockInstance({ nombre: ROLES.SUPER_ADMIN }));

            const res = await request(app)
                .post('/usuarios')
                .send({ username: 'nuevo_super', password: '123', idRol: 1 })
                .set('Cookie', ['token=v']);

            expect(res.statusCode).toEqual(403);
            expect(res.body.error).toContain('2 SUPER_ADMIN activos');
        });

        it('Debe impedir que un SUPER_ADMIN reciente desactive a uno más antiguo (Seniority)', async () => {
            jwt.verify.mockReturnValue({ idUsuario: 2, rol: ROLES.SUPER_ADMIN });
            
            Usuario.findByPk.mockImplementation(async (id) => {
                if (id == 2) return createMockInstance({
                    idUsuario: 2, username: 'nuevo', createdAt: '2025-01-01',
                    rol: { nombre: ROLES.SUPER_ADMIN, isActive: true }
                });
                if (id == 1) return createMockInstance({
                    idUsuario: 1, username: 'antiguo', createdAt: '2020-01-01',
                    rol: { nombre: ROLES.SUPER_ADMIN, isActive: true }
                });
                return null;
            });
            
            Rol.findByPk.mockResolvedValue(createMockInstance({ nombre: ROLES.SUPER_ADMIN }));

            const res = await request(app)
                .patch('/usuarios/1/desactivar') 
                .set('Cookie', ['token=v']);

            expect(res.statusCode).toEqual(403);
            expect(res.body.error.toLowerCase()).toContain('más reciente no puede desactivar');
        });

        it('Debe impedir que el último SUPER_ADMIN se rebaje de rol (Abandono de cargo)', async () => {
            Usuario.count.mockResolvedValue(1); 

            const res = await request(app)
                .patch('/usuarios/1')
                .send({ idRol: 2 }) 
                .set('Cookie', ['token=v']);

            expect(res.statusCode).toEqual(403);
            expect(res.body.error).toContain('último SUPER_ADMIN activo');
        });
    });

    describe('Jerarquía RBAC y Restricciones', () => {
        it('Debe impedir que un GERENTE cree un ADMIN (Jerarquía de Creación)', async () => {
            jwt.verify.mockReturnValue({ idUsuario: 3, rol: ROLES.GERENTE });
            
            Usuario.findByPk.mockImplementation(async (id) => {
                if (id == 3) return createMockInstance({
                    idUsuario: 3, rol: { nombre: ROLES.GERENTE, isActive: true }
                });
                return null;
            });
            Rol.findByPk.mockResolvedValue(createMockInstance({ nombre: ROLES.ADMIN }));

            const res = await request(app)
                .post('/usuarios')
                .send({ username: 'nuevo_admin', password: '123', idRol: 2 })
                .set('Cookie', ['token=v']);

            expect(res.statusCode).toEqual(403);
            // Mensaje flexible para soportar "tienes" o "tiene"
            expect(res.body.error.toLowerCase()).toContain('permisos para crear usuarios');
        });

        it('Debe retornar 422 si una transición de rol requiere datos de empleado faltantes', async () => {
            Usuario.findByPk.mockImplementation(async (id) => {
                if (id == 1) return createMockInstance({ idUsuario: 1, rol: { nombre: ROLES.SUPER_ADMIN, isActive: true } });
                if (id == 10) return createMockInstance({
                    idUsuario: 10, username: 'target', idRol: 5,
                    rol: { nombre: ROLES.CLIENTE, isActive: true }
                });
                return null;
            });
            
            Rol.findByPk.mockImplementation(async (id) => {
                if (id == 1) return createMockInstance({ nombre: ROLES.SUPER_ADMIN });
                if (id == 5) return createMockInstance({ nombre: ROLES.CLIENTE });
                if (id == 4) return createMockInstance({ nombre: ROLES.EMPLEADO });
                return null;
            });

            const res = await request(app)
                .patch('/usuarios/10')
                .send({ idRol: 4 }) 
                .set('Cookie', ['token=v']);

            expect(res.statusCode).toEqual(422);
            expect(res.body).toHaveProperty('requiresEmpleadoData', true);
        });
    });
});
