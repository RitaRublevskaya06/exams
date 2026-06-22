// express_json.js
const express = require('express');
const app = express();

// Парсинг JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// POST с JSON
app.post('/api/data', (req, res) => {
    const data = req.body;
    
    res.json({
        status: 'success',
        received: data,
        timestamp: new Date().toISOString(),
        echo: data
    });
});

// Сложный JSON объект
app.post('/api/users', (req, res) => {
    const { user, profile, settings } = req.body;
    
    if (!user || !user.email) {
        res.status(400).json({ error: 'User email required' });
        return;
    }
    
    const newUser = {
        id: Date.now(),
        ...user,
        profile: {
            ...profile,
            createdAt: new Date()
        },
        settings: {
            theme: settings?.theme || 'light',
            notifications: settings?.notifications !== false
        }
    };
    
    res.status(201).json(newUser);
});

// JSON с массивом
app.post('/api/batch', (req, res) => {
    const { operations } = req.body;
    
    if (!Array.isArray(operations)) {
        res.status(400).json({ error: 'operations must be an array' });
        return;
    }
    
    const results = operations.map((op, index) => ({
        index,
        operation: op.type,
        status: 'processed',
        timestamp: new Date().toISOString()
    }));
    
    res.json({ results, count: results.length });
});

// GET с JSON ответом
app.get('/api/products', (req, res) => {
    const products = [
        { id: 1, name: 'Laptop', price: 999.99, category: 'Electronics' },
        { id: 2, name: 'Mouse', price: 29.99, category: 'Electronics' },
        { id: 3, name: 'Desk', price: 199.99, category: 'Furniture' }
    ];
    
    res.json({
        success: true,
        data: products,
        total: products.length,
        timestamp: new Date().toISOString()
    });
});

// JSON с фильтрацией
app.get('/api/search', (req, res) => {
    const { q, category, minPrice, maxPrice } = req.query;
    
    const results = {
        query: q || '',
        filters: { category, minPrice, maxPrice },
        results: [
            { id: 1, name: `Result for "${q}"`, relevance: 0.95 }
        ],
        pagination: {
            page: 1,
            limit: 10,
            total: 1
        }
    };
    
    res.json(results);
});

// Обработка JSON с валидацией схемы
app.post('/api/validate', (req, res) => {
    const { name, email, age } = req.body;
    const errors = [];
    
    if (!name || typeof name !== 'string' || name.length < 2) {
        errors.push('name: string with min length 2');
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('email: valid email required');
    }
    if (age !== undefined && (typeof age !== 'number' || age < 0 || age > 150)) {
        errors.push('age: number between 0 and 150');
    }
    
    if (errors.length > 0) {
        res.status(400).json({ errors });
    } else {
        res.json({ valid: true, data: { name, email, age } });
    }
});

// JSON с вложенными объектами
app.post('/api/nested', (req, res) => {
    const { metadata, payload, config } = req.body;
    
    res.json({
        received: {
            metadata: metadata || {},
            payload: payload || {},
            config: config || { debug: false }
        },
        processedAt: new Date().toISOString()
    });
});

app.listen(3000, () => {
    console.log('Express JSON сервер на http://localhost:3000');
    console.log('Примеры запросов:');
    console.log('  GET /api/products');
    console.log('  POST /api/data -d \'{"test":"value"}\' -H "Content-Type: application/json"');
    console.log('  POST /api/users -d \'{"user":{"name":"John","email":"john@example.com"}}\'');
});