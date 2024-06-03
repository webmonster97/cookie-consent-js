# Node.js 的 Cookie 同意管理库

## 描述

此 Node.js 库根据 GDPR 规定管理 Cookie 同意。当用户访问页面时，会显示一个 Cookie 同意消息。用户可以接受或拒绝使用 Cookie。如果用户接受，则在后续访问中不会再显示该消息。如果用户拒绝，则不会使用任何 Cookie。该库支持多种语言。

## 安装

### 1. 克隆存储库：

```bash
git clone https://github.com/webmonster97/cookie-consent-js.git
cd cookie-consent-js
```

### 2. 通过 npm 安装依赖项：

```bash
npm install
```

## 使用

### 1. 启动服务器：

对于 Unix 系统（Linux，macOS）：

```bash
LANG=zh node server.js
```

对于 Windows：

```cmd
set LANG=zh
node server.js
```

### 2. 访问应用程序：

打开浏览器，访问 `http://localhost:3000`。

## 配置

您可以通过 JavaScript 修改样式，并通过 URL 中的参数选择消息的语言，从而自定义同意横幅。

### `consent.js` 文件：

该文件允许动态定制横幅和按钮样式。

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

        // 应用横幅样式
        Object.keys(userConfig.banner).forEach(style => {
            consentBanner.style[style] = userConfig.banner[style];
        });

        // 应用按钮样式
        consentButtons.forEach(button => {
            Object.keys(userConfig.buttons).forEach(style => {
                button.style[style] = userConfig.buttons[style];
            });
        });
    }
});
```

### 通过 `data-*` 属性自定义：

您可以使用 `data-*` 属性在 HTML 中直接自定义样式。

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

## 目录结构

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

### 语言文件

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

#### `lang/zh.json`

```json
{
  "message": "本网站使用 Cookie 以提升您的体验。您接受使用 Cookie 吗？",
  "accept": "是",
  "reject": "否"
}
```

### Cookie 同意逻辑

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
            // 如果语言文件不存在，则回退到法语
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

### 服务器设置

#### `server.js`

```javascript
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const CookieConsent = require('./src/cookieConsent');

const app = express();
const port = 3000;

// 配置 EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 中间件
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

// 设置默认语言
let lang = 'fr';
if (process.env.LANG && ['en', 'zh', 'hi', 'es', 'fr', 'cre', 'mq'].includes(process.env.LANG)) {
    lang = process.env.LANG;
}

const consent = new CookieConsent(lang);

// 显示同意横幅的中间件
app.use((req, res, next) => {
    consent.renderConsentBanner(req, res, next);
});

// 处理 Cookie 同意的路由
app.post('/consent', (req, res) => {
    consent.handleConsent(req, res);
});

// 主要路由
app.get('/', (req, res) => {
    res.render('index', {
        consentMessage: res.locals.consentMessage,
        acceptText: res.locals.acceptText,
        rejectText: res.locals.rejectText
    });
});

// 启动服务器
app.listen(port, () => {
    console.log(`服务器正在 http://localhost:${port} 监听`);
});
```

### HTML 页面

#### `views/index.ejs`

```html
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <title>Cookie 同意示例</title>
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
<h1>欢迎访问我们的网站</h1>
<p>本网站使用 Cookie 以提升您的体验。</p>

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

### 同意的 JavaScript

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

        // 应用横幅样式
        Object.keys(userConfig.banner).forEach(style => {
            consentBanner.style[style] = userConfig.banner[style];
        });

        // 应用按钮样式
        consentButtons.forEach(button => {
            Object.keys(userConfig.buttons).forEach(style => {
                button.style[style] = userConfig.buttons[style];
            });
        });
    }
});
```

### 致谢

此库由 Webmonster.tech 开发。它根据 MIT 许可证分发。更多信息，请访问 GitHub 存储库：https://github.com/webmonster97。