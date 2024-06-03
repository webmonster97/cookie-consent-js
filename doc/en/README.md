# Cookie Consent Management Library for Node.js

## Description

This Node.js library manages cookie consent according to GDPR regulations. When a user arrives on a page, a cookie
consent message is displayed. The user can accept or refuse the use of cookies. If the user accepts, the message will no
longer be displayed on subsequent visits. If the user refuses, no cookies are used. The library supports multiple
languages.

## Installation

### 1. Clone the repository:

```bash
git clone https://github.com/webmonster97/cookie-consent-js.git
cd cookie-consent-js
```

### 2. Install dependencies via npm:

```bash
npm install
```

## Usage

### 1. Start the server:

For Unix-based systems (Linux, macOS):

```bash
LANG=es node server.js
```

For Windows:

```cmd
set LANG=es
node server.js
```

### 2. Access the application:

Open your browser and go to `http://localhost:3000`.

## Configuration

You can customize the consent banner by modifying the styles via JavaScript and choosing the language of the message by
passing a parameter in the URL.

### `consent.js` file:

This file allows dynamic customization of the banner and button styles.

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

        // Apply banner styles
        Object.keys(userConfig.banner).forEach(style => {
            consentBanner.style[style] = userConfig.banner[style];
        });

        // Apply button styles
        consentButtons.forEach(button => {
            Object.keys(userConfig.buttons).forEach(style => {
                button.style[style] = userConfig.buttons[style];
            });
        });
    }
});
```

### Customization via `data-*` attributes:

You can customize styles directly in HTML using `data-*` attributes.

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

## Directory Structure

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

### Language Files

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
  "message": "Ce site utilise des cookies pour améliorer votre expérience. Acceptez-vous l'utilisation des cookies ?",
  "accept": "Oui",
  "reject": "Non"
}
```

### Cookie Consent Logic

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
            // Fallback to French if the language file doesn't exist
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

### Server Setup

#### `server.js`

```javascript
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const CookieConsent = require('./src/cookieConsent');

const app = express();
const port = 3000;

// Configure EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

// Définir la langue par défaut
let lang = 'fr';
if (process.env.LANG && ['en', 'zh', 'hi', 'es', 'fr', 'cre', 'mq'].includes(process.env.LANG)) {
    lang = process.env.LANG;
}

const consent = new CookieConsent(lang);

// Middleware pour afficher la bannière de consentement
app.use((req, res, next) => {
    consent.renderConsentBanner(req, res, next);
});

// Route pour gérer le consentement des cookies
app.post('/consent', (req, res) => {
    consent.handleConsent(req, res);
});

// Route principale
app.get('/', (req, res) => {
    res.render('index', {
        consentMessage: res.locals.consentMessage,
        acceptText: res.locals.acceptText,
        rejectText: res.locals.rejectText
    });
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(`Serveur en écoute sur http://localhost:${port}`);
});
```

### HTML Page

#### `views/index.ejs`

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Exemple de Consentement de Cookies</title>
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
<h1>Bienvenue sur notre site</h1>
<p>Ce site utilise des cookies pour améliorer votre expérience.</p>

<div id="consent-banner" style="display: <%= consentMessage ? 'block' : 'none' %>;">
    <form method="POST" action="/consent" style="display: inline;">
        <span id="consent-message"><%= consentMessage %></span>
        <button name="consent" value="yes"><%= acceptText %></button>
        <button name="consent" value="no"><%= rejectText %></button>
    </form>
</div>

<script src="/consent.js"></script>
</body>
</html>
```

### JavaScript for Consent

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

        // Apply banner styles
        Object.keys(userConfig.banner).forEach(style => {
            consentBanner.style[style] = userConfig.banner[style];
        });

        // Apply button styles
        consentButtons.forEach(button => {
            Object.keys(userConfig.buttons).forEach(style => {
                button.style[style] = userConfig.buttons[style];
            });
        });
    }
});
```

### Crédits

This library was developed by Webmonster.tech. It is distributed under the MIT License. For more information, please
visit the GitHub repository at https://github.com/webmonster97.