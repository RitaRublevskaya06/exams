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
const server = http.createServer((req, res) => {
    // Парсинг URL для извлечения пути и параметров
    const url = new URL(req.url, `http://${req.headers.host}`);

    // Обработка DELETE запроса для удаления пользователя по ID
    if (req.method === 'DELETE' && /^\/users\/\d+$/.test(url.pathname)) {
        // Извлечение ID пользователя из URL
        const id = parseInt(url.pathname.split('/')[2]);
        // Использование IIFE для асинхронной обработки
        (async () => {
            try {
                // Выполнение DELETE запроса с возвратом удаленной записи
                const result = await pool.request()
                    .input('id', sql.Int, id) // Параметр ID
                    .query('DELETE FROM users OUTPUT DELETED.* WHERE id = @id');
                
                // Проверка, был ли пользователь найден и удален
                if (result.recordset.length === 0) {
                    // Пользователь не найден
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'User not found' }));
                } else {
                    // Успешное удаление
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(result.recordset[0]));
                }
            } catch (error) {
                // Обработка ошибок выполнения запроса
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        })();
    }
    // Обработка DELETE запроса для удаления всех пользователей
    else if (req.method === 'DELETE' && url.pathname === '/users') {
        // Проверка параметра подтверждения для защиты от случайного удаления
        const confirm = url.searchParams.get('confirm');
        if (confirm !== 'true') {
            // Требуется подтверждение
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Use confirm=true to delete all users' }));
            return;
        }
        // Использование IIFE для асинхронной обработки
        (async () => {
            try {
                // Выполнение DELETE запроса без условия (удаление всех записей)
                const result = await pool.request().query('DELETE FROM users');
                // Отправка успешного ответа с количеством удаленных записей
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, deletedCount: result.rowsAffected[0] }));
            } catch (error) {
                // Обработка ошибок выполнения запроса
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        })();
    }
    // Обработка POST запроса для добавления пользователя
    else if (req.method === 'POST' && url.pathname === '/users') {
        let body = '';
        // Сбор данных тела запроса
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                // Парсинг JSON из тела запроса
                const { name, email } = JSON.parse(body);
                // Выполнение INSERT запроса с параметрами
                const result = await pool.request()
                    .input('name', sql.VarChar, name) // Параметр имени
                    .input('email', sql.VarChar, email) // Параметр email
                    .query('INSERT INTO users (name, email) OUTPUT INSERTED.* VALUES (@name, @email)');
                
                // Отправка успешного ответа с созданным пользователем
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result.recordset[0]));
            } catch (error) {
                // Обработка ошибок выполнения запроса
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });
    }
    // Обработка GET запроса для получения списка пользователей
    else if (req.method === 'GET' && url.pathname === '/users') {
        // Использование IIFE для асинхронной обработки
        (async () => {
            try {
                // Выполнение SELECT запроса для получения всех пользователей
                const result = await pool.request().query('SELECT * FROM users ORDER BY id');
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
        // Отправка HTML страницы с интерфейсом управления пользователями
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>SQL DELETE Demo</title>
                <style>
                    body { font-family: Arial; padding: 20px; }
                    .user { border: 1px solid #ccc; margin: 5px; padding: 10px; }
                    button.delete { background: #dc3545; color: white; border: none; padding: 5px 10px; cursor: pointer; }
                    button.delete-all { background: #ff9800; margin-top: 20px; }
                </style>
            </head>
            <body>
                <h1>Delete Users (DELETE)</h1>
                <div>
                    <input type="text" id="name" placeholder="Name">
                    <input type="email" id="email" placeholder="Email">
                    <button onclick="addUser()">Add</button>
                    <button onclick="deleteAll()" class="delete-all">Delete All</button>
                </div>
                <div id="users"></div>
                <script>
                    // Функция для загрузки списка пользователей
                    function loadUsers() {
                        fetch('/users')
                            .then(res => res.json())
                            .then(data => {
                                const container = document.getElementById('users');
                                if (data.length) {
                                    // Отображение пользователей с кнопками удаления
                                    container.innerHTML = data.map(u => \`
                                        <div class="user">
                                            <strong>\${u.name}</strong> (\${u.email})
                                            <button class="delete" onclick="deleteUser(\${u.id})">Delete</button>
                                        </div>
                                    \`).join('');
                                } else {
                                    container.innerHTML = '<p>No users</p>';
                                }
                            });
                    }
                    
                    // Функция для добавления нового пользователя
                    function addUser() {
                        const name = document.getElementById('name').value;
                        const email = document.getElementById('email').value;
                        fetch('/users', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name, email })
                        }).then(() => {
                            // Обновление списка пользователей после добавления
                            loadUsers();
                            // Очистка полей формы
                            document.getElementById('name').value = '';
                            document.getElementById('email').value = '';
                        });
                    }
                    
                    // Функция для удаления пользователя по ID
                    function deleteUser(id) {
                        fetch(\`/users/\${id}\`, { method: 'DELETE' })
                            .then(() => loadUsers());
                    }
                    
                    // Функция для удаления всех пользователей с подтверждением
                    function deleteAll() {
                        if (confirm('Delete all users?')) {
                            fetch('/users?confirm=true', { method: 'DELETE' })
                                .then(() => loadUsers());
                        }
                    }
                    
                    // Загрузка пользователей при загрузке страницы
                    loadUsers();
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
            console.log('DELETE /users/1 - delete user');
            console.log('DELETE /users?confirm=true - delete all users');
        });
    }
});