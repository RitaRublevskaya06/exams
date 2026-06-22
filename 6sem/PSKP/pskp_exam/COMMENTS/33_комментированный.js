// Импорт модуля http для создания HTTP сервера
const http = require('http');
// Импорт модуля ws для работы с WebSocket
const WebSocket = require('ws');

// Создание HTTP сервера
const server = http.createServer((req, res) => {
    // Обработка запроса для главной страницы
    if (req.url === '/') {
        // Установка заголовков для HTML ответа
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        // Отправка HTML страницы с WebSocket клиентом
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>WebSocket Demo</title>
                <style>
                    body { font-family: Arial; padding: 20px; }
                    #messages { border: 1px solid #ccc; height: 300px; overflow-y: scroll; padding: 10px; margin-bottom: 10px; }
                    #messageInput { width: 80%; padding: 5px; }
                    button { padding: 5px 15px; }
                    .status { margin-bottom: 10px; padding: 5px; border-radius: 3px; }
                    .connected { background: #d4edda; color: #155724; }
                    .disconnected { background: #f8d7da; color: #721c24; }
                </style>
            </head>
            <body>
                <h1>WebSocket Простейшее приложение</h1>
                <div id="status" class="status disconnected">Отключено</div>
                <div id="messages"></div>
                <input type="text" id="messageInput" placeholder="Введите сообщение...">
                <button onclick="sendMessage()">Отправить</button>
                <button onclick="connect()">Подключиться</button>
                <button onclick="disconnect()">Отключиться</button>
                
                <script>
                    let ws = null;
                    
                    function connect() {
                        // Создание WebSocket соединения
                        ws = new WebSocket('ws://localhost:8080');
                        
                        // Обработка открытия соединения
                        ws.onopen = function() {
                            document.getElementById('status').className = 'status connected';
                            document.getElementById('status').textContent = 'Подключено';
                            addMessage('System', 'Подключено к серверу');
                        };
                        
                        // Обработка получения сообщений
                        ws.onmessage = function(event) {
                            addMessage('Server', event.data);
                        };
                        
                        // Обработка закрытия соединения
                        ws.onclose = function() {
                            document.getElementById('status').className = 'status disconnected';
                            document.getElementById('status').textContent = 'Отключено';
                            addMessage('System', 'Отключено от сервера');
                        };
                        
                        // Обработка ошибок соединения
                        ws.onerror = function(error) {
                            addMessage('Error', 'Ошибка соединения');
                        };
                    }
                    
                    function disconnect() {
                        // Закрытие WebSocket соединения
                        if (ws) {
                            ws.close();
                            ws = null;
                        }
                    }
                    
                    function sendMessage() {
                        // Отправка сообщения через WebSocket
                        if (ws && ws.readyState === WebSocket.OPEN) {
                            const input = document.getElementById('messageInput');
                            ws.send(input.value);
                            addMessage('You', input.value);
                            input.value = '';
                        } else {
                            alert('WebSocket не подключен');
                        }
                    }
                    
                    function addMessage(sender, text) {
                        // Добавление сообщения в интерфейс
                        const messages = document.getElementById('messages');
                        const div = document.createElement('div');
                        div.innerHTML = \`<strong>\${sender}:</strong> \${text}\`;
                        messages.appendChild(div);
                        messages.scrollTop = messages.scrollHeight;
                    }
                </script>
            </body>
            </html>
        `);
    } else {
        // Обработка всех других запросов
        res.writeHead(404);
        res.end();
    }
});

// Создание WebSocket сервера на порту 8080
const wss = new WebSocket.Server({ port: 8080 });

// Обработка подключения WebSocket клиентов
wss.on('connection', (ws) => {
    // Вывод сообщения о подключении клиента
    console.log('Клиент подключился');
    // Отправка приветственного сообщения клиенту
    ws.send('Добро пожаловать!');
    
    // Обработка получения сообщений от клиента
    ws.on('message', (message) => {
        // Вывод полученного сообщения
        console.log('Получено:', message.toString());
        // Отправка эхо-ответа клиенту
        ws.send(`Эхо: ${message}`);
    });
    
    // Обработка отключения клиента
    ws.on('close', () => {
        console.log('Клиент отключился');
    });
});

// Запуск HTTP сервера на порту 3000
server.listen(3000, () => {
    console.log('HTTP сервер на http://localhost:3000');
    console.log('WebSocket сервер на ws://localhost:8080');
});