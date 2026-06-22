const http = require('http');
const redis = require('redis');

// Подключение к Redis (старый синтаксис)
const client = redis.createClient({
    host: 'localhost',
    port: 6379
});

client.on('error', (err) => console.error('Redis error:', err));
client.on('connect', () => console.log('Connected to Redis'));

// Промисы для старой версии
const { promisify } = require('util');
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);
const setExAsync = promisify(client.setex).bind(client);
const delAsync = promisify(client.del).bind(client);
const incrByAsync = promisify(client.incrby).bind(client);
const keysAsync = promisify(client.keys).bind(client);

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    
    if (req.method === 'GET' && url.pathname.match(/^\/get\/.+/)) {
        const key = url.pathname.split('/')[2];
        try {
            const value = await getAsync(key);
            if (value === null) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Key not found' }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ key, value }));
            }
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    }
    else if (req.method === 'POST' && url.pathname === '/set') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
            try {
                const { key, value, ttl } = JSON.parse(body);
                if (ttl) {
                    await setExAsync(key, ttl, String(value));
                } else {
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
    else if (req.method === 'DELETE' && url.pathname.match(/^\/del\/.+/)) {
        const key = url.pathname.split('/')[2];
        try {
            const deleted = await delAsync(key);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, deleted, key }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    }
    else if (req.method === 'POST' && url.pathname === '/incr') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
            try {
                const { key, by = 1 } = JSON.parse(body);
                const newValue = await incrByAsync(key, by);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, key, newValue }));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });
    }
    else if (req.method === 'GET' && url.pathname === '/keys') {
        try {
            const keys = await keysAsync('*');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ keys }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    }
    else {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
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
                    
                    function getValue() {
                        const key = document.getElementById('getKey').value;
                        fetch(\`/get/\${key}\`)
                            .then(res => res.json())
                            .then(data => showResult(data));
                    }
                    
                    function deleteKey() {
                        const key = document.getElementById('delKey').value;
                        fetch(\`/del/\${key}\`, { method: 'DELETE' })
                            .then(res => res.json())
                            .then(data => showResult(data));
                    }
                    
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
                    
                    function showResult(data) {
                        document.getElementById('result').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                    }
                </script>
            </body>
            </html>
        `);
    }
});

// Запуск сервера без await (старая версия)
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

// Если ошибка подключения
client.on('error', (err) => {
    console.error('Redis connection error:', err.message);
    console.log('Make sure Redis is running:');
    console.log('  D:');
    console.log('  cd D:\\Programs\\Redis\\');
    console.log('  redis-server.exe');
});