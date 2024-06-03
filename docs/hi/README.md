# Node.js के लिए कुकीज़ सहमति प्रबंधन लाइब्रेरी

## विवरण

यह Node.js लाइब्रेरी GDPR नियमों के अनुसार कुकीज़ सहमति को प्रबंधित करती है। जब कोई उपयोगकर्ता एक पृष्ठ पर आता है, तो एक कुकीज़ सहमति संदेश प्रदर्शित किया जाता है। उपयोगकर्ता कुकीज़ के उपयोग को स्वीकार या अस्वीकार कर सकता है। यदि उपयोगकर्ता स्वीकार करता है, तो संदेश बाद की यात्राओं पर प्रदर्शित नहीं होगा। यदि उपयोगकर्ता अस्वीकार करता है, तो कोई कुकीज़ का उपयोग नहीं किया जाता है। यह लाइब्रेरी कई भाषाओं का समर्थन करती है।

## स्थापना

### 1. रिपॉजिटरी क्लोन करें:

```bash
git clone https://github.com/webmonster97/cookie-consent-js.git
cd cookie-consent-js
```

### 2. npm के माध्यम से डिपेंडेंसिस स्थापित करें:

```bash
npm install
```

## उपयोग

### 1. सर्वर प्रारंभ करें:

Unix-आधारित सिस्टम (Linux, macOS) के लिए:

```bash
LANG=hi node server.js
```

Windows के लिए:

```cmd
set LANG=hi
node server.js
```

### 2. एप्लिकेशन का उपयोग करें:

अपने ब्राउज़र को खोलें और `http://localhost:3000` पर जाएं।

## कॉन्फ़िगरेशन

आप जावास्क्रिप्ट के माध्यम से स्टाइल्स को संशोधित करके और URL में एक पैरामीटर पास करके संदेश की भाषा चुनकर सहमति बैनर को अनुकूलित कर सकते हैं।

### `consent.js` फ़ाइल:

यह फ़ाइल बैनर और बटन स्टाइल्स की गतिशील अनुकूलन की अनुमति देती है।

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

        // बैनर स्टाइल्स लागू करें
        Object.keys(userConfig.banner).forEach(style => {
            consentBanner.style[style] = userConfig.banner[style];
        });

        // बटन स्टाइल्स लागू करें
        consentButtons.forEach(button => {
            Object.keys(userConfig.buttons).forEach(style => {
                button.style[style] = userConfig.buttons[style];
            });
        });
    }
});
```

### `data-*` गुणों के माध्यम से अनुकूलन:

आप `data-*` गुणों का उपयोग करके सीधे HTML में स्टाइल्स को अनुकूलित कर सकते हैं।

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

## डायरेक्टरी संरचना

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

### भाषा फ़ाइलें

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

### कुकीज़ सहमति तर्क

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
            // यदि भाषा फ़ाइल मौजूद नहीं है, तो फ्रेंच पर वापस जाएं
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

### सर्वर सेटअप

#### `server.js`

```javascript
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const CookieConsent = require('./src/cookieConsent');

const app = express();
const port = 3000;

// EJS को कॉन्फ़िगर करें
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// मिडलवेयर
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

// डिफ़ॉल्ट भाषा सेट करें
let lang = 'fr';
if (process.env.LANG && ['en', 'zh', 'hi', 'es', 'fr', 'cre', 'mq'].includes(process.env.LANG)) {
    lang = process.env.LANG;
}

const consent = new CookieConsent(lang);

// सहमति बैनर दिखाने के लिए मिडलवेयर
app.use((req, res, next) => {
    consent.renderConsentBanner(req, res, next);
});

// कुकीज़ सहमति को संभालने के लिए रूट
app.post('/consent', (req, res) => {
    consent.handleConsent(req, res);
});

// मुख्य रूट
app.get('/', (req, res) => {
    res.render('index', {
        consentMessage: res.locals.consentMessage,
        acceptText: res.locals.acceptText,
        rejectText: res.locals.rejectText
    });
});

// सर्वर शुरू करें
app.listen(port, () => {
    console.log(`सर्वर http://localhost:${port} पर सुन रहा है`);
});
```

### HTML पृष्ठ

#### `views/index.ejs`

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>कुकीज़ सहमति का उदाहरण</title>
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
            padding: 10px 20

px;
            margin: 5px;
            cursor: pointer;
        }
    </style>
</head>
<body>
<h1>हमारी साइट पर आपका स्वागत है</h1>
<p>यह साइट आपके अनुभव को बढ़ाने के लिए कुकीज़ का उपयोग करती है।</p>

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

### सहमति के लिए जावास्क्रिप्ट

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

        // बैनर स्टाइल्स लागू करें
        Object.keys(userConfig.banner).forEach(style => {
            consentBanner.style[style] = userConfig.banner[style];
        });

        // बटन स्टाइल्स लागू करें
        consentButtons.forEach(button => {
            Object.keys(userConfig.buttons).forEach(style => {
                button.style[style] = userConfig.buttons[style];
            });
        });
    }
});
```

### क्रेडिट्स

यह लाइब्रेरी Webmonster.tech द्वारा विकसित की गई है। इसे MIT लाइसेंस के तहत वितरित किया गया है। अधिक जानकारी के लिए, कृपया GitHub रिपॉजिटरी https://github.com/webmonster97 पर जाएं।