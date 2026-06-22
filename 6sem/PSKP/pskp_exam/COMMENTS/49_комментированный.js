// Импорт модуля express для создания веб-сервера
const express = require('express');
// Создание экземпляра приложения Express
const app = express();

// Настройка middleware для парсинга x-www-form-urlencoded данных
app.use(express.urlencoded({ extended: true })); // Парсинг данных из форм
app.use(express.json()); // Парсинг JSON данных

// Обработка POST запроса для формы в формате x-www-form-urlencoded
app.post('/submit-form', (req, res) => {
    // Извлечение данных из тела запроса
    const { username, email, password, age, newsletter } = req.body;
    
    // Отправка JSON ответа с полученными данными
    res.json({
        message: 'Form received',
        data: {
            username: username || 'anonymous', // Имя пользователя или значение по умолчанию
            email: email, // Email пользователя
            password: password ? '***' : undefined, // Пароль (скрытый)
            age: age ? parseInt(age) : null, // Возраст или null
            newsletter: newsletter === 'on' || newsletter === 'true' // Преобразование флага подписки
        },
        contentType: req.headers['content-type'] // Тип контента запроса
    });
});

// Обработка POST запроса для регистрации пользователя
app.post('/register', (req, res) => {
    // Извлечение данных регистрации из тела запроса
    const { name, email, password, confirmPassword } = req.body;
    const errors = []; // Массив для хранения ошибок валидации
    
    // Валидация имени пользователя
    if (!name || name.length < 2) {
        errors.push('Name must be at least 2 characters');
    }
    // Валидация email
    if (!email || !email.includes('@')) {
        errors.push('Valid email required');
    }
    // Валидация пароля
    if (!password || password.length < 6) {
        errors.push('Password must be at least 6 characters');
    }
    // Проверка совпадения паролей
    if (password !== confirmPassword) {
        errors.push('Passwords do not match');
    }
    
    // Проверка наличия ошибок валидации
    if (errors.length > 0) {
        // Отправка ошибок с кодом 400
        res.status(400).json({ errors });
    } else {
        // Успешная регистрация
        res.json({
            success: true,
            user: { name, email, registeredAt: new Date() } // Данные пользователя с временем регистрации
        });
    }
});

// Обработка POST запроса с вложенными данными профиля
app.post('/profile', (req, res) => {
    // Извлечение вложенных данных из тела запроса
    const { personal, address, preferences } = req.body;
    
    // Отправка JSON ответа с структурированными данными
    res.json({
        personal: {
            firstName: personal?.firstName, // Опциональная цепочка для безопасного доступа
            lastName: personal?.lastName,
            phone: personal?.phone
        },
        address: {
            street: address?.street,
            city: address?.city,
            zipCode: address?.zipCode
        },
        preferences: {
            language: preferences?.language || 'en', // Язык или значение по умолчанию
            notifications: preferences?.notifications || false // Уведомления или значение по умолчанию
        }
    });
});

// Обработка POST запроса с массивами в теле запроса
app.post('/batch', (req, res) => {
    // Извлечение массива элементов и действия из тела запроса
    const { items, action } = req.body;
    
    // Валидация типа items
    if (!Array.isArray(items)) {
        // Ошибка если items не является массивом
        res.status(400).json({ error: 'items must be an array' });
        return;
    }
    
    // Отправка JSON ответа с обработанными элементами
    res.json({
        action, // Действие для выполнения
        count: items.length, // Количество элементов
        processed: items.map((item, index) => ({ index, item, status: 'ok' })) // Массив обработанных элементов
    });
});

// Обработка GET запроса для отображения HTML формы
app.get('/form', (req, res) => {
    // Отправка HTML страницы с формой для тестирования
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Form Test</title>
            <style>
                body { font-family: Arial; padding: 20px; }
                .form-group { margin: 10px 0; }
                label { display: inline-block; width: 120px; }
                input { padding: 5px; width: 200px; }
                button { padding: 10px 20px; margin-top: 10px; }
            </style>
        </head>
        <body>
            <h1>Тестирование POST с x-www-form-urlencoded</h1>
            <form action="/submit-form" method="POST" enctype="application/x-www-form-urlencoded">
                <div class="form-group">
                    <label>Username:</label>
                    <input type="text" name="username" required>
                </div>
                <div class="form-group">
                    <label>Email:</label>
                    <input type="email" name="email" required>
                </div>
                <div class="form-group">
                    <label>Password:</label>
                    <input type="password" name="password">
                </div>
                <div class="form-group">
                    <label>Age:</label>
                    <input type="number" name="age">
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" name="newsletter" value="on"> Subscribe to newsletter
                    </label>
                </div>
                <button type="submit">Submit</button>
            </form>
            
            <h2>Тестирование через curl:</h2>
            <code>
                curl -X POST -d "username=john&email=john@example.com&password=secret&age=25" http://localhost:3000/submit-form
            </code>
        </body>
        </html>
    `);
});

// Перенаправление корневого пути на форму
app.get('/', (req, res) => {
    res.redirect('/form');
});

// Запуск сервера на порту 3000
app.listen(3000, () => {
    console.log('Express сервер на http://localhost:3000');
    console.log('POST /submit-form - обработка x-www-form-urlencoded');
    console.log('POST /register - регистрация пользователя');
    console.log('GET /form - форма для тестирования');
});