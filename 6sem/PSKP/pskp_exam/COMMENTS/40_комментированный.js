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

    // Обработка PUT запроса для обновления продукта по ID
    if (req.method === 'PUT' && /^\/products\/\d+$/.test(url.pathname)) {
        // Извлечение ID продукта из URL
        const id = parseInt(url.pathname.split('/')[2]);
        let body = '';
        // Сбор данных тела запроса
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                // Парсинг JSON из тела запроса
                const updates = JSON.parse(body);
                const fields = []; // Массив для хранения обновляемых полей
                const values = []; // Массив для хранения значений параметров
                let paramIndex = 1; // Счетчик для генерации имен параметров

                // Проверка и добавление поля name для обновления
                if (updates.name !== undefined) {
                    fields.push(`name = @p${paramIndex}`);
                    values.push({ name: `p${paramIndex}`, value: updates.name });
                    paramIndex++;
                }
                // Проверка и добавление поля price для обновления
                if (updates.price !== undefined) {
                    fields.push(`price = @p${paramIndex}`);
                    values.push({ name: `p${paramIndex}`, value: updates.price });
                    paramIndex++;
                }
                // Проверка и добавление поля stock для обновления
                if (updates.stock !== undefined) {
                    fields.push(`stock = @p${paramIndex}`);
                    values.push({ name: `p${paramIndex}`, value: updates.stock });
                    paramIndex++;
                }

                // Проверка наличия полей для обновления
                if (fields.length === 0) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'No fields to update' }));
                    return;
                }

                // Создание объекта запроса с параметрами
                let request = pool.request();
                values.forEach(v => {
                    request = request.input(v.name, v.value);
                });
                // Добавление параметра ID
                request = request.input('id', sql.Int, id);

                // Формирование и выполнение UPDATE запроса
                const query = `UPDATE products SET ${fields.join(', ')} OUTPUT INSERTED.* WHERE id = @id`;
                const result = await request.query(query);

                // Проверка результата обновления
                if (result.recordset.length === 0) {
                    // Продукт не найден
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Product not found' }));
                } else {
                    // Успешное обновление
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(result.recordset[0]));
                }
            } catch (error) {
                // Обработка ошибок выполнения запроса
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
        // Отправка HTML страницы с интерфейсом обновления продуктов
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>SQL UPDATE Demo</title>
                <style>
                    body { font-family: Arial; padding: 20px; }
                    .product { border: 1px solid #ccc; margin: 10px; padding: 10px; }
                    input { margin: 5px; padding: 5px; }
                </style>
            </head>
            <body>
                <h1>Update Product (PUT/UPDATE)</h1>
                <div id="products"></div>
                <script>
                    // Функция для загрузки списка продуктов
                    function loadProducts() {
                        fetch('/products')
                            .then(res => res.json())
                            .then(data => {
                                const container = document.getElementById('products');
                                if (data.length === 0) {
                                    container.innerHTML = '<p>No products.</p>';
                                    return;
                                }
                                container.innerHTML = '<h2>Products:</h2>';
                                // Отображение каждого продукта с полями для редактирования
                                data.forEach(p => {
                                    container.innerHTML += \`
                                        <div class="product">
                                            <strong>\${p.name}</strong> - $\${p.price} - Stock: \${p.stock}
                                            <br>
                                            <input type="text" id="name_\${p.id}" placeholder="New name" value="\${p.name}">
                                            <input type="number" id="price_\${p.id}" placeholder="New price" value="\${p.price}">
                                            <input type="number" id="stock_\${p.id}" placeholder="New stock" value="\${p.stock}">
                                            <button onclick="updateProduct(\${p.id})">Update</button>
                                        </div>
                                    \`;
                                });
                            });
                    }
                    
                    // Функция для обновления продукта
                    function updateProduct(id) {
                        const name = document.getElementById(\`name_\${id}\`).value;
                        const price = parseFloat(document.getElementById(\`price_\${id}\`).value);
                        const stock = parseInt(document.getElementById(\`stock_\${id}\`).value);
                        
                        // Отправка PUT запроса для обновления продукта
                        fetch(\`/products/\${id}\`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name, price, stock })
                        })
                        .then(res => res.json())
                        .then(data => {
                            // Обновление списка продуктов после обновления
                            loadProducts();
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
            console.log('PUT /products/1 - update product');
        });
    }
});