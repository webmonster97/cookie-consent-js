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
let lang = 'en';
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