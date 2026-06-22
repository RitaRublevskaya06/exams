// express_cookie.js - Express сервер для работы с cookies
// Импорт необходимых модулей
const express = require('express');
const cookieParser = require('cookie-parser'); // npm install cookie-parser
const app = express(); // Создание Express приложения

// Middleware: cookie-parser для работы с cookies
// 'my-secret-key' - секретный ключ для подписанных cookies
app.use(cookieParser('my-secret-key'));
// Middleware для парсинга JSON
app.use(express.json());
// Middleware для парсинга URL-encoded данных
app.use(express.urlencoded({ extended: true }));

// GET маршрут для установки обычных cookies
app.get('/set-cookie', (req, res) => {
    // Установка первого cookie: username
    res.cookie('username', 'JohnDoe', {
        maxAge: 900000,     // Время жизни в миллисекундах (15 минут)
        httpOnly: true,     // Cookie недоступно из JavaScript (только HTTP)
        path: '/'           // Cookie доступно для всех путей на домене
    });
    
    // Установка второго cookie: theme
    res.cookie('theme', 'dark', {
        maxAge: 3600000,    // 1 час
        httpOnly: false     // Cookie доступно из JavaScript
    });
    
    // Отправляем JSON ответ с информацией об установленных cookies
    res.json({ message: 'Cookies set', cookies: req.cookies });
});

// GET маршрут для установки подписанного cookie
app.get('/set-signed-cookie', (req, res) => {
    // Установка подписанного cookie
    res.cookie('sessionId', 'abc123xyz', {
        signed: true,      // Этот cookie будет подписан секретным ключом
        maxAge: 86400000,  // 24 часа
        httpOnly: true     // Недоступно из JavaScript
    });
    
    res.json({ 
        message: 'Signed cookie set',
        // req.signedCookies содержит только подписанные cookies
        signedCookie: req.signedCookies
    });
});

// GET маршрут для установки cookies с различными опциями
app.get('/set-options', (req, res) => {
    // Пример с secure (работает только по HTTPS)
    // res.cookie('secure', 'value', { secure: true });
    
    // Cookie с указанием домена (работает для всех поддоменов .example.com)
    res.cookie('domain', 'example.com', { domain: '.example.com' });
    
    // Cookie с конкретной датой истечения
    const expires = new Date();
    expires.setDate(expires.getDate() + 7); // Истекает через 7 дней
    res.cookie('expiring', 'value', { expires });
    
    res.json({ message: 'Cookies with options set' });
});

// GET маршрут для получения всех cookies
app.get('/get-cookies', (req, res) => {
    res.json({
        cookies: req.cookies,                // Обычные cookies
        signedCookies: req.signedCookies,    // Подписанные cookies
        allCookies: req.headers.cookie       // Все cookies как строка из заголовка
    });
});

// GET маршрут для удаления конкретного cookie
app.get('/clear-cookie/:name', (req, res) => {
    const { name } = req.params; // Получаем имя cookie из URL параметра
    res.clearCookie(name); // Удаление cookie
    res.json({ message: `Cookie "${name}" cleared` });
});

// GET маршрут для удаления всех cookies
app.get('/clear-all', (req, res) => {
    // Удаляем все обычные cookies
    Object.keys(req.cookies).forEach(name => {
        res.clearCookie(name);
    });
    
    // Удаляем все подписанные cookies
    Object.keys(req.signedCookies).forEach(name => {
        res.clearCookie(name);
    });
    
    res.json({ message: 'All cookies cleared' });
});

// POST маршрут для сохранения настроек пользователя в cookies
app.post('/settings', express.json(), (req, res) => {
    const { theme, language, notifications } = req.body;
    
    // Сохраняем настройки в cookies с временем жизни 30 дней
    if (theme) res.cookie('theme', theme, { maxAge: 30 * 24 * 3600000 });
    if (language) res.cookie('language', language, { maxAge: 30 * 24 * 3600000 });
    if (notifications) res.cookie('notifications', notifications, { maxAge: 30 * 24 * 3600000 });
    
    res.json({ message: 'Settings saved', settings: req.body });
});

// GET маршрут для получения сохраненных настроек
app.get('/settings', (req, res) => {
    res.json({
        theme: req.cookies.theme || 'light',           // Значение из cookie или по умолчанию
        language: req.cookies.language || 'en',
        notifications: req.cookies.notifications || 'on'
    });
});

// Главная страница с демонстрацией работы с cookies
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>...HTML код с интерфейсом для управления cookies...</html>`);
});

// Запуск сервера
app.listen(3000, () => {
    console.log('Express сервер с cookie на http://localhost:3000');
    console.log('Примеры:');
    console.log('  GET /set-cookie - установка cookie');
    console.log('  GET /get-cookies - получение cookie');
    console.log('  GET /clear-cookie/:name - удаление cookie');
});