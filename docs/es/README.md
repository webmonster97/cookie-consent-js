# Biblioteca de Gestión de Consentimiento de Cookies para Node.js

## Descripción

Esta biblioteca de Node.js gestiona el consentimiento de cookies conforme a las regulaciones GDPR. Cuando un usuario llega a una página, se muestra un mensaje de consentimiento de cookies. El usuario puede aceptar o rechazar el uso de cookies. Si el usuario acepta, el mensaje ya no se mostrará en visitas posteriores. Si el usuario rechaza, no se utilizarán cookies. La biblioteca soporta múltiples idiomas.

## Instalación

### 1. Clonar el repositorio:

```bash
git clone https://github.com/webmonster97/cookie-consent-js.git
cd cookie-consent-js
```

### 2. Instalar las dependencias mediante npm:

```bash
npm install
```

## Uso

### 1. Iniciar el servidor:

Para sistemas basados en Unix (Linux, macOS):

```bash
LANG=es node server.js
```

Para Windows:

```cmd
set LANG=es
node server.js
```

### 2. Acceder a la aplicación:

Abre tu navegador y ve a `http://localhost:3000`.

## Configuración

Puedes personalizar el banner de consentimiento modificando los estilos mediante JavaScript y eligiendo el idioma del mensaje pasando un parámetro en la URL.

### Archivo `consent.js`:

Este archivo permite la personalización dinámica de los estilos del banner y de los botones.

```javascript
document.addEventListener("DOMContentLoaded", function () {
    const consentBanner = document.getElementById('consent-banner');
    const consentButtons = consentBanner.querySelectorAll('button');

    if (consentBanner) {
        const userConfig = {
            banner: {
                backgroundColor: document.body.dataset.consentBgColor || '#2c3e50',
                color: document.body.dataset.consentTextColor || '#ecf0f1',
                fontFamily: document.body.dataset.consentFontFamily || 'Verdana, sans-serif',
            },
            buttons: {
                backgroundColor: document.body.dataset.consentButtonBgColor || '#3498db',
                color: document.body.dataset.consentButtonTextColor || '#fff',
                borderRadius: document.body.dataset.consentButtonBorderRadius || '5px',
                padding: document.body.dataset.consentButtonPadding || '10px 20px',
                border: document.body.dataset.consentButtonBorder || 'none',
                margin: document.body.dataset.consentButtonMargin || '5px',
                cursor: 'pointer'
            }
        };

        // Aplicar estilos del banner
        Object.keys(userConfig.banner).forEach(style => {
            consentBanner.style[style] = userConfig.banner[style];
        });

        // Aplicar estilos de los botones
        consentButtons.forEach(button => {
            Object.keys(userConfig.buttons).forEach(style => {
                button.style[style] = userConfig.buttons[style];
            });
        });
    }
});
```

### Personalización mediante atributos `data-*`:

Puedes personalizar los estilos directamente en HTML usando los atributos `data-*`.

```html
<body
    data-consent-bg-color="#2c3e50"
    data-consent-text-color="#ecf0f1"
    data-consent-font-family="Verdana, sans-serif"
    data-consent-button-bg-color="#3498db"
    data-consent-button-text-color="#fff"
    data-consent-button-border-radius="5px"
    data-consent-button-padding="10px 20px"
    data-consent-button-border="none"
    data-consent-button-margin="5px">
...
</body>
```

## Estructura del Directorio

```
cookie-consent-nodejs/
├── lang/
│   ├── en.json
│   ├── zh.json
│   ├── hi.json
│   ├── es.json
│   ├── fr.json
│   ├── cre.json
├── src/
│   ├── cookieConsent.js
├── public/
│   ├── consent.js
├── views/
│   ├── index.ejs
├── server.js
├── package.json
```

### Archivos de Idioma

#### `lang/en.json`

```json
{
  "message": "This site uses cookies to enhance your experience. Do you accept the use of cookies?",
  "accept": "Yes",
  "reject": "No"
}
```

#### `lang/es.json`

```json
{
  "message": "Este sitio utiliza cookies para mejorar su experiencia. ¿Acepta el uso de cookies?",
  "accept": "Sí",
  "reject": "No"
}
```

#### `lang/fr.json`

```json
{
  "message": "Ce site utilise des cookies pour améliorer votre experiencia. ¿Acepta el uso de cookies?",
  "accept": "Oui",
  "reject": "Non"
}
```

### Lógica de Consentimiento de Cookies

#### `src/cookieConsent.js`

