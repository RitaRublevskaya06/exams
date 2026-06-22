// express_body_params.js
const express = require('express');
const app = express();

// Парсинг x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Обработка формы x-www-form-urlencoded
app.post('/submit-form', (req, res) => {
    const { username, email, password, age, newsletter } = req.body;
    
    res.json({
        message: 'Form received',
        data: {
            username: username || 'anonymous',
            email: email,
            password: password ? '***' : undefined,
            age: age ? parseInt(age) : null,
            newsletter: newsletter === 'on' || newsletter === 'true'
        },
        contentType: req.headers['content-type']
    });
});

// Регистрация пользователя
app.post('/register', (req, res) => {
    const { name, email, password, confirmPassword } = req.body;
    const errors = [];
    
    if (!name || name.length < 2) {
        errors.push('Name must be at least 2 characters');
    }
    if (!email || !email.includes('@')) {
        errors.push('Valid email required');
    }
    if (!password || password.length < 6) {
        errors.push('Password must be at least 6 characters');
    }
    if (password !== confirmPassword) {
        errors.push('Passwords do not match');
    }
    
    if (errors.length > 0) {
        res.status(400).json({ errors });
    } else {
        res.json({
            success: true,
            user: { name, email, registeredAt: new Date() }
        });
    }
});

// Обработка вложенных данных
app.post('/profile', (req, res) => {
    const { personal, address, preferences } = req.body;
    
    res.json({
        personal: {
            firstName: personal?.firstName,
            lastName: personal?.lastName,
            phone: personal?.phone
        },
        address: {
            street: address?.street,
            city: address?.city,
            zipCode: address?.zipCode
        },
        preferences: {
            language: preferences?.language || 'en',
            notifications: preferences?.notifications || false
        }
    });
});

// Массивы в body
app.post('/batch', (req, res) => {
    const { items, action } = req.body;
    
    if (!Array.isArray(items)) {
        res.status(400).json({ error: 'items must be an array' });
        return;
    }
    
    res.json({
        action,
        count: items.length,
        processed: items.map((item, index) => ({ index, item, status: 'ok' }))
    });
});

// HTML форма для тестирования
app.get('/form', (req, res) => {
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

app.get('/', (req, res) => {
    res.redirect('/form');
});

app.listen(3000, () => {
    console.log('Express сервер на http://localhost:3000');
    console.log('POST /submit-form - обработка x-www-form-urlencoded');
    console.log('POST /register - регистрация пользователя');
    console.log('GET /form - форма для тестирования');
});