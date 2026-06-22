// express_cookie.js
const express = require('express');
const cookieParser = require('cookie-parser'); // npm install cookie-parser
const app = express();

app.use(cookieParser('my-secret-key')); // secret for signed cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Обычные cookie
app.get('/set-cookie', (req, res) => {
    res.cookie('username', 'JohnDoe', {
        maxAge: 900000, // 15 минут
        httpOnly: true,
        path: '/'
    });
    res.cookie('theme', 'dark', {
        maxAge: 3600000, // 1 час
        httpOnly: false // доступно из JS
    });
    res.json({ message: 'Cookies set', cookies: req.cookies });
});

// Signed cookie
app.get('/set-signed-cookie', (req, res) => {
    res.cookie('sessionId', 'abc123xyz', {
        signed: true,
        maxAge: 86400000, // 24 часа
        httpOnly: true
    });
    res.json({ 
        message: 'Signed cookie set',
        signedCookie: req.signedCookies
    });
});

// Cookie с опциями
app.get('/set-options', (req, res) => {
    // Secure - только HTTPS
    // res.cookie('secure', 'value', { secure: true });
    
    // Domain - привязка к поддомену
    res.cookie('domain', 'example.com', { domain: '.example.com' });
    
    // Expires - конкретная дата
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);
    res.cookie('expiring', 'value', { expires });
    
    res.json({ message: 'Cookies with options set' });
});

// Получение cookies
app.get('/get-cookies', (req, res) => {
    res.json({
        cookies: req.cookies,
        signedCookies: req.signedCookies,
        allCookies: req.headers.cookie
    });
});

// Очистка cookie
app.get('/clear-cookie/:name', (req, res) => {
    const { name } = req.params;
    res.clearCookie(name);
    res.json({ message: `Cookie "${name}" cleared` });
});

// Очистка всех cookies
app.get('/clear-all', (req, res) => {
    Object.keys(req.cookies).forEach(name => {
        res.clearCookie(name);
    });
    Object.keys(req.signedCookies).forEach(name => {
        res.clearCookie(name);
    });
    res.json({ message: 'All cookies cleared' });
});

// Пример с использованием cookies для хранения настроек
app.post('/settings', express.json(), (req, res) => {
    const { theme, language, notifications } = req.body;
    
    if (theme) res.cookie('theme', theme, { maxAge: 30 * 24 * 3600000 });
    if (language) res.cookie('language', language, { maxAge: 30 * 24 * 3600000 });
    if (notifications) res.cookie('notifications', notifications, { maxAge: 30 * 24 * 3600000 });
    
    res.json({ message: 'Settings saved', settings: req.body });
});

app.get('/settings', (req, res) => {
    res.json({
        theme: req.cookies.theme || 'light',
        language: req.cookies.language || 'en',
        notifications: req.cookies.notifications || 'on'
    });
});

// Главная страница
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Cookie Demo</title>
            <style>
                body { font-family: Arial; padding: 20px; }
                button { margin: 5px; padding: 5px 10px; cursor: pointer; }
                .cookies { background: #f5f5f5; padding: 10px; margin-top: 20px; font-family: monospace; }
            </style>
        </head>
        <body>
            <h1>Cookie Management Demo</h1>
            
            <h2>Set Cookies</h2>
            <button onclick="setCookie()">Set Regular Cookie</button>
            <button onclick="setSignedCookie()">Set Signed Cookie</button>
            
            <h2>Get Cookies</h2>
            <button onclick="getCookies()">Show All Cookies</button>
            
            <h2>Clear Cookies</h2>
            <button onclick="clearCookie('username')">Clear 'username'</button>
            <button onclick="clearAll()">Clear All</button>
            
            <h2>User Settings</h2>
            <select id="theme">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
            </select>
            <button onclick="saveSettings()">Save Settings</button>
            
            <div id="cookies" class="cookies">Loading cookies...</div>
            
            <script>
                async function setCookie() {
                    const res = await fetch('/set-cookie');
                    const data = await res.json();
                    alert(JSON.stringify(data));
                    getCookies();
                }
                
                async function setSignedCookie() {
                    const res = await fetch('/set-signed-cookie');
                    const data = await res.json();
                    alert(JSON.stringify(data));
                    getCookies();
                }
                
                async function getCookies() {
                    const res = await fetch('/get-cookies');
                    const data = await res.json();
                    document.getElementById('cookies').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                }
                
                async function clearCookie(name) {
                    await fetch(\`/clear-cookie/\${name}\`);
                    getCookies();
                }
                
                async function clearAll() {
                    await fetch('/clear-all');
                    getCookies();
                }
                
                async function saveSettings() {
                    const theme = document.getElementById('theme').value;
                    await fetch('/settings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ theme })
                    });
                    alert('Settings saved');
                    getCookies();
                }
                
                getCookies();
            </script>
        </body>
        </html>
    `);
});

app.listen(3000, () => {
    console.log('Express сервер с cookie на http://localhost:3000');
    console.log('Примеры:');
    console.log('  GET /set-cookie - установка cookie');
    console.log('  GET /get-cookies - получение cookie');
    console.log('  GET /clear-cookie/:name - удаление cookie');
});