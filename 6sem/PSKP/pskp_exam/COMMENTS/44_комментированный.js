// Импорт модуля http для создания HTTP сервера
const http = require('http');
// Импорт модуля redis для работы с Redis
const redis = require('redis');

// Создание клиента Redis с конфигурацией подключения
const client = redis.createClient({
    host: 'localhost', // Хост Redis сервера
    port: 6379 // Порт Redis сервера
});

// Обработка ошибок Redis
client.on('error', (err) => console.error('Redis error:', err));
// Обработка успешного подключения
client.on('connect', () => console.log('Connected to Redis'));

// Создание промисов для работы с асинхронными функциями Redis
const { promisify } = require('util');
const getAsync = promisify(client.get).bind(client); // Асинхронная версия get
const setAsync = promisify(client.set).bind(client); // Асинхронная версия set
const setExAsync = promisify(client.setex).bind(client); // Асинхронная версия setex (с TTL)
const delAsync = promisify(client.del).bind(client); // Асинхронная версия del
const incrByAsync = promisify(client.incrby).bind(client); // Асинхронная версия incrby
const keysAsync = promisify(client.keys).bind(client); // Асинхронная версия keys

// Создание HTTP сервера
const server = http.createServer(async (req, res) => {
    // Парсинг URL для извлечения пути
    const url = new URL(req.url, `http://${req.headers.host}`);
    
    // Обработка GET запроса для получения значения по ключу
    if (req.method === 'GET' && url.pathname.match(/^\/get\/.+/)) {
        // Извлечение ключа из URL
        const key = url.pathname.split('/')[2];
        try {
            // Асинхронное получение значения из Redis
            const value = await getAsync(key);
            if (value === null) {
                // Ключ не найден
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Key not found' }));
            } else {
                // Успешное получение значения
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ key, value }));
            }
        } catch (error) {
            // Обработка ошибок Redis
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    }
    // Обработка POST запроса для установки значения
    else if (req.method === 'POST' && url.pathname === '/set') {
        let body = '';
        // Сбор данных тела запроса
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
            try {
                // Парсинг JSON из тела запроса
                const { key, value, ttl } = JSON.parse(body);
                if (ttl) {
                    // Установка значения с временем жизни (TTL)
                    await setExAsync(key, ttl, String(value));
                } else {
                    // Установка значения без TTL
                    await setAsync(key, String(value));
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, key, value, ttl: ttl || null }));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });
    }
    // Обработка DELETE запроса для удаления ключа
    else if (req.method === 'DELETE' && url.pathname.match(/^\/del\/.+/)) {
        const key = url.pathname.split('/')[2];
        try {
            // Удаление ключа из Redis
            const deleted = await delAsync(key);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, deleted, key }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    }
    // Обработка POST запроса для увеличения числового значения
    else if (req.method === 'POST' && url.pathname === '/incr') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
            try {
                const { key, by = 1 } = JSON.parse(body);
                // Увеличение числового значения на указанную величину
                const newValue = await incrByAsync(key, by);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, key, newValue }));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });
    }
    // Обработка GET запроса для получения всех ключей
    else if (req.method === 'GET' && url.pathname === '/keys') {
        try {
            // Получение всех ключей из Redis
            const keys = await keysAsync('*');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ keys }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    }
    // Обработка всех других запросов (главная страница)
    else {
        // Установка заголовков для HTML ответа
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        // Отправка HTML страницы с интерфейсом работы с Redis
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Redis Demo</title>
                <style>
                    body { font-family: Arial; padding: 20px; }
                    input, button { margin: 5px; padding: 5px; }
                    .result { border: 1px solid #ccc; padding: 10px; margin-top: 20px; }
                </style>
            </head>
            <body>
                <h1>Redis CRUD Operations</h1>
                <div>
                    <h3>Set value</h3>
                    <input type="text" id="setKey" placeholder="Key">
                    <input type="text" id="setValue" placeholder="Value">
                    <input type="number" id="setTTL" placeholder="TTL (sec)">
                    <button onclick="setValue()">Set</button>
                </div>
                <div>
                    <h3>Get value</h3>
                    <input type="text" id="getKey" placeholder="Key">
                    <button onclick="getValue()">Get</button>
                </div>
                <div>
                    <h3>Delete</h3>
                    <input type="text" id="delKey" placeholder="Key">
                    <button onclick="deleteKey()">Delete</button>
                </div>
                <div>
                    <h3>Increment</h3>
                    <input type="text" id="incrKey" placeholder="Key">
                    <input type="number" id="incrBy" placeholder="By" value="1">
                    <button onclick="increment()">Increment</button>
                </div>
                <div id="result" class="result"></div>
                <script>
                    // Функция для установки значения в Redis
                    function setValue() {
                        const key = document.getElementById('setKey').value;
                        const value = document.getElementById('setValue').value;
                        const ttl = parseInt(document.getElementById('setTTL').value);
                        fetch('/set', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ key, value, ttl: ttl || undefined })
                        })
                        .then(res => res.json())
                        .then(data => showResult(data));
                    }
                    
                    // Функция для получения значения из Redis
                    function getValue() {
                        const key = document.getElementById('getKey').value;
                        fetch(\`/get/\${key}\`)
                            .then(res => res.json())
                            .then(data => showResult(data));
                    }
                    
                    // Функция для удаления ключа из Redis
                    function deleteKey() {
                        const key = document.getElementById('delKey').value;
                        fetch(\`/del/\${key}\`, { method: 'DELETE' })
                            .then(res => res.json())
                            .then(data => showResult(data));
                    }
                    
                    // Функция для увеличения числового значения в Redis
                    function increment() {
                        const key = document.getElementById('incrKey').value;
                        const by = parseInt(document.getElementById('incrBy').value);
                        fetch('/incr', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ key, by })
                        })
                        .then(res => res.json())
                        .then(data => showResult(data));
                    }
                    
                    // Функция для отображения результатов
                    function showResult(data) {
                        document.getElementById('result').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                    }
                </script>
            </body>
            </html>
        `);
    }
});

// Запуск сервера после подключения к Redis
client.on('ready', () => {
    server.listen(3000, () => {
        console.log('Redis server on http://localhost:3000');
        console.log('GET /get/:key - get value');
        console.log('POST /set - set value');
        console.log('DELETE /del/:key - delete key');
        console.log('POST /incr - increment value');
        console.log('GET /keys - get all keys');
    });
});

// Обработка ошибок подключения к Redis
client.on('error', (err) => {
    console.error('Redis connection error:', err.message);
    console.log('Make sure Redis is running:');
    console.log('  D:');
    console.log('  cd D:\\Programs\\Redis\\');
    console.log('  redis-server.exe');
});