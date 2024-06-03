const fs = require('fs');
const path = require('path');

class CookieConsent {
    constructor(lang = 'en') {
        this.cookieName = 'user_consent';
        this.lang = lang;
        this.translations = this.loadTranslations(lang);
    }

    loadTranslations(lang) {
        const filePath = path.resolve(__dirname, `../lang/${lang}.json`);
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } else {
            // Fallback to English if the language file doesn't exist
            return JSON.parse(fs.readFileSync(path.resolve(__dirname, '../lang/en.json'), 'utf8'));
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