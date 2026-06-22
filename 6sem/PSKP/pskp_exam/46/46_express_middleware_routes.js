// express_middleware_routes.js
const express = require('express'); // npm install express
const app = express();

// Middleware для логирования
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Middleware для парсинга JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware для проверки авторизации
const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization'];
    if (token === 'secret123') {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// Маршруты с шаблонами
// /users/123 - параметр
app.get('/users/:id', (req, res) => {
    res.json({ userId: req.params.id, message: 'User found' });
});

// /users/123/posts/456 - множественные параметры
app.get('/users/:userId/posts/:postId', (req, res) => {
    res.json({ userId: req.params.userId, postId: req.params.postId });
});

// /search?q=... - query параметры
app.get('/search', (req, res) => {
    res.json({ query: req.query.q, page: req.query.page || 1 });
});

// Шаблоны маршрутов
// /files/* - любое продолжение
app.get('/files/*', (req, res) => {
    res.json({ path: req.params[0] });
});

// Регулярное выражение в маршруте
app.get(/\/product\/(\d+)/, (req, res) => {
    res.json({ productId: req.params[0] });
});

// Группировка маршрутов с Router
const apiRouter = express.Router();
apiRouter.get('/status', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});
apiRouter.get('/version', (req, res) => {
    res.json({ version: '1.0.0' });
});
app.use('/api', apiRouter);

// Применение middleware к конкретному маршруту
app.get('/admin', authMiddleware, (req, res) => {
    res.json({ message: 'Welcome to admin panel' });
});

// Обработка POST, PUT, DELETE
app.post('/resource', (req, res) => {
    res.status(201).json({ created: req.body });
});

app.put('/resource/:id', (req, res) => {
    res.json({ updated: req.params.id, data: req.body });
});

app.delete('/resource/:id', (req, res) => {
    res.json({ deleted: req.params.id });
});

// Обработка ошибок 404
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(3000, () => {
    console.log('Express сервер на http://localhost:3000');
    console.log('Примеры маршрутов:');
    console.log('  GET /users/123');
    console.log('  GET /search?q=hello');
    console.log('  GET /api/status');
    console.log('  POST /resource');
});