// express_redirect.js - Express сервер для демонстрации HTTP редиректов
const express = require('express');
const app = express(); // Создание Express приложения

// GET маршрут с редиректом 301 (Moved Permanently)
// 301 - постоянное перемещение, поисковые системы обновляют ссылки
app.get('/old-page', (req, res) => {
    res.redirect(301, '/new-page'); // Постоянный редирект на новую страницу
});

// GET маршрут с редиректом 302 (Found) - временный редирект
// 302 - временное перемещение, браузеры сохраняют исходный URL
app.get('/temp-redirect', (req, res) => {
    res.redirect(302, '/destination'); // Временный редирект
});

// POST маршрут с редиректом 307 (Temporary Redirect)
// 307 - временный редирект, который сохраняет HTTP метод (POST останется POST)
app.post('/submit-old', (req, res) => {
    res.redirect(307, '/submit-new'); // Редирект с сохранением метода POST
});

// POST маршрут с редиректом 308 (Permanent Redirect)
// 308 - постоянный редирект, который сохраняет HTTP метод
app.post('/api/v1/users', (req, res) => {
    res.redirect(308, '/api/v2/users'); // Постоянный редирект с сохранением метода
});

// GET маршрут с редиректом и передачей query-параметров
app.get('/search-old', (req, res) => {
    const { q, page } = req.query; // Получаем параметры из запроса
    // Редирект с кодированием параметров через encodeURIComponent
    res.redirect(301, `/search-new?query=${encodeURIComponent(q)}&page=${page || 1}`);
});

// GET маршрут с редиректом на внешние сайты
app.get('/goto/:site', (req, res) => {
    const sites = {
        google: 'https://google.com',
        github: 'https://github.com',
        npm: 'https://npmjs.com'
    };
    const url = sites[req.params.site]; // Получаем URL по ключу из параметра
    if (url) {
        res.redirect(302, url); // Редирект на внешний сайт
    } else {
        res.status(404).send('Site not found'); // Если сайт не найден
    }
});

// GET маршрут с редиректом "назад" на основе заголовка referer
app.get('/back', (req, res) => {
    const referer = req.headers.referer || '/'; // Заголовок referer содержит предыдущую страницу
    res.redirect(referer); // Редирект на предыдущую страницу
});

// GET маршрут с условным редиректом (проверка авторизации)
app.get('/check-auth', (req, res) => {
    const token = req.headers.authorization; // Проверяем заголовок authorization
    if (!token) {
        res.redirect(302, '/login'); // Если токена нет - редирект на страницу логина
    } else {
        res.json({ message: 'Authenticated' }); // Если токен есть - JSON ответ
    }
});

// Механизм flash-сообщений (сообщения, которые показываются один раз)
const flashMessages = new Map(); // Хранилище flash-сообщений

// GET маршрут для выполнения действия с flash-сообщением
app.get('/action', (req, res) => {
    const sessionId = req.query.session || Date.now().toString(); // ID сессии
    flashMessages.set(sessionId, 'Action completed successfully!'); // Сохраняем сообщение
    res.redirect(`/result?session=${sessionId}`); // Редирект на страницу результата
});

// GET маршрут для отображения результата с flash-сообщением
app.get('/result', (req, res) => {
    const sessionId = req.query.session; // Получаем ID сессии
    const message = flashMessages.get(sessionId); // Получаем сообщение
    flashMessages.delete(sessionId); // Удаляем сообщение (использовано один раз)
    res.send(`<h1>Result Page</h1><p>${message || 'No message'}</p><a href="/">Go back</a>`);
});

// GET маршруты для целевых страниц редиректов
app.get('/new-page', (req, res) => {
    res.send('<h1>New Page (301 redirect target)</h1><a href="/">Back</a>');
});

app.get('/destination', (req, res) => {
    res.send('<h1>Destination (302 redirect target)</h1><a href="/">Back</a>');
});

// POST маршрут для обработки редиректа с сохранением метода
app.post('/submit-new', (req, res) => {
    res.send('<h1>Form submitted (307 redirect preserved POST)</h1><a href="/">Back</a>');
});

// GET маршрут для API v2
app.get('/api/v2/users', (req, res) => {
    res.json({ message: 'API v2 - 308 redirect target', users: [] });
});

// GET маршрут для нового поиска
app.get('/search-new', (req, res) => {
    res.json({ query: req.query.query, page: req.query.page });
});

// GET маршрут для страницы логина
app.get('/login', (req, res) => {
    res.send('<h1>Login Page</h1><a href="/check-auth">Try with token</a>');
});

// Главная страница с демонстрацией всех типов редиректов
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>...HTML код с демонстрацией редиректов и пояснениями...</html>`);
});

// Запуск сервера
app.listen(3000, () => {
    console.log('Express сервер с редиректами на http://localhost:3000');
});