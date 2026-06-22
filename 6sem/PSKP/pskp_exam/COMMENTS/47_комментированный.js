// Импорт модуля express для создания веб-сервера
const express = require('express');
// Создание экземпляра приложения Express
const app = express();

// Настройка middleware для парсинга JSON данных
app.use(express.json());

// Обработка GET запроса с базовым route-параметром
app.get('/users/:userId', (req, res) => {
    // Извлечение параметра userId из URL
    const { userId } = req.params;
    // Отправка JSON ответа с полученным параметром
    res.json({
        message: 'User found',
        userId: userId,
        type: 'basic'
    });
});

// Обработка GET запроса с несколькими route-параметрами
app.get('/users/:userId/posts/:postId', (req, res) => {
    // Извлечение параметров userId и postId из URL
    const { userId, postId } = req.params;
    // Отправка JSON ответа с полученными параметрами
    res.json({
        message: 'Post found',
        userId,
        postId,
        type: 'multiple'
    });
});

// Обработка GET запроса с параметром, ограниченным регулярным выражением (только цифры)
app.get('/products/:productId(\\d+)', (req, res) => {
    // Отправка JSON ответа с преобразованным в число параметром
    res.json({
        message: 'Product found',
        productId: parseInt(req.params.productId), // Преобразование строки в число
        type: 'numeric'
    });
});

// Обработка GET запроса с необязательными route-параметрами
app.get('/company/:companyId?/:departmentId?', (req, res) => {
    // Извлечение опциональных параметров
    const { companyId, departmentId } = req.params;
    // Отправка JSON ответа с параметрами или значениями по умолчанию
    res.json({
        message: 'Company info',
        companyId: companyId || 'not specified', // Значение по умолчанию если параметр отсутствует
        departmentId: departmentId || 'not specified' // Значение по умолчанию если параметр отсутствует
    });
});

// Обработка GET запроса с сложным шаблоном параметров
app.get('/api/v:version/resource/:resourceId', (req, res) => {
    // Извлечение параметров версии и resourceId из URL
    const { version, resourceId } = req.params;
    // Отправка JSON ответа с преобразованной версией и resourceId
    res.json({
        version: parseInt(version), // Преобразование версии в число
        resourceId, // Идентификатор ресурса
        timestamp: new Date().toISOString() // Временная метка
    });
});

// Middleware для предварительной обработки параметра userId
app.param('userId', (req, res, next, userId) => {
    // Логирование обработки userId
    console.log(`Processing userId: ${userId}`);
    // Сохранение преобразованного userId в объекте запроса
    req.userId = parseInt(userId);
    // Переход к следующему middleware/обработчику
    next();
});

// Обработка GET запроса с обработанным через middleware параметром
app.get('/profile/:userId', (req, res) => {
    // Отправка JSON ответа с обработанным и оригинальным параметром
    res.json({
        processedUserId: req.userId, // userId обработанный через middleware
        originalParam: req.params.userId // Оригинальное значение параметра
    });
});

// Обработка GET запроса с комбинацией route-параметра и query-параметров
app.get('/search/:category', (req, res) => {
    // Извлечение route-параметра category
    const { category } = req.params;
    // Извлечение query-параметров q и limit
    const { q, limit } = req.query;
    // Отправка JSON ответа с комбинацией параметров
    res.json({
        category, // Категория из route-параметра
        searchQuery: q, // Поисковый запрос из query-параметра
        limit: limit || 10 // Лимит результатов или значение по умолчанию
    });
});

// Запуск сервера на порту 3000
app.listen(3000, () => {
    console.log('Express сервер на http://localhost:3000');
    console.log('Примеры route-параметров:');
    console.log('  GET /users/123');
    console.log('  GET /users/123/posts/456');
    console.log('  GET /products/789');
    console.log('  GET /company/abc');
    console.log('  GET /api/v2/resource/xyz');
});