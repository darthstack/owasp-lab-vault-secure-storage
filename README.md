# Laboratorio OWASP ASVS 4.0.3

Este laboratorio demuestra las diferencias entre una aplicación vulnerable y una aplicación segura, siguiendo los requisitos OWASP ASVS 4.0.3, específicamente en el manejo de claves criptográficas y almacenamiento de datos sensibles.

## Estructura del Proyecto

```
owasp-lab/
├── docker-compose.yml
├── vulnerable-app/        # Aplicación con prácticas inseguras
├── secure-app/           # Aplicación con buenas prácticas
└── vault/               # Servidor HashiCorp Vault
```

## Requisitos Previos

- Docker
- Docker Compose
- Navegador web moderno
- Herramientas de desarrollo del navegador (DevTools)
- OpenSSL (para generar certificados SSL)

## Qué es HashiCorp Vault y por qué es importante

HashiCorp Vault es una herramienta para gestionar secretos de forma segura. Un "secreto" es cualquier cosa a la que deseas controlar estrictamente el acceso, como claves API, credenciales de bases de datos, contraseñas, certificados, etc.

En el contexto de la seguridad de aplicaciones (como lo exige OWASP ASVS V6.2.1: "Las claves criptográficas utilizadas para verificación deben almacenarse de forma segura y estar protegidas contra divulgación no autorizada"), Vault es fundamental porque:

- **Almacenamiento Centralizado y Seguro**: Proporciona un lugar centralizado y seguro para almacenar claves y otros secretos, en lugar de dejarlos hardcodeados en el código, en archivos de configuración planos o en variables de entorno sin protección.
- **Control de Acceso Riguroso**: Permite definir políticas de acceso granular para determinar quién puede acceder a qué secretos y bajo qué condiciones.
- **Auditoría**: Registra todas las interacciones con los secretos, proporcionando un historial de auditoría completo.
- **Rotación de Claves**: Facilita la rotación automática o manual de secretos, reduciendo la ventana de exposición en caso de compromiso.

En este laboratorio, la `secure-app` utiliza Vault para obtener su secreto JWT en tiempo de ejecución, demostrando una forma segura de gestionar claves criptográficas y cumplir con el estándar ASVS.

## Instalación y Configuración

1. Clonar el repositorio:

```bash
git clone https://github.com/darthstack/owasp-lab-vault-secure-storage.git
cd owasp-lab-vault-secure-storage
```

2. Generar Certificados SSL (desde la raíz del proyecto):

```bash
openssl genrsa -out secure-app/key.pem 2048
openssl req -new -x509 -key secure-app/key.pem -out secure-app/cert.pem -days 365 -config secure-app/openssl.cnf
```

3. Iniciar los servicios:

```bash
docker-compose up -d
```

4. Inicializar Vault y configurar el secreto para la aplicación segura:

```bash
# Acceder al contenedor de Vault y loguearse con HTTP
docker-compose exec vault vault login -address="http://127.0.0.1:8200" myroot

# Habilitar el motor de secretos (Key-Value) en la ruta 'kv' con versión 2
docker-compose exec vault vault secrets enable -address="http://127.0.0.1:8200" -version=2 kv

# Almacenar el secreto 'jwt-secret' en Vault. Este secreto será consumido por la aplicación segura.
docker-compose exec vault vault kv put -address="http://127.0.0.1:8200" secret/jwt-secret value="clave_secreta_segura_desde_vault"
```

## Acceso a las Aplicaciones

- Aplicación Vulnerable: http://localhost:3001
- Aplicación Segura (HTTPS): https://localhost:3002
- Aplicación Segura (HTTP - redirige a HTTPS): http://localhost:3003
- Vault UI: http://localhost:8201 (token: myroot)

## Confiar en el Certificado Autofirmado

Dado que la aplicación segura utiliza un certificado SSL autofirmado, tu navegador mostrará una advertencia de seguridad. Para continuar, deberás añadir una excepción o confiar en el certificado. Los pasos varían ligeramente según el navegador:

### Google Chrome

1. Cuando veas la advertencia "Tu conexión no es privada", haz clic en "Configuración avanzada".
2. Luego, haz clic en "Proceder a localhost (no seguro)" (o similar).

