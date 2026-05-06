# Arquitectura de Autenticación: React + Express con JWT en Cookies HttpOnly

Este documento describe detalladamente el flujo de autenticación implementado en el Sistema Bancario, diseñado bajo estrictos estándares de seguridad para prevenir vulnerabilidades comunes como XSS (Cross-Site Scripting) y CSRF (Cross-Site Request Forgery).

---

## 🔄 Flujo Completo Paso a Paso

### 1. Fase de Autenticación (Login)
**Actor:** Cliente (React) → **Destino:** Servidor (Express)
1. El usuario ingresa sus credenciales (`username` y `password`) en el formulario de React.
2. React envía una petición `POST /auth/login` mediante Axios.
3. El backend verifica las credenciales en MySQL usando `bcrypt`.
4. Si son válidas, el backend:
   * Cambia el estado del usuario en BD (`usuario_logeado = true`).
   * Genera un JWT firmado con el `idUsuario`, `rol`, etc.
   * **[CRÍTICO]** En lugar de enviar el token en el cuerpo JSON, el backend adjunta un header `Set-Cookie` en la respuesta.
5. El frontend recibe un `200 OK` con los datos del usuario (sin el token) y redirige al dashboard.

### 2. Fase de Transporte (La Cookie Segura)
El header `Set-Cookie` instruye al navegador del usuario a guardar el JWT bajo las siguientes reglas irrompibles:
* `httpOnly: true`: El código JavaScript (React) **no puede** leer ni tocar la cookie. Esto anula el robo de tokens por XSS.
* `secure: true`: La cookie solo viajará si la conexión es HTTPS (en producción).
* `sameSite: 'Lax' o 'Strict'`: Previene que la cookie se envíe desde sitios de terceros, mitigando ataques CSRF.
* `maxAge`: Define la vida útil exacta de la cookie en el navegador (ej. 30 minutos).

### 3. Peticiones Autenticadas (El día a día)
**Actor:** Cliente (React) → **Destino:** Servidor (Express)
1. React necesita solicitar la lista de transacciones (`GET /transacciones`).
2. Axios ejecuta la petición con la configuración `withCredentials: true`.
3. El navegador intercepta la petición y **automáticamente** adjunta la cookie que contiene el JWT.
4. El backend recibe la petición. El middleware `autenticarToken` extrae el token usando `req.cookies.token`.
5. El backend valida la firma del JWT. Si es válida, procesa la solicitud y devuelve los datos.

### 4. Recuperación de Sesión (`/auth/me`)
Dado que React no puede leer la cookie, al refrescar la página el estado global de React (`AuthContext`) se pierde temporalmente (vuelve a `null`).
1. Al montarse la aplicación, `AuthContext` envía un `GET /auth/me`.
2. El navegador adjunta la cookie automáticamente.
3. El backend valida el token y responde con los datos frescos del usuario.
4. React recibe los datos, actualiza el contexto y renderiza la interfaz acorde al rol.
*Nota: Si la petición falla (ej. cookie expirada), React asume que no hay sesión y redirige al `/login`.*

### 5. Cierre de Sesión (Logout)
**Actor:** Cliente (React) → **Destino:** Servidor (Express)
1. El usuario hace clic en "Cerrar Sesión".
2. React envía un `POST /auth/logout`.
3. El backend actualiza la BD (`usuario_logeado = false`) para invalidar la sesión del lado del servidor.
4. El backend responde con un header para limpiar la cookie: `res.clearCookie('token')`.
5. El navegador elimina la cookie de su almacenamiento.
6. React limpia el estado global y redirige a la pantalla de login.

### 6. Expiración del Token
El JWT tiene un tiempo de vida (ej. 30 minutos).
1. El tiempo transcurre y el token expira (o la cookie alcanza su `maxAge` y el navegador la borra).
2. El usuario intenta hacer una acción (ej. `GET /clientes`).
3. El backend detecta que la firma del token expiró o que la cookie ya no está.
4. El backend responde con un HTTP Status `401 Unauthorized`.
5. El interceptor global de Axios en React detecta el `401` y puede disparar un borrado de estado forzoso, redirigiendo al usuario al `/login` con un mensaje indicando que su sesión expiró.

---

## 🛡️ Buenas Prácticas Aplicadas

* **Zero-Trust Frontend**: El frontend no confía en nada, ni siquiera maneja el token. Es un mero presentador de datos. Toda la autorización real sucede en el servidor.
* **CORS Estricto**: El backend no usa comodines (`*`). Define explícitamente el origen de React (`http://localhost:5173`) y permite credenciales, lo cual es un requisito para que las cookies funcionen entre puertos distintos.
* **Sesión Híbrida**: Combinamos la inmediatez de validación sin estado del JWT con el control de estado de una base de datos (`usuario_logeado`, `cuenta_activa`), permitiendo revocar accesos instantáneamente si es necesario.

---

## ⚠️ Errores Comunes y Soluciones

| Error / Síntoma | Causa Común | Solución |
| :--- | :--- | :--- |
| **Las peticiones regresan 401 a pesar de haber hecho Login** | Axios no está enviando la cookie. | Asegurarse de tener `withCredentials: true` en la instancia global de Axios. |
| **Error de CORS bloqueando peticiones** | El backend no está devolviendo los headers CORS correctos. | Configurar el middleware `cors` en Express con `origin: "http://tu-frontend.com"` y `credentials: true`. |
| **La cookie no se guarda en el navegador** | Entornos cruzados sin HTTPS. Si el backend pone `secure: true` pero trabajas en `http://localhost`, el navegador la rechazará. | Usar `secure: process.env.NODE_ENV === 'production'` en el backend. |
| **Parpadeo de pantalla (Flickering) al recargar** | La UI se renderiza antes de que `/auth/me` termine de responder. | Usar un estado `loading` en el `AuthContext` que retenga el renderizado de la UI hasta confirmar la sesión. |
