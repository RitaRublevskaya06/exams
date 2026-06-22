// Импорт модуля http для создания HTTP сервера
const http = require('http');
// Импорт модуля mssql для работы с SQL Server
const sql = require('mssql');

// Конфигурация подключения к SQL Server
const config = {
    user: 'sa', // Имя пользователя SQL Server
    password: 'StrongPass_2026!', // Пароль пользователя
    server: '127.0.0.1', // Адрес сервера (localhost)
    port: 1433, // Порт SQL Server
    database: 'testdb', // Имя базы данных
    options: {
        encrypt: false, // Отключение шифрования для локальной разработки
        trustServerCertificate: true // Доверие сертификату сервера
    }
};

// Переменная для хранения пула соединений
let pool = null;

// Функция для подключения к базе данных
async function connectDB() {
    try {
        // Подключение к SQL Server с использованием конфигурации
        pool = await sql.connect(config);
        console.log('Connected to SQL Server');
        
        // Создание таблицы products если она не существует
        await pool.request().query(`
            IF OBJECT_ID('products', 'U') IS NULL
            BEGIN
                CREATE TABLE products (
                    id INT IDENTITY(1,1) PRIMARY KEY, // Автоинкрементный первичный ключ
                    name VARCHAR(100), // Название продукта
                    price DECIMAL(10, 2), // Цена продукта
                    stock INT // Количество на складе
                );
                
                // Добавление тестовых данных
                INSERT INTO products (name, price, stock) VALUES
                ('Laptop', 999.99, 10),
                ('Mouse', 29.99, 50),
                ('Keyboard', 59.99, 30);
            END
        `);
        console.log('Table products ready');
        return true;
    } catch (error) {
        // Обработка ошибок подключения
        console.error('Connection error:', error.message);
        return false;
    }
}

// Создание HTTP сервера
const server = http.createServer((req, res) => {
    // Парсинг URL для извлечения пути и параметров
    const url = new URL(req.url, `http://${req.headers.host}`);

    // Обработка POST запроса для добавления продукта
    if (req.method === 'POST' && url.pathname === '/products') {
        let body = '';
        // Сбор данных тела запроса
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                // Парсинг JSON из тела запроса
                const { name, price, stock } = JSON.parse(body);
                
                // Проверка наличия обязательных полей
                if (!name || price === undefined || stock === undefined) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Fields required: name, price, stock' }));
                    return;
                }

                // Выполнение INSERT запроса с параметрами
                const result = await pool.request()
                    .input('name', sql.VarChar, name) // Параметр имени
                    .input('price', sql.Decimal(10, 2), price) // Параметр цены
                    .input('stock', sql.Int, stock) // Параметр количества
                    .query(`
                        INSERT INTO products (name, price, stock) 
                        OUTPUT INSERTED.* // Возврат вставленной записи
                        VALUES (@name, @price, @stock)
                    `);

                // Отправка успешного ответа с созданным продуктом
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result.recordset[0]));
            } catch (error) {
                // Обработка ошибок запроса
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });
    }
    // Обработка GET запроса для получения списка продуктов
    else if (req.method === 'GET' && url.pathname === '/products') {
        // Использование IIFE для асинхронной обработки
        (async () => {
            try {
                // Выполнение SELECT запроса для получения всех продуктов
                const result = await pool.request().query('SELECT * FROM products ORDER BY id');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result.recordset));
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
        // Отправка HTML страницы с формой добавления продукта
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>SQL INSERT Demo</title>
                <style>
                    body { font-family: Arial; padding: 20px; }
                    input, button { margin: 5px; padding: 5px; }
                </style>
            </head>
            <body>
                <h1>Add Product (POST/INSERT)</h1>
                <div>
                    <input type="text" id="name" placeholder="Product name">
                    <input type="number" id="price" placeholder="Price">
                    <input type="number" id="stock" placeholder="Stock">
                    <button onclick="addProduct()">Add Product</button>
                </div>
                <div id="products">
                    <h2>Products:</h2>
                    <div id="productList"></div>
                </div>
                <script>
                    // Функция для загрузки списка продуктов
                    function loadProducts() {
                        fetch('/products')
                            .then(res => res.json())
                            .then(data => {
                                document.getElementById('productList').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                            });
                    }
                    
                    // Функция для добавления нового продукта
                    function addProduct() {
                        const name = document.getElementById('name').value;
                        const price = parseFloat(document.getElementById('price').value);
                        const stock = parseInt(document.getElementById('stock').value);
                        
                        // Отправка POST запроса для добавления продукта
                        fetch('/products', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name, price, stock })
                        })
                        .then(res => res.json())
                        .then(data => {
                            // Обновление списка продуктов после добавления
                            loadProducts();
                            // Очистка полей формы
                            document.getElementById('name').value = '';
                            document.getElementById('price').value = '';
                            document.getElementById('stock').value = '';
                        });
                    }
                    
                    // Загрузка продуктов при загрузке страницы
                    loadProducts();
                </script>
            </body>
            </html>
        `);
    }
});

// Подключение к базе данных и запуск сервера
connectDB().then(success => {
    if (success) {
        server.listen(3000, () => {
            console.log('Server on http://localhost:3000');
            console.log('POST /products - add product');
        });
    }
});