### Mozilla Firefox

1. Cuando veas la advertencia "Advertencia: Riesgo potencial de seguridad por delante", haz clic en "Avanzado...".
2. Luego, haz clic en "Aceptar el riesgo y continuar".

### Otros Navegadores

Consulta la documentación de tu navegador para añadir una excepción de seguridad o confiar en un certificado.

## Guía de Pruebas

### 1. Pruebas de Almacenamiento de Tokens

#### Aplicación Vulnerable

1. Abrir http://localhost:3001
2. Hacer clic en "Login"
3. Abrir DevTools (F12)
4. Ir a la pestaña "Application" > "Local Storage"
5. Observar que el token JWT se almacena en texto plano

#### Aplicación Segura

1. Abrir https://localhost:3002 (o http://localhost:3003 para probar la redirección)
2. Hacer clic en "Login"
3. Abrir DevTools (F12)
4. Ir a la pestaña "Application" > "Cookies"
5. Observar que el token se almacena en una cookie HTTPOnly y Secure

### 2. Pruebas de Exposición de Datos Sensibles

#### Aplicación Vulnerable

1. En la aplicación vulnerable, hacer clic en "Obtener Datos"
2. Observar que se muestran datos sensibles como:
   - Contraseñas
   - Números de tarjeta de crédito
   - Información personal

#### Aplicación Segura

1. En la aplicación segura, hacer clic en "Obtener Datos"
2. Observar que solo se muestran datos no sensibles:
   - ID de usuario
   - Nombre de usuario
   - Último acceso

### 3. Pruebas de Gestión de Secretos

#### Aplicación Vulnerable

1. Inspeccionar el código fuente de `vulnerable-app/server.js` para encontrar claves hardcodeadas o en variables de entorno sin protección.

#### Aplicación Segura

1. Acceder a Vault UI (http://localhost:8201) y verificar que el secreto `jwt-secret` esté almacenado allí.
2. Al iniciar sesión en `https://localhost:3002`, la aplicación segura intentará obtener el secreto `jwt-secret` desde Vault para firmar su token JWT. Si Vault no está inicializado o el secreto no está configurado, la aplicación segura mostrará un error al intentar iniciar sesión (puedes ver esto en la consola del navegador y en los logs del contenedor `secure-app`).
3. Esto demuestra cómo la aplicación segura centraliza y recupera secretos de Vault, en contraste con la aplicación vulnerable que los expone directamente.

## Checklist de Verificación

### Almacenamiento de Claves

- [ ] Las claves no están hardcodeadas en el código
- [ ] Se utiliza un sistema de gestión de secretos (Vault)
- [ ] Las claves están cifradas en reposo
- [ ] Acceso controlado mediante autenticación
- [ ] Rotación periódica de claves implementada

### Almacenamiento del Navegador

- [ ] No hay tokens de autenticación en localStorage
- [ ] Las cookies contienen HTTPOnly y Secure flags
- [ ] Datos sensibles no se almacenan en el cliente
- [ ] Se implementa cifrado para datos no críticos
- [ ] Limpieza de datos al cerrar sesión

## Herramientas de Testing

### Para Claves Criptográficas

- **truffleHog**: Detecta secretos en código

```bash
docker run --rm -v "$PWD:/pwd" trufflesecurity/trufflehog:latest filesystem /pwd
```

### Para Almacenamiento del Navegador

- **OWASP ZAP**: Proxy para interceptar requests
- **Burp Suite**: Análisis de cookies y storage
- **Browser DevTools**: Inspección manual de storage

## Limpieza

Para detener y eliminar los contenedores:

```bash
docker-compose down -v
```

## Notas de Seguridad

- Este laboratorio está diseñado para fines educativos
- No utilizar en producción sin las modificaciones necesarias
- Las claves y secretos son de ejemplo y deben cambiarse en un entorno real
- Mantener actualizadas las dependencias y herramientas

## Recursos Adicionales

- [OWASP ASVS 4.0.3](https://owasp.org/www-project-application-security-verification-standard/)
- [HashiCorp Vault Documentation](https://www.vaultproject.io/docs)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
