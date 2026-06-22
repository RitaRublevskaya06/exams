const express = require('express');
const path = require('path');
const app = express();

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'client_redirect.html'));
});

app.get('/old', (req, res) => {
    console.log('301 редирект: /old → /new');
    res.redirect(301, '/new');
});

app.get('/temp', (req, res) => {
    console.log('307 редирект: /temp → /destination');
    res.redirect(307, '/destination');
});

app.get('/new', (req, res) => {
    res.send('Новая страница (301 редирект)');
});

app.get('/destination', (req, res) => {
    res.send('Финал (307 редирект)');
});

app.listen(3000, () => {
    console.log(' Сервер: http://localhost:3000');
});