// express_query_params.js
const express = require('express');
const app = express();

// Базовые query-параметры
app.get('/search', (req, res) => {
    const { q, page, limit } = req.query;
    res.json({
        message: 'Search results',
        query: q || 'empty',
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10
    });
});

// Множественные параметры
app.get('/filter', (req, res) => {
    const { category, minPrice, maxPrice, inStock, sort } = req.query;
    res.json({
        filters: {
            category: category || 'all',
            minPrice: minPrice ? parseFloat(minPrice) : null,
            maxPrice: maxPrice ? parseFloat(maxPrice) : null,
            inStock: inStock === 'true',
            sort: sort || 'name'
        }
    });
});

// Массивы в query-параметрах
app.get('/products', (req, res) => {
    // /products?ids=1&ids=2&ids=3
    const ids = req.query.ids;
    const idsArray = Array.isArray(ids) ? ids : (ids ? [ids] : []);
    
    // /products?tags=electronics,computer,mouse
    const tags = req.query.tags ? req.query.tags.split(',') : [];
    
    res.json({
        ids: idsArray,
        tags: tags,
        count: idsArray.length
    });
});

// Вложенные параметры (парсинг вручную)
app.get('/advanced', (req, res) => {
    const { sort, fields, embed } = req.query;
    
    const sortObject = {};
    if (sort) {
        const [field, order] = sort.split(':');
        sortObject[field] = order || 'asc';
    }
    
    res.json({
        sort: sortObject,
        fields: fields ? fields.split(',') : [],
        embed: embed ? embed.split(',') : []
    });
});

// Параметры с типами
app.get('/data', (req, res) => {
    const {
        name = 'default',
        age,
        active,
        score,
        timestamp
    } = req.query;
    
    res.json({
        name: String(name),
        age: age ? parseInt(age) : null,
        active: active === 'true',
        score: score ? parseFloat(score) : null,
        timestamp: timestamp ? new Date(timestamp) : null
    });
});

// Валидация query-параметров
app.get('/validate', (req, res) => {
    const { email, minAge, maxAge } = req.query;
    const errors = [];
    
    if (email && !email.includes('@')) {
        errors.push('Invalid email format');
    }
    if (minAge && (parseInt(minAge) < 0 || parseInt(minAge) > 150)) {
        errors.push('Invalid minAge');
    }
    if (maxAge && (parseInt(maxAge) < 0 || parseInt(maxAge) > 150)) {
        errors.push('Invalid maxAge');
    }
    if (minAge && maxAge && parseInt(minAge) > parseInt(maxAge)) {
        errors.push('minAge cannot be greater than maxAge');
    }
    
    if (errors.length > 0) {
        res.status(400).json({ errors });
    } else {
        res.json({
            valid: true,
            email: email || null,
            ageRange: {
                min: minAge ? parseInt(minAge) : null,
                max: maxAge ? parseInt(maxAge) : null
            }
        });
    }
});

// Комбинация route и query параметров
app.get('/users/:userId/orders', (req, res) => {
    const { userId } = req.params;
    const { status, from, to, limit = 10, offset = 0 } = req.query;
    
    res.json({
        userId,
        filters: { status, from, to },
        pagination: { limit: parseInt(limit), offset: parseInt(offset) }
    });
});

app.listen(3000, () => {
    console.log('Express сервер на http://localhost:3000');
    console.log('Примеры query-параметров:');
    console.log('  GET /search?q=nodejs&page=2&limit=20');
    console.log('  GET /filter?category=books&minPrice=10&maxPrice=50&inStock=true');
    console.log('  GET /products?ids=1&ids=2&ids=3');
    console.log('  GET /users/123/orders?status=paid&limit=5');
});