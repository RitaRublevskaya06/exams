// Импорт модуля express для создания веб-сервера
const express = require('express');
// Создание экземпляра приложения Express
const app = express();

// Базовые query-параметры для поиска
app.get('/search', (req, res) => {
    // Извлечение query-параметров из запроса
    const { q, page, limit } = req.query;
    // Отправка JSON ответа с параметрами поиска
    res.json({
        message: 'Search results',
        query: q || 'empty', // Поисковый запрос или значение по умолчанию
        page: parseInt(page) || 1, // Номер страницы или значение по умолчанию
        limit: parseInt(limit) || 10 // Количество результатов или значение по умолчанию
    });
});

// Фильтрация с множественными параметрами
app.get('/filter', (req, res) => {
    // Извлечение параметров фильтрации
    const { category, minPrice, maxPrice, inStock, sort } = req.query;
    // Отправка JSON ответа с параметрами фильтрации
    res.json({
        filters: {
            category: category || 'all', // Категория или значение по умолчанию
            minPrice: minPrice ? parseFloat(minPrice) : null, // Минимальная цена или null
            maxPrice: maxPrice ? parseFloat(maxPrice) : null, // Максимальная цена или null
            inStock: inStock === 'true', // Преобразование строки в boolean
            sort: sort || 'name' // Параметр сортировки или значение по умолчанию
        }
    });
});

// Обработка массивов в query-параметрах
app.get('/products', (req, res) => {
    // Пример: /products?ids=1&ids=2&ids=3 (массив параметров)
    const ids = req.query.ids;
    // Преобразование параметра в массив (если это массив, оставляем как есть, если строка - делаем массив)
    const idsArray = Array.isArray(ids) ? ids : (ids ? [ids] : []);
    
    // Пример: /products?tags=electronics,computer,mouse
    const tags = req.query.tags ? req.query.tags.split(',') : [];
    
    // Отправка JSON ответа с обработанными параметрами
    res.json({
        ids: idsArray,
        tags: tags,
        count: idsArray.length // Количество идентификаторов
    });
});

// Расширенные параметры с вложенной структурой
app.get('/advanced', (req, res) => {
    // Извлечение параметров сортировки, полей и вложенных объектов
    const { sort, fields, embed } = req.query;
    
    // Обработка параметра сортировки
    const sortObject = {};
    if (sort) {
        // Разделение параметра сортировки на поле и порядок (например: "price:desc")
        const [field, order] = sort.split(':');
        sortObject[field] = order || 'asc'; // Значение по умолчанию 'asc'
    }
    
    // Отправка JSON ответа с обработанными параметрами
    res.json({
        sort: sortObject, // Объект сортировки
        fields: fields ? fields.split(',') : [], // Массив полей для выборки
        embed: embed ? embed.split(',') : [] // Массив вложенных объектов для включения
    });
});

// Параметры с различными типами данных
app.get('/data', (req, res) => {
    // Извлечение параметров с различными типами
    const {
        name = 'default', // Значение по умолчанию
        age,
        active,
        score,
        timestamp
    } = req.query;
    
    // Отправка JSON ответа с преобразованными типами
    res.json({
        name: String(name), // Преобразование в строку
        age: age ? parseInt(age) : null, // Преобразование в число или null
        active: active === 'true', // Преобразование в boolean
        score: score ? parseFloat(score) : null, // Преобразование в число с плавающей точкой или null
        timestamp: timestamp ? new Date(timestamp) : null // Преобразование в Date объект или null
    });
});

// Валидация query-параметров
app.get('/validate', (req, res) => {
    // Извлечение параметров для валидации
    const { email, minAge, maxAge } = req.query;
    const errors = []; // Массив для хранения ошибок валидации
    
    // Проверка формата email
    if (email && !email.includes('@')) {
        errors.push('Invalid email format');
    }
    // Проверка допустимого диапазона minAge
    if (minAge && (parseInt(minAge) < 0 || parseInt(minAge) > 150)) {
        errors.push('Invalid minAge');
    }
    // Проверка допустимого диапазона maxAge
    if (maxAge && (parseInt(maxAge) < 0 || parseInt(maxAge) > 150)) {
        errors.push('Invalid maxAge');
    }
    // Проверка логики minAge и maxAge
    if (minAge && maxAge && parseInt(minAge) > parseInt(maxAge)) {
        errors.push('minAge cannot be greater than maxAge');
    }
    
    // Проверка наличия ошибок
    if (errors.length > 0) {
        // Отправка ошибок валидации с кодом 400
        res.status(400).json({ errors });
    } else {
        // Отправка успешного ответа с валидированными параметрами
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

// Комбинация route-параметров и query-параметров
app.get('/users/:userId/orders', (req, res) => {
    // Извлечение route-параметра userId
    const { userId } = req.params;
    // Извлечение query-параметров для фильтрации и пагинации
    const { status, from, to, limit = 10, offset = 0 } = req.query;
    
    // Отправка JSON ответа с комбинацией параметров
    res.json({
        userId,
        filters: { status, from, to }, // Параметры фильтрации
        pagination: { limit: parseInt(limit), offset: parseInt(offset) } // Параметры пагинации
    });
});

// Запуск сервера на порту 3000
app.listen(3000, () => {
    console.log('Express сервер на http://localhost:3000');
    console.log('Примеры query-параметров:');
    console.log('  GET /search?q=nodejs&page=2&limit=20');
    console.log('  GET /filter?category=books&minPrice=10&maxPrice=50&inStock=true');
    console.log('  GET /products?ids=1&ids=2&ids=3');
    console.log('  GET /users/123/orders?status=paid&limit=5');
});