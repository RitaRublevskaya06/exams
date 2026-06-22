// express_route_params.js
const express = require('express');
const app = express();

app.use(express.json());

// Базовые route-параметры
app.get('/users/:userId', (req, res) => {
    const { userId } = req.params;
    res.json({
        message: 'User found',
        userId: userId,
        type: 'basic'
    });
});

// Несколько параметров
app.get('/users/:userId/posts/:postId', (req, res) => {
    const { userId, postId } = req.params;
    res.json({
        message: 'Post found',
        userId,
        postId,
        type: 'multiple'
    });
});

// Параметры с регулярным выражением (только цифры)
app.get('/products/:productId(\\d+)', (req, res) => {
    res.json({
        message: 'Product found',
        productId: parseInt(req.params.productId),
        type: 'numeric'
    });
});

// Необязательные параметры
app.get('/company/:companyId?/:departmentId?', (req, res) => {
    const { companyId, departmentId } = req.params;
    res.json({
        message: 'Company info',
        companyId: companyId || 'not specified',
        departmentId: departmentId || 'not specified'
    });
});

// Сложный шаблон с дефисами
app.get('/api/v:version/resource/:resourceId', (req, res) => {
    const { version, resourceId } = req.params;
    res.json({
        version: parseInt(version),
        resourceId,
        timestamp: new Date().toISOString()
    });
});

 
app.param('userId', (req, res, next, userId) => {
    console.log(`Processing userId: ${userId}`);
    req.userId = parseInt(userId);
    next();
});

app.get('/profile/:userId', (req, res) => {
    res.json({
        processedUserId: req.userId,
        originalParam: req.params.userId
    });
});

// Параметры в query строке (дополнительно)
app.get('/search/:category', (req, res) => {
    const { category } = req.params;
    const { q, limit } = req.query;
    res.json({
        category,
        searchQuery: q,
        limit: limit || 10
    });
});

app.listen(3000, () => {
    console.log('Express сервер на http://localhost:3000');
    console.log('Примеры route-параметров:');
    console.log('  GET /users/123');
    console.log('  GET /users/123/posts/456');
    console.log('  GET /products/789');
    console.log('  GET /company/abc');
    console.log('  GET /api/v2/resource/xyz');
});