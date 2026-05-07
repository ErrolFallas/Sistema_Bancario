async function testRegistration() {
  const API_URL = 'http://localhost:3000';
  const suffix = Date.now();
  
  try {
    console.log('--- Iniciando Prueba de Registro (vía fetch) ---');

    // 1. Login para obtener token
    console.log('1. Intentando login...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'adminerrol',
        password: 'admin123'
      })
    });
    
    if (!loginRes.ok) throw new Error('Login fallido');

    const setCookie = loginRes.headers.get('set-cookie');
    const tokenCookie = setCookie ? setCookie.split(';')[0] : '';

    console.log('✅ Login exitoso.');

    const headers = {
      'Content-Type': 'application/json',
      'Cookie': tokenCookie
    };

    // 2. Crear CLIENTE
    console.log('2. Intentando crear CLIENTE...');
    const clientePayload = {
      username: 'test_cliente_' + suffix,
      password: 'password123',
      idRol: 5, 
      usuarioEmail: `test_cliente_${suffix}@example.com`,
      clienteNombre: 'Juan',
      clienteApellido: 'Prueba',
      clienteCedula: 'CED-' + suffix,
      clienteTelefono: '8888-8888',
      clienteDireccion: 'San José'
    };

    const cRes = await fetch(`${API_URL}/usuarios/completo`, {
      method: 'POST',
      headers,
      body: JSON.stringify(clientePayload)
    });

    const cData = await cRes.json();
    if (!cRes.ok) throw new Error(`Fallo Cliente: ${JSON.stringify(cData)}`);
    console.log('✅ Cliente creado:', cData.mensaje);

    // 3. Crear EMPLEADO
    console.log('3. Intentando crear EMPLEADO...');
    const bRes = await fetch(`${API_URL}/bancos`, { headers });
    const bancos = await bRes.json();
    const idBanco = bancos[0].idBanco;

    const empleadoPayload = {
      username: 'test_empleado_' + suffix,
      password: 'password123',
      idRol: 4,
      usuarioEmail: `test_empleado_${suffix}@example.com`,
      empleadoNombre: 'Maria',
      empleadoApellido: 'Prueba',
      empleadoTelefono: '7777-7777',
      empleadoIdBanco: idBanco
    };

    const eRes = await fetch(`${API_URL}/usuarios/completo`, {
      method: 'POST',
      headers,
      body: JSON.stringify(empleadoPayload)
    });

    const eData = await eRes.json();
    if (!eRes.ok) throw new Error(`Fallo Empleado: ${JSON.stringify(eData)}`);
    console.log('✅ Empleado creado:', eData.mensaje);

    console.log('\n--- PRUEBA FINALIZADA CON ÉXITO ---');

  } catch (error) {
    console.error('\n❌ ERROR EN LA PRUEBA:', error.message);
    process.exit(1);
  }
}

testRegistration();
