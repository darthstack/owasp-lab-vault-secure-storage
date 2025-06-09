// ❌ VULNERABLE - Almacenamiento inseguro de tokens
async function login() {
    try {
        const response = await fetch('/api/login', {
            method: 'POST'
        });
        const data = await response.json();
        
        // ❌ MAL: Almacenar token en localStorage
        localStorage.setItem('token', data.token);
        
        // ❌ MAL: Almacenar datos sensibles
        localStorage.setItem('userInfo', JSON.stringify({
            name: 'Usuario Demo',
            email: 'demo@example.com',
            creditCard: '4111-1111-1111-1111'
        }));

        document.getElementById('login').style.display = 'none';
        document.getElementById('userData').style.display = 'block';
    } catch (error) {
        console.error('Error en login:', error);
    }
}

// ❌ VULNERABLE - Exposición de datos sensibles
async function getUserData() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/user/123', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        
        // ❌ MAL: Mostrar datos sensibles directamente
        document.getElementById('data').innerHTML = `
            <h3>Datos del Usuario:</h3>
            <pre>${JSON.stringify(data, null, 2)}</pre>
        `;
    } catch (error) {
        console.error('Error al obtener datos:', error);
    }
}

// ❌ VULNERABLE - Función insegura para guardar datos
function saveUserData(data) {
    // ❌ MAL: Almacenar datos sensibles sin cifrar
    sessionStorage.setItem('userData', JSON.stringify(data));
}

// ❌ VULNERABLE - Función insegura para obtener datos
function loadUserData() {
    // ❌ MAL: Recuperar datos sensibles sin verificación
    return JSON.parse(sessionStorage.getItem('userData'));
}
