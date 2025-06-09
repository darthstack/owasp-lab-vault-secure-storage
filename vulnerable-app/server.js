const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const app = express();

// ❌ VULNERABLE - Clave hardcoded
const JWT_SECRET = "super_secret_key_123";

app.use(express.static('public'));
app.use(express.json());

// ❌ VULNERABLE - Endpoint que expone datos sensibles
app.get('/api/user/:id', (req, res) => {
    res.json({
        id: req.params.id,
        password: "password123", // ❌ Nunca hacer esto
        creditCard: "4111-1111-1111-1111",
        ssn: "123-45-6789"
    });
});

// ❌ VULNERABLE - Almacenamiento inseguro de tokens
app.post('/api/login', (req, res) => {
    const token = jwt.sign({ userId: 123 }, JWT_SECRET);
    res.json({ token });
});

app.listen(3000, () => {
    console.log('Vulnerable app running on port 3000');
});