```javascript
const fs = require('fs');
const path = require('path');

class CookieConsent {
    constructor(lang = 'fr') {
        this.cookieName = 'user_consent';
        this.lang = lang;
        this.translations = this.loadTranslations(lang);
    }

    loadTranslations(lang) {
        const filePath = path.resolve(__dirname, `../lang/${lang}.json`);
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } else {
            // Volver al francés si el archivo de idioma no existe
            return JSON.parse(fs.readFileSync(path.resolve(__dirname, '../lang/fr.json'), 'utf8'));
        }
    }

    isConsented(req) {
        return req.cookies[this.cookieName] === 'yes';
    }

    handleConsent(req, res) {
        if (req.body.consent) {
            if (req.body.consent === 'yes') {
                res.cookie(this.cookieName, 'yes', {maxAge: 365 * 24 * 60 * 60 * 1000});
            } else {
                res.clearCookie(this.cookieName);
            }
            res.redirect(req.originalUrl);
        }
    }

    renderConsentBanner(req, res, next) {
        if (!this.isConsented(req)) {
            res.locals.consentMessage = this.translations.message;
            res.locals.acceptText = this.translations.accept;
            res.locals.rejectText = this.translations.reject;
        } else {
            res.locals.consentMessage = '';
        }
        next();
    }
}

module.exports = CookieConsent;
```

### Configuración del Servidor

#### `server.js`

```javascript
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const CookieConsent = require('./src/cookieConsent');

const app = express();
const port = 3000;

// Configurar EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

// Definir el idioma por defecto
let lang = 'fr';
if (process.env.LANG && ['en', 'zh', 'hi', 'es', 'fr', 'cre', 'mq'].includes(process.env.LANG)) {
    lang = process.env.LANG;
}

const consent = new CookieConsent(lang);

// Middleware para mostrar el banner de consentimiento
app.use((req, res, next) => {
    consent.renderConsentBanner(req, res, next);
});

// Ruta para manejar el consentimiento de cookies
app.post('/consent', (req, res) => {
    consent.handleConsent(req, res);
});

// Ruta principal
app.get('/', (req, res) => {
    res.render('index', {
        consentMessage: res.locals.consentMessage,
        acceptText: res.locals.acceptText,
        rejectText: res.locals.rejectText
    });
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
```

### Página HTML

#### `views/index.ejs`

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Ejemplo de Consentimiento de Cookies</title>
    <style>
        body {
            font-family: Arial, sans-serif;
        }

        #consent-banner {
            position: fixed;
            bottom: 0;
            width: 100%;
            padding: 10px;
            background-color: #2c3e50;
            color: #ecf0f1;
            text-align: center;
        }

        #consent-banner button {
            background-color: #3498db;
            color: #fff;
            border: none;
            border-radius: 5px;
            padding: 10px 20px;
            margin: 5px;
            cursor: pointer;
        }
    </style>
</head>
<body>
<h1>Bienvenido a nuestro sitio</h1>
<p>Este sitio utiliza cookies para mejorar su experiencia.</p>

<div id="consent-banner" style="display: <%= consentMessage ? 'block' : 'none' %>;">
    <form method="POST" action="/consent" style="display: inline;">
        <span id="consent-message"><%= consentMessage %></span>
        <button name="consent" value="yes"><%= acceptText %></button>
        <button name="consent" value="no"><%= rejectText %></button

>
    </form>
</div>

<script src="/consent.js"></script>
</body>
</html>
```

### JavaScript para el Consentimiento

#### `public/consent.js`

```javascript
document.addEventListener("DOMContentLoaded", function () {
    const consentBanner = document.getElementById('consent-banner');
    const consentButtons = consentBanner.querySelectorAll('button');

    if (consentBanner) {
        const userConfig = {
            banner: {
                backgroundColor: document.body.dataset.consentBgColor || '#2c3e50',
                color: document.body.dataset.consentTextColor || '#ecf0f1',
                fontFamily: document.body.dataset.consentFontFamily || 'Verdana, sans-serif',
            },
            buttons: {
                backgroundColor: document.body.dataset.consentButtonBgColor || '#3498db',
                color: document.body.dataset.consentButtonTextColor || '#fff',
                borderRadius: document.body.dataset.consentButtonBorderRadius || '5px',
                padding: document.body.dataset.consentButtonPadding || '10px 20px',
                border: document.body.dataset.consentButtonBorder || 'none',
                margin: document.body.dataset.consentButtonMargin || '5px',
                cursor: 'pointer'
            }
        };

        // Aplicar estilos del banner
        Object.keys(userConfig.banner).forEach(style => {
            consentBanner.style[style] = userConfig.banner[style];
        });

        // Aplicar estilos de los botones
        consentButtons.forEach(button => {
            Object.keys(userConfig.buttons).forEach(style => {
                button.style[style] = userConfig.buttons[style];
            });
        });
    }
});
```

### Créditos

Esta biblioteca fue desarrollada por Webmonster.tech. Se distribuye bajo la licencia MIT. Para más información, por favor visita el repositorio de GitHub en https://github.com/webmonster97.
