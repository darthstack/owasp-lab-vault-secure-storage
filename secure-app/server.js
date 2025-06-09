const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const vault = require('node-vault');
const jwt = require('jsonwebtoken');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const app = express();

// Configuración de CORS
app.use(cors({
    origin: 'https://localhost:3002',
    credentials: true
}));

// Middleware para cookies
app.use(cookieParser());

// Configuración de sesión
app.use(session({
    secret: 'vault-managed-secret',
    cookie: {
        httpOnly: true,
        secure: true, // En producción debe ser true
        sameSite: 'lax',
        maxAge: 3600000 // 1 hora
    },
    resave: false,
    saveUninitialized: false
}));

app.use(express.static('public'));
app.use(express.json());

// Cliente Vault
const vaultClient = vault({
    endpoint: process.env.VAULT_ADDR || 'http://vault:8200',
    token: process.env.VAULT_TOKEN || 'myroot'
});

// Función para obtener secretos de Vault
async function getSecretFromVault(path) {
    try {
        const result = await vaultClient.read(`secret/data/${path}`);
        return result.data.data;
    } catch (error) {
        console.error('Error al acceder a Vault:', error);
        return null;
    }
}

// Middleware de autenticación
async function authenticate(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'No autorizado' });
    }
    next();
}

// Login
app.post('/api/login', async (req, res) => {
    try {
        // Simular autenticación exitosa
        req.session.userId = 123;
        
        // Obtener secreto JWT de Vault
        const jwtSecret = await getSecretFromVault('jwt-secret');
        if (!jwtSecret || !jwtSecret.value) {
            console.error('JWT Secret no encontrado en Vault.');
            return res.status(500).json({ error: 'Error al obtener secreto JWT.' });
        }

        // Crear token JWT
        const token = jwt.sign({ userId: 123 }, jwtSecret.value, { expiresIn: '1h' });
        
        // Establecer cookie HTTPOnly
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: true, // En producción debe ser true
            sameSite: 'lax',
            maxAge: 3600000 // 1 hora
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Logout
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.clearCookie('auth_token');
    res.json({ success: true });
});

// Endpoint protegido
app.get('/api/user/:id', authenticate, async (req, res) => {
    res.json({
        id: req.params.id,
        username: "user123",
        lastLogin: new Date().toISOString()
    });
});

// Cargar certificados SSL
const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'cert.pem'))
};

// Crear servidor HTTPS
https.createServer(sslOptions, app).listen(3000, () => {
    console.log('Secure app running on HTTPS on port 3000');
});

// Crear servidor HTTP para redirección a HTTPS
http.createServer((req, res) => {
    res.writeHead(301, { "Location": "https://" + req.headers['host'].replace(':3003', ':3002') + req.url });
    res.end();
}).listen(3001, () => {
    console.log('HTTP server listening on port 3001 for HTTPS redirection');
});
