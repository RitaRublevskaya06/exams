// express_redirect.js
const express = require('express');
const app = express();

// 301 Moved Permanently
app.get('/old-page', (req, res) => {
    res.redirect(301, '/new-page');
});

// 302 Found (временная)
app.get('/temp-redirect', (req, res) => {
    res.redirect(302, '/destination');
});

// 307 Temporary Redirect (сохраняет метод)
app.post('/submit-old', (req, res) => {
    res.redirect(307, '/submit-new');
});

// 308 Permanent Redirect (сохраняет метод)
app.post('/api/v1/users', (req, res) => {
    res.redirect(308, '/api/v2/users');
});

// Редирект с параметрами
app.get('/search-old', (req, res) => {
    const { q, page } = req.query;
    res.redirect(301, `/search-new?query=${encodeURIComponent(q)}&page=${page || 1}`);
});

// Редирект на внешний URL
app.get('/goto/:site', (req, res) => {
    const sites = {
        google: 'https://google.com',
        github: 'https://github.com',
        npm: 'https://npmjs.com'
    };
    const url = sites[req.params.site];
    if (url) {
        res.redirect(302, url);
    } else {
        res.status(404).send('Site not found');
    }
});

// Редирект назад (referer)
app.get('/back', (req, res) => {
    const referer = req.headers.referer || '/';
    res.redirect(referer);
});

// Условный редирект
app.get('/check-auth', (req, res) => {
    const token = req.headers.authorization;
    if (!token) {
        res.redirect(302, '/login');
    } else {
        res.json({ message: 'Authenticated' });
    }
});

// Редирект с flash сообщением (в памяти)
const flashMessages = new Map();

app.get('/action', (req, res) => {
    const sessionId = req.query.session || Date.now().toString();
    flashMessages.set(sessionId, 'Action completed successfully!');
    res.redirect(`/result?session=${sessionId}`);
});

app.get('/result', (req, res) => {
    const sessionId = req.query.session;
    const message = flashMessages.get(sessionId);
    flashMessages.delete(sessionId);
    res.send(`
        <h1>Result Page</h1>
        <p>${message || 'No message'}</p>
        <a href="/">Go back</a>
    `);
});

// Целевые страницы
app.get('/new-page', (req, res) => {
    res.send('<h1>New Page (301 redirect target)</h1><a href="/">Back</a>');
});

app.get('/destination', (req, res) => {
    res.send('<h1>Destination (302 redirect target)</h1><a href="/">Back</a>');
});

app.post('/submit-new', (req, res) => {
    res.send('<h1>Form submitted (307 redirect preserved POST)</h1><a href="/">Back</a>');
});

app.get('/api/v2/users', (req, res) => {
    res.json({ message: 'API v2 - 308 redirect target', users: [] });
});

app.get('/search-new', (req, res) => {
    res.json({ query: req.query.query, page: req.query.page });
});

app.get('/login', (req, res) => {
    res.send('<h1>Login Page</h1><a href="/check-auth">Try with token</a>');
});

// Главная
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Redirect Demo</title>
            <style>
                body { font-family: Arial; padding: 20px; }
                a, button { display: block; margin: 10px 0; }
                code { background: #f5f5f5; padding: 2px 5px; }
            </style>
        </head>
        <body>
            <h1>HTTP Redirect Demo</h1>
            
            <h2>301 - Moved Permanently</h2>
            <a href="/old-page">/old-page → /new-page (301)</a>
            
            <h2>302 - Found (Temporary)</h2>
            <a href="/temp-redirect">/temp-redirect → /destination (302)</a>
            
            <h2>307 - Temporary Redirect (preserves method)</h2>
            <form action="/submit-old" method="POST">
                <button type="submit">POST to /submit-old → redirects with 307</button>
            </form>
            
            <h2>308 - Permanent Redirect (preserves method)</h2>
            <form action="/api/v1/users" method="POST">
                <button type="submit">POST to /api/v1/users → redirects with 308</button>
            </form>
            
            <h2>Redirect with parameters</h2>
            <a href="/search-old?q=express&page=2">/search-old?q=express&page=2 → /search-new?query=express&page=2</a>
            
            <h2>External redirect</h2>
            <a href="/goto/google">Go to Google</a>
            <a href="/goto/github">Go to GitHub</a>
            
            <h2>Redirect with flash message</h2>
            <a href="/action">Do action → redirect with message</a>
            
            <h2>Back redirect</h2>
            <a href="/back">Go back (based on referer)</a>
            
            <h3>Status Codes:</h3>
            <ul>
                <li><code>301</code> - Moved Permanently (search engines update links)</li>
                <li><code>302</code> - Found (temporary redirect)</li>
                <li><code>307</code> - Temporary Redirect (preserves HTTP method)</li>
                <li><code>308</code> - Permanent Redirect (preserves HTTP method)</li>
            </ul>
        </body>
        </html>
    `);
});

app.listen(3000, () => {
    console.log('Express сервер с редиректами на http://localhost:3000');
});