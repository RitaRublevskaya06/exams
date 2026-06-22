// express_json.js - Express сервер для обработки JSON
// Импорт модуля express для создания веб-приложения
const express = require('express');
// Создание экземпляра Express приложения
const app = express();

// Middleware: Парсинг JSON из тела запроса с ограничением размера 10MB
app.use(express.json({ limit: '10mb' }));
// Middleware: Парсинг URL-encoded данных (форматы application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));

// POST маршрут для обработки JSON данных
app.post('/api/data', (req, res) => {
    // req.body содержит распарсенные JSON данные из тела запроса
    const data = req.body;
    
    // Отправляем JSON ответ с полученными данными
    res.json({
        status: 'success',
        received: data,
        timestamp: new Date().toISOString(),  // Текущая дата в формате ISO
        echo: data  // Эхо-ответ с теми же данными
    });
});

// POST маршрут для создания пользователя с JSON
app.post('/api/users', (req, res) => {
    // Деструктуризация тела запроса для получения user, profile, settings
    const { user, profile, settings } = req.body;
    
    // Валидация: проверяем наличие user и email
    if (!user || !user.email) {
        // Если email отсутствует, возвращаем ошибку 400
        res.status(400).json({ error: 'User email required' });
        return;  // Прерываем выполнение функции
    }
    
    // Создаем нового пользователя с расширенными данными
    const newUser = {
        id: Date.now(),  // Генерируем ID на основе текущего времени
        ...user,  // Spread оператор: копируем все свойства из user
        profile: {
            ...profile,  // Копируем свойства из profile
            createdAt: new Date()  // Добавляем дату создания
        },
        settings: {
            // Опциональная цепочка (?): если settings существует, берем theme, иначе 'light'
            theme: settings?.theme || 'light',
            // Если notifications не равен false, то true (по умолчанию включены)
            notifications: settings?.notifications !== false
        }
    };
    
    // Возвращаем созданного пользователя с кодом 201 (Created)
    res.status(201).json(newUser);
});

// POST маршрут для обработки массива операций
app.post('/api/batch', (req, res) => {
    // Получаем массив operations из тела запроса
    const { operations } = req.body;
    
    // Валидация: проверяем, что operations является массивом
    if (!Array.isArray(operations)) {
        res.status(400).json({ error: 'operations must be an array' });
        return;
    }
    
    // Преобразуем каждую операцию в результат обработки
    const results = operations.map((op, index) => ({
        index,  // Индекс операции в массиве
        operation: op.type,  // Тип операции из исходного объекта
        status: 'processed',  // Статус обработки
        timestamp: new Date().toISOString()  // Время обработки
    }));
    
    // Возвращаем результаты обработки
    res.json({ results, count: results.length });
});

// GET маршрут для получения списка продуктов
app.get('/api/products', (req, res) => {
    // Статический массив продуктов
    const products = [
        { id: 1, name: 'Laptop', price: 999.99, category: 'Electronics' },
        { id: 2, name: 'Mouse', price: 29.99, category: 'Electronics' },
        { id: 3, name: 'Desk', price: 199.99, category: 'Furniture' }
    ];
    
    // Возвращаем JSON с продуктами и метаданными
    res.json({
        success: true,
        data: products,
        total: products.length,
        timestamp: new Date().toISOString()
    });
});

// GET маршрут для поиска с query-параметрами
app.get('/api/search', (req, res) => {
    // Деструктуризация query-параметров из URL
    const { q, category, minPrice, maxPrice } = req.query;
    
    // Формируем объект результатов
    const results = {
        query: q || '',  // Поисковый запрос или пустая строка
        filters: { category, minPrice, maxPrice },  // Фильтры из query-параметров
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

// POST маршрут для валидации JSON данных
app.post('/api/validate', (req, res) => {
    // Получаем данные для валидации
    const { name, email, age } = req.body;
    const errors = [];  // Массив для накопления ошибок
    
    // Валидация имени
    if (!name || typeof name !== 'string' || name.length < 2) {
        errors.push('name: string with min length 2');
    }
    
    // Валидация email с помощью регулярного выражения
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('email: valid email required');
    }
    
    // Валидация возраста (необязательное поле)
    if (age !== undefined && (typeof age !== 'number' || age < 0 || age > 150)) {
        errors.push('age: number between 0 and 150');
    }
    
    // Если есть ошибки, возвращаем их
    if (errors.length > 0) {
        res.status(400).json({ errors });
    } else {
        // Если валидация прошла успешно
        res.json({ valid: true, data: { name, email, age } });
    }
});

// POST маршрут для обработки вложенных JSON объектов
app.post('/api/nested', (req, res) => {
    // Получаем вложенные объекты из тела запроса
    const { metadata, payload, config } = req.body;
    
    res.json({
        received: {
            metadata: metadata || {},  // По умолчанию пустой объект
            payload: payload || {},
            config: config || { debug: false }  // Значение по умолчанию для config
        },
        processedAt: new Date().toISOString()  // Время обработки
    });
});

// Запуск сервера на порту 3000
app.listen(3000, () => {
    console.log('Express JSON сервер на http://localhost:3000');
    console.log('Примеры запросов:');
    console.log('  GET /api/products');
    console.log('  POST /api/data -d \'{"test":"value"}\' -H "Content-Type: application/json"');
    console.log('  POST /api/users -d \'{"user":{"name":"John","email":"john@example.com"}}\'');
});