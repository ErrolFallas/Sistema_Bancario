const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');
const { Usuario, Rol } = require('../models');
const { ROLES } = require('../constants/roles');

jest.mock('../models');
jest.mock('jsonwebtoken');

describe('Pruebas de Gobernanza y Seguridad Avanzada', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock global de verificación de token exitosa para evitar repetir en cada test
        jwt.verify.mockReturnValue({ idUsuario: 1, rol: ROLES.SUPER_ADMIN });
        Usuario.findByPk.mockResolvedValue({ 
            idUsuario: 1, cuentaActiva: true, usuarioLogeado: true,
            rol: { nombre: ROLES.SUPER_ADMIN, isActive: true },
            toJSON: () => ({ idUsuario: 1 })
        });
    });

    describe('Gobernanza de SUPER_ADMIN', () => {
        it('Debe impedir la creación de un tercer SUPER_ADMIN activo (Límite 2)', async () => {
            Rol.findByPk.mockResolvedValue({ nombre: ROLES.SUPER_ADMIN });
            Usuario.count.mockResolvedValue(2); 

            const res = await request(app)
                .post('/usuarios')
                .send({ username: 'nuevo_super', password: '123', idRol: 1 })
                .set('Cookie', ['token=fake_token']);

            expect(res.statusCode).toEqual(403);
            expect(res.body.error).toContain('límite máximo de 2 SUPER_ADMIN activos');
        });

        it('Debe impedir que un SUPER_ADMIN reciente desactive a uno más antiguo (Seniority)', async () => {
            jwt.verify.mockReturnValue({ idUsuario: 2, rol: ROLES.SUPER_ADMIN });
            
            Usuario.findByPk.mockImplementation((id) => {
                if (id == 2) return Promise.resolve({
                    idUsuario: 2, username: 'admin_nuevo', createdAt: '2024-01-01', cuentaActiva: true, usuarioLogeado: true,
                    rol: { nombre: ROLES.SUPER_ADMIN, isActive: true },
                    update: jest.fn().mockResolvedValue(true)
                });
                if (id == 1) return Promise.resolve({
                    idUsuario: 1, username: 'admin_antiguo', createdAt: '2020-01-01', cuentaActiva: true, usuarioLogeado: true,
                    rol: { nombre: ROLES.SUPER_ADMIN, isActive: true }
                });
                return Promise.resolve(null);
            });
            
            Rol.findByPk.mockResolvedValue({ nombre: ROLES.SUPER_ADMIN });

            const res = await request(app)
                .patch('/usuarios/1/desactivar') 
                .set('Cookie', ['token=fake_token']);

            expect(res.statusCode).toEqual(403);
            expect(res.body.error.toLowerCase()).toContain('más reciente no puede desactivar a uno más antiguo');
        });

        it('Debe impedir que el último SUPER_ADMIN se rebaje de rol (Abandono de cargo)', async () => {
            jwt.verify.mockReturnValue({ idUsuario: 1, rol: ROLES.SUPER_ADMIN });
            Usuario.findByPk.mockResolvedValue({ 
                idUsuario: 1, cuentaActiva: true, usuarioLogeado: true, username: 'ultimo_hero',
                rol: { nombre: ROLES.SUPER_ADMIN, isActive: true },
                update: jest.fn().mockResolvedValue(true),
                toJSON: () => ({ idUsuario: 1 })
            });
            
            Rol.findByPk.mockResolvedValue({ nombre: ROLES.ADMIN });
            Usuario.count.mockResolvedValue(1); 

            const res = await request(app)
                .patch('/usuarios/1')
                .send({ idRol: 2 }) 
                .set('Cookie', ['token=fake_token']);

            expect(res.statusCode).toEqual(403);
            expect(res.body.error).toContain('último SUPER_ADMIN activo');
        });
    });

    describe('Jerarquía RBAC y Restricciones', () => {
        it('Debe impedir que un GERENTE cree un ADMIN (Jerarquía de Creación)', async () => {
            jwt.verify.mockReturnValue({ idUsuario: 3, rol: ROLES.GERENTE });
            Usuario.findByPk.mockResolvedValue({ 
                idUsuario: 3, cuentaActiva: true, usuarioLogeado: true,
                rol: { nombre: ROLES.GERENTE, isActive: true } 
            });
            
            Rol.findByPk.mockResolvedValue({ nombre: ROLES.ADMIN });

            const res = await request(app)
                .post('/usuarios')
                .send({ username: 'nuevo_admin', password: '123', idRol: 2 })
                .set('Cookie', ['token=fake_token']);

            expect(res.statusCode).toEqual(403);
            expect(res.body.error).toContain('no tiene permisos para crear usuarios con ese rol');
        });

        it('Debe retornar 422 si una transición de rol requiere datos de empleado faltantes', async () => {
            jwt.verify.mockReturnValue({ idUsuario: 1, rol: ROLES.SUPER_ADMIN });
            Usuario.findByPk.mockImplementation((id) => {
                if (id == 1) return Promise.resolve({
                    idUsuario: 1, cuentaActiva: true, usuarioLogeado: true,
                    rol: { nombre: ROLES.SUPER_ADMIN, isActive: true }
                });
                if (id == 10) return Promise.resolve({
                    idUsuario: 10, username: 'cliente_a_empleado', idRol: 5, cuentaActiva: true,
                    rol: { nombre: ROLES.CLIENTE, isActive: true },
                    update: jest.fn().mockResolvedValue(true)
                });
                return Promise.resolve(null);
            });
            
            Rol.findByPk.mockImplementation((id) => {
                if (id == 5) return Promise.resolve({ nombre: ROLES.CLIENTE });
                if (id == 4) return Promise.resolve({ nombre: ROLES.EMPLEADO });
                return Promise.resolve(null);
            });

            const res = await request(app)
                .patch('/usuarios/10')
                .send({ idRol: 4 }) 
                .set('Cookie', ['token=fake_token']);

            expect(res.statusCode).toEqual(422);
            expect(res.body).toHaveProperty('requiresEmpleadoData', true);
        });
    });
});
