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
        return true;
    } catch (error) {
        // Обработка ошибок подключения
        console.error('Connection error:', error.message);
        return false;
    }
}

// Создание HTTP сервера
const server = http.createServer(async (req, res) => {
    // Парсинг URL для извлечения пути и параметров запроса
    const url = new URL(req.url, `http://${req.headers.host}`);
    
    // Обработка GET запроса для получения всех пользователей
    if (req.method === 'GET' && url.pathname === '/users') {
        try {
            // Выполнение SELECT запроса для получения всех пользователей
            const result = await pool.request().query('SELECT * FROM users ORDER BY id');
            // Установка заголовков для JSON ответа
            res.writeHead(200, { 'Content-Type': 'application/json' });
            // Отправка данных пользователей в формате JSON
            res.end(JSON.stringify(result.recordset));
        } catch (error) {
            // Обработка ошибок выполнения запроса
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    }
    // Обработка GET запроса для получения пользователя по ID
    else if (req.method === 'GET' && /^\/users\/\d+$/.test(url.pathname)) {
        // Извлечение ID пользователя из URL
        const id = parseInt(url.pathname.split('/')[2]);
        try {
            // Выполнение SELECT запроса с параметром ID
            const result = await pool.request()
                .input('id', sql.Int, id) // Параметр ID
                .query('SELECT * FROM users WHERE id = @id');
            
            // Проверка наличия пользователя с указанным ID
            if (result.recordset.length === 0) {
                // Пользователь не найден
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'User not found' }));
            } else {
                // Успешное получение пользователя
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result.recordset[0]));
            }
        } catch (error) {
            // Обработка ошибок выполнения запроса
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    }
    // Обработка GET запроса для поиска пользователей по имени
    else if (req.method === 'GET' && url.pathname === '/users/search') {
        // Получение параметра name из query string
        const name = url.searchParams.get('name');
        // Проверка наличия параметра name
        if (!name) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Name parameter required' }));
            return;
        }
        try {
            // Выполнение SELECT запроса с поиском по части имени
            const result = await pool.request()
                .input('name', sql.VarChar, `%${name}%`) // Использование % для поиска по части имени
                .query('SELECT * FROM users WHERE name LIKE @name');
            // Установка заголовков для JSON ответа
            res.writeHead(200, { 'Content-Type': 'application/json' });
            // Отправка результатов поиска в формате JSON
            res.end(JSON.stringify(result.recordset));
        } catch (error) {
            // Обработка ошибок выполнения запроса
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    }
    // Обработка всех других запросов (главная страница)
    else {
        // Установка заголовков для HTML ответа
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        // Отправка HTML страницы с описанием доступных endpoints
        res.end(`
            <!DOCTYPE html>
            <html>
            <head><title>SQL SELECT Demo</title></head>
            <body>
                <h1>SQL Server SELECT Demo</h1>
                <h2>Endpoints:</h2>
                <ul>
                    <li>GET /users - all users</li>
                    <li>GET /users/1 - user by ID</li>
                    <li>GET /users/search?name=alice - search by name</li>
                </ul>
                <div id="users">Loading...</div>
                <script>
                    // Автоматическая загрузка списка пользователей при загрузке страницы
                    fetch('/users')
                        .then(res => res.json())
                        .then(data => {
                            document.getElementById('users').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                        });
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
            console.log('GET /users - all users');
            console.log('GET /users/1 - user by ID');
            console.log('GET /users/search?name= - search by name');
        });
    }
});