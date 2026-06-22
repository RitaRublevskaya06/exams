// Импорт модуля express для создания веб-сервера
const express = require('express');
// Создание экземпляра приложения Express
const app = express();

// Middleware для логирования всех запросов
app.use((req, res, next) => {
    // Вывод информации о запросе в консоль
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    // Переход к следующему middleware/обработчику
    next();
});

// Middleware для парсинга JSON данных из тела запроса
app.use(express.json());
// Middleware для парсинга URL-encoded данных из тела запроса
app.use(express.urlencoded({ extended: true }));

// Пользовательский middleware для проверки авторизации
const authMiddleware = (req, res, next) => {
    // Извлечение токена авторизации из заголовков
    const token = req.headers['authorization'];
    // Проверка валидности токена
    if (token === 'secret123') {
        // Токен верный - переход к следующему middleware
        next();
    } else {
        // Токен неверный - отправка ошибки 401
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// Маршрут с route-параметром :id
app.get('/users/:id', (req, res) => {
    // Отправка JSON ответа с извлеченным параметром id
    res.json({ userId: req.params.id, message: 'User found' });
});

// Маршрут с множественными route-параметрами
app.get('/users/:userId/posts/:postId', (req, res) => {
    // Отправка JSON ответа с извлеченными параметрами userId и postId
    res.json({ userId: req.params.userId, postId: req.params.postId });
});

// Маршрут с query-параметрами
app.get('/search', (req, res) => {
    // Отправка JSON ответа с query-параметрами q и page
    res.json({ query: req.query.q, page: req.query.page || 1 });
});

// Маршрут с шаблоном для любых файлов (wildcard)
app.get('/files/*', (req, res) => {
    // Отправка JSON ответа с извлеченным путем файла
    res.json({ path: req.params[0] });
});

// Маршрут с регулярным выражением для числовых идентификаторов продуктов
app.get(/\/product\/(\d+)/, (req, res) => {
    // Отправка JSON ответа с извлеченным productId
    res.json({ productId: req.params[0] });
});

// Создание маршрутизатора для группировки API маршрутов
const apiRouter = express.Router();
// Маршрут для проверки статуса API
apiRouter.get('/status', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});
// Маршрут для получения версии API
apiRouter.get('/version', (req, res) => {
    res.json({ version: '1.0.0' });
});
// Подключение маршрутизатора API с префиксом /api
app.use('/api', apiRouter);

// Маршрут с применением middleware авторизации
app.get('/admin', authMiddleware, (req, res) => {
    // Доступно только при наличии правильного токена авторизации
    res.json({ message: 'Welcome to admin panel' });
});

// Обработка POST запроса для создания ресурса
app.post('/resource', (req, res) => {
    // Отправка JSON ответа с кодом 201 (Created) и данными из тела запроса
    res.status(201).json({ created: req.body });
});

// Обработка PUT запроса для обновления ресурса
app.put('/resource/:id', (req, res) => {
    // Отправка JSON ответа с ID ресурса и данными обновления
    res.json({ updated: req.params.id, data: req.body });
});

// Обработка DELETE запроса для удаления ресурса
app.delete('/resource/:id', (req, res) => {
    // Отправка JSON ответа с ID удаленного ресурса
    res.json({ deleted: req.params.id });
});

// Middleware для обработки ошибки 404 (не найден)
app.use((req, res) => {
    // Отправка JSON ответа с кодом 404
    res.status(404).json({ error: 'Not Found' });
});

// Middleware для обработки ошибок сервера
app.use((err, req, res, next) => {
    // Вывод стека ошибки в консоль
    console.error(err.stack);
    // Отправка JSON ответа с кодом 500
    res.status(500).json({ error: 'Internal Server Error' });
});

// Запуск сервера на порту 3000
app.listen(3000, () => {
    console.log('Express сервер на http://localhost:3000');
    console.log('Примеры маршрутов:');
    console.log('  GET /users/123');
    console.log('  GET /search?q=hello');
    console.log('  GET /api/status');
    console.log('  POST /resource');
});