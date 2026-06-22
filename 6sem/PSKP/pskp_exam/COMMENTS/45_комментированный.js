// Импорт модуля http для создания HTTP сервера
const http = require('http');
// Импорт модуля sequelize для работы с ORM
const { Sequelize, DataTypes } = require('sequelize');

// Создание экземпляра Sequelize для подключения к SQL Server
const sequelize = new Sequelize('testdb', 'sa', 'StrongPass_2026!', {
    host: '127.0.0.1', // Хост сервера
    port: 1433, // Порт SQL Server
    dialect: 'mssql', // Тип базы данных
    dialectOptions: {
        options: {
            encrypt: false, // Отключение шифрования
            trustServerCertificate: true // Доверие сертификату сервера
        }
    }
});

// Определение модели Product с использованием Sequelize
const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER, // Тип данных INTEGER
        autoIncrement: true, // Автоинкрементное поле
        primaryKey: true // Первичный ключ
    },
    name: {
        type: DataTypes.STRING(100), // Строковое поле длиной 100 символов
        allowNull: false // Обязательное поле
    },
    price: {
        type: DataTypes.DECIMAL(10, 2), // Десятичное число с 2 знаками после запятой
        allowNull: false // Обязательное поле
    },
    category: {
        type: DataTypes.STRING(50), // Строковое поле длиной 50 символов
        defaultValue: 'General' // Значение по умолчанию
    },
    inStock: {
        type: DataTypes.BOOLEAN, // Логическое поле
        defaultValue: true // Значение по умолчанию
    }
}, {
    tableName: 'products_sequelize', // Имя таблицы в базе данных
    timestamps: true // Включение временных меток (createdAt, updatedAt)
});

// Функция для инициализации базы данных
async function initDB() {
    try {
        // Проверка подключения к базе данных
        await sequelize.authenticate();
        console.log('Connected to SQL Server');
        // Синхронизация модели с базой данных (создание таблицы если не существует)
        await sequelize.sync({ force: true });
        console.log('Table synced');
        
        // Добавление тестовых данных
        await Product.bulkCreate([
            { name: 'Laptop', price: 999.99, category: 'Electronics' },
            { name: 'Mouse', price: 29.99, category: 'Electronics' },
            { name: 'Desk', price: 199.99, category: 'Furniture' }
        ]);
        console.log('Test data added');
        return true;
    } catch (error) {
        // Обработка ошибок подключения
        console.error('DB error:', error.message);
        return false;
    }
}

// Создание HTTP сервера
const server = http.createServer((req, res) => {
    // Парсинг URL для извлечения пути
    const url = new URL(req.url, `http://${req.headers.host}`);

    // Обработка GET запроса для получения всех продуктов
    if (req.method === 'GET' && url.pathname === '/products') {
        // Использование IIFE для асинхронной обработки
        (async () => {
            try {
                // Использование Sequelize для получения всех записей
                const products = await Product.findAll();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(products));
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        })();
    }
    // Обработка GET запроса для получения продукта по ID
    else if (req.method === 'GET' && /^\/products\/\d+$/.test(url.pathname)) {
        // Извлечение ID из URL
        const id = parseInt(url.pathname.split('/')[2]);
        (async () => {
            try {
                // Использование Sequelize для поиска по первичному ключу
                const product = await Product.findByPk(id);
                if (!product) {
                    // Продукт не найден
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Product not found' }));
                } else {
                    // Успешное получение продукта
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(product));
                }
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        })();
    }
    // Обработка POST запроса для создания нового продукта
    else if (req.method === 'POST' && url.pathname === '/products') {
        let body = '';
        // Сбор данных тела запроса
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                // Парсинг JSON из тела запроса
                const data = JSON.parse(body);
                // Использование Sequelize для создания новой записи
                const product = await Product.create(data);
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(product));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });
    }
    // Обработка PUT запроса для обновления продукта
    else if (req.method === 'PUT' && /^\/products\/\d+$/.test(url.pathname)) {
        const id = parseInt(url.pathname.split('/')[2]);
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const updates = JSON.parse(body);
                // Поиск продукта по ID
                const product = await Product.findByPk(id);
                if (!product) {
                    // Продукт не найден
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Product not found' }));
                } else {
                    // Обновление продукта с использованием Sequelize
                    await product.update(updates);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(product));
                }
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });
    }
    // Обработка DELETE запроса для удаления продукта
    else if (req.method === 'DELETE' && /^\/products\/\d+$/.test(url.pathname)) {
        const id = parseInt(url.pathname.split('/')[2]);
        (async () => {
            try {
                // Удаление продукта с использованием Sequelize
                const deleted = await Product.destroy({ where: { id } });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, deleted }));
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        })();
    }
    // Обработка всех других запросов (главная страница)
    else {
        // Установка заголовков для HTML ответа
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        // Отправка HTML страницы с интерфейсом управления продуктами
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Sequelize Demo</title>
                <style>
                    body { font-family: Arial; padding: 20px; }
                    .product { border: 1px solid #ccc; margin: 5px; padding: 10px; }
                    input, button { margin: 5px; padding: 5px; }
                </style>
            </head>
            <body>
                <h1>Sequelize ORM Demo (SQL Server)</h1>
                <div>
                    <input type="text" id="name" placeholder="Name">
                    <input type="number" id="price" placeholder="Price">
                    <input type="text" id="category" placeholder="Category">
                    <button onclick="createProduct()">Create</button>
                </div>
                <div id="products"></div>
                <script>
                    // Функция для загрузки списка продуктов
                    function loadProducts() {
                        fetch('/products')
                            .then(res => res.json())
                            .then(data => {
                                const container = document.getElementById('products');
                                if (data.length) {
                                    // Отображение продуктов с кнопками удаления
                                    container.innerHTML = data.map(p => \`
                                        <div class="product">
                                            <strong>\${p.name}</strong> - $\${p.price} - \${p.category}
                                            <button onclick="deleteProduct(\${p.id})">Delete</button>
                                        </div>
                                    \`).join('');
                                }
                            });
                    }
                    
                    // Функция для создания нового продукта
                    function createProduct() {
                        const name = document.getElementById('name').value;
                        const price = parseFloat(document.getElementById('price').value);
                        const category = document.getElementById('category').value;
                        fetch('/products', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name, price, category })
                        }).then(() => loadProducts());
                    }
                    
                    // Функция для удаления продукта
                    function deleteProduct(id) {
                        fetch(\`/products/\${id}\`, { method: 'DELETE' })
                            .then(() => loadProducts());
                    }
                    
                    // Загрузка продуктов при загрузке страницы
                    loadProducts();
                </script>
            </body>
            </html>
        `);
    }
});

// Инициализация базы данных и запуск сервера
initDB().then(success => {
    if (success) {
        server.listen(3000, () => {
            console.log('Sequelize server on http://localhost:3000');
            console.log('GET /products - all products');
            console.log('POST /products - create product');
            console.log('PUT /products/1 - update product');
            console.log('DELETE /products/1 - delete product');
        });
    }
});