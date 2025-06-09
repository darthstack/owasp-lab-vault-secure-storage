// ✅ SEGURO - Manejo de sesión
async function login() {
    console.log('Login button clicked');
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            credentials: 'include', // Importante: Incluir cookies
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Fetch response received:', response);
        const data = await response.json();
        console.log('Parsed JSON data:', data);
        
        if (data.success) {
            document.getElementById('login').style.display = 'none';
            document.getElementById('userData').style.display = 'block';
        } else {
            alert('Error en el inicio de sesión');
        }
    } catch (error) {
        console.error('Error en login:', error);
        alert('Error en el inicio de sesión');
    }
}

// ✅ SEGURO - Obtención de datos con protección
async function getUserData() {
    try {
        const response = await fetch('/api/user/123', {
            credentials: 'include', // Importante: Incluir cookies
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('No autorizado');
        }
        
        const data = await response.json();
        
        // ✅ SEGURO: Mostrar solo datos no sensibles
        document.getElementById('data').innerHTML = `
            <h3>Datos del Usuario:</h3>
            <p>ID: ${data.id}</p>
            <p>Usuario: ${data.username}</p>
            <p>Último acceso: ${new Date(data.lastLogin).toLocaleString()}</p>
        `;
    } catch (error) {
        console.error('Error al obtener datos:', error);
        if (error.message === 'No autorizado') {
            window.location.href = '/'; // Redirigir al login
        }
    }
}

// ✅ SEGURO - Función para guardar datos no sensibles
function saveUserPreferences(preferences) {
    // ✅ SEGURO: Solo guardar preferencias no sensibles
    const safePreferences = {
        theme: preferences.theme,
        language: preferences.language,
        notifications: preferences.notifications
    };
    
    localStorage.setItem('userPreferences', JSON.stringify(safePreferences));
}

// ✅ SEGURO - Función para cargar datos no sensibles
function loadUserPreferences() {
    const preferences = localStorage.getItem('userPreferences');
    return preferences ? JSON.parse(preferences) : null;
}

// ✅ SEGURO - Función para cerrar sesión
async function logout() {
    try {
        const response = await fetch('/api/logout', {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    }
}

// Inicializar visibilidad y event listeners
document.addEventListener('DOMContentLoaded', () => {
    const loginDiv = document.getElementById('login');
    const userDataDiv = document.getElementById('userData');
    const loginButton = document.getElementById('loginButton');
    const getDataButton = document.getElementById('getDataButton');
    const logoutButton = document.getElementById('logoutButton');

    // Ocultar la sección de datos del usuario al inicio
    userDataDiv.style.display = 'none';

    loginButton.addEventListener('click', login);
    getDataButton.addEventListener('click', getUserData);
    logoutButton.addEventListener('click', logout);
}); 