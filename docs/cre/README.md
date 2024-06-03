# Bibliyotèk Jesyon Konsantman pou Kòkiz pou Node.js

## Deskripsyon

Bibliyotèk Node.js sa a jere konsantman pou kòkiz selon règleman GDPR. Lè yon itilizatè rive sou yon paj, yon mesaj konsantman pou kòkiz ap parèt. Itilizatè a ka aksepte oswa refize itilizasyon kòkiz yo. Si itilizatè a aksepte, mesaj la p'ap parèt ankò nan vizit pwochèn yo. Si itilizatè a refize, pa gen okenn kòkiz ki itilize. Bibliyotèk la sipòte plizyè lang.

## Enstalasyon

### 1. Kopye depo a:

```bash
git clone https://github.com/webmonster97/cookie-consent-js.git
cd cookie-consent-js
```

### 2. Enstale depandans yo avèk npm:

```bash
npm install
```

## Itilizasyon

### 1. Kòmanse sèvè a:

Pou sistèm ki baze sou Unix (Linux, macOS):

```bash
LANG=cre node server.js
```

Pou Windows:

```cmd
set LANG=cre
node server.js
```

### 2. Aksede aplikasyon an:

Louvri navigatè ou epi ale nan `http://localhost:3000`.

## Konfigirasyon

Ou ka customize banyè konsantman an lè ou modifye estil yo atravè JavaScript epi chwazi lang mesaj la pa pase yon paramèt nan URL la.

### Fichye `consent.js`:

Fichye sa a pèmèt personnalisation dinamik nan estil banyè ak bouton yo.

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

        // Aplike estil banyè
        Object.keys(userConfig.banner).forEach(style => {
            consentBanner.style[style] = userConfig.banner[style];
        });

        // Aplike estil bouton
        consentButtons.forEach(button => {
            Object.keys(userConfig.buttons).forEach(style => {
                button.style[style] = userConfig.buttons[style];
            });
        });
    }
});
```

### Personalizasyon atravè atribi `data-*`:

Ou ka personnalize estil yo dirèkteman nan HTML lè w itilize atribi `data-*`.

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

## Estrikti Anyè

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

### Fichye Lang

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

#### `lang/cre.json`

```json
{
  "message": "Sit sa a sèvi ak kòkiz pou amelyore eksperyans ou. Èske w aksepte itilizasyon kòkiz?",
  "accept": "Wi",
  "reject": "Non"
}
```

### Lojik Konsantman pou Kòkiz

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
            // Si fichye lang lan pa egziste, retounen nan lang franse
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

### Konfigirasyon Sèvè

#### `server.js`

```javascript
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const CookieConsent = require('./src/cookieConsent');

const app = express();
const port = 3000;

// Konfigirasyon EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

// Mete lang default
let lang = 'fr';
if (process.env.LANG && ['en', 'zh', 'hi', 'es', 'fr', 'cre', 'mq'].includes(process.env.LANG)) {
    lang = process.env.LANG;
}

const consent = new CookieConsent(lang);

// Middleware pou montre banyè konsantman
app.use((req, res, next) => {
    consent.renderConsentBanner(req, res, next);
});

// Route pou jere konsantman pou kòkiz
app.post('/consent', (req, res) => {
    consent.handleConsent(req, res);
});

// Route prensipal
app.get('/', (req, res) => {
    res.render('index', {
        consentMessage: res.locals.consentMessage,
        acceptText: res.locals.acceptText,
        rejectText: res.locals.rejectText
    });
});

// Kòmanse sèvè a
app.listen(port, () => {
    console.log(`Sèvè koute sou http://localhost:${port}`);
});
```

### Paj HTML

#### `views/index.ejs`

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Egzanp Konsantman pou Kòkiz</title>
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
            border-radius:

 5px;
            padding: 10px 20px;
            margin: 5px;
            cursor: pointer;
        }
    </style>
</head>
<body>
<h1>Byenvini sou sit nou an</h1>
<p>Sit sa a sèvi ak kòkiz pou amelyore eksperyans ou.</p>

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

### JavaScript pou Konsantman

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

        // Aplike estil banyè
        Object.keys(userConfig.banner).forEach(style => {
            consentBanner.style[style] = userConfig.banner[style];
        });

        // Aplike estil bouton
        consentButtons.forEach(button => {
            Object.keys(userConfig.buttons).forEach(style => {
                button.style[style] = userConfig.buttons[style];
            });
        });
    }
});
```

### Kredi

Bibliyotèk sa a devlope pa Webmonster.tech. Li distribiye anba lisans MIT. Pou plis enfòmasyon, tanpri vizite depo GitHub la nan https://github.com/webmonster97.