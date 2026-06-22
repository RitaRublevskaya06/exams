// Импорт модуля ws для работы с WebSocket
const WebSocket = require('ws');

// Создание WebSocket сервера на порту 8080
const wss = new WebSocket.Server({ port: 8080 });
// Set для хранения подключенных клиентов
const clients = new Set();

// Широковещательный WebSocket сервер
wss.on('connection', (ws) => {
    // Добавление клиента в Set
    clients.add(ws);
    console.log(`Клиент подключился. Всего клиентов: ${clients.size}`);
    
    // Рассылка уведомления всем клиентам о новом подключении
    broadcast(`Пользователь подключился (всего: ${clients.size})`, ws);
    
    // Обработка получения сообщений от клиента
    ws.on('message', (message) => {
        const msgString = message.toString();
        console.log(`Сообщение от клиента: ${msgString}`);
        
        // Рассылка полученного сообщения всем клиентам
        broadcast(`Сообщение: ${msgString}`, ws);
    });
    
    // Обработка отключения клиента
    ws.on('close', () => {
        // Удаление клиента из Set
        clients.delete(ws);
        console.log(`Клиент отключился. Всего клиентов: ${clients.size}`);
        // Рассылка уведомления об отключении
        broadcast(`Пользователь отключился (осталось: ${clients.size})`);
    });
});

// Функция для широковещательной рассылки сообщений
function broadcast(message, sender = null) {
    // Перебор всех подключенных клиентов
    clients.forEach(client => {
        // Отправка сообщения всем клиентам, кроме отправителя
        if (client !== sender && client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

// Импорт модуля http для создания HTTP сервера
const http = require('http');
// Создание HTTP сервера для веб-клиента
const server = http.createServer((req, res) => {
    if (req.url === '/') {
        // Установка заголовков для HTML ответа
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        // Отправка HTML страницы с WebSocket клиентом
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Широковещательный WebSocket</title>
                <style>
                    body { font-family: monospace; padding: 20px; }
                    #messages { border: 1px solid #333; height: 400px; overflow-y: scroll; 
                               padding: 10px; background: #f5f5f5; font-family: monospace; }
                    .user-msg { color: #0066cc; }
                    .system-msg { color: #666; font-style: italic; }
                    input { width: 70%; padding: 5px; }
                </style>
            </head>
            <body>
                <h1>Широковещательный чат</h1>
                <div id="messages"></div>
                <input type="text" id="msgInput" placeholder="Введите сообщение...">
                <button onclick="sendMsg()">Отправить</button>
                <button onclick="connect()">Подключиться</button>
                <button onclick="disconnect()">Отключиться</button>
                <p><small>Все сообщения видны всем подключенным клиентам</small></p>
                <script>
                    let ws = null;
                    // Генерация случайного имени пользователя
                    let username = "User_" + Math.floor(Math.random() * 1000);
                    
                    function connect() {
                        // Создание WebSocket соединения
                        ws = new WebSocket('ws://localhost:8080');
                        
                        // Обработка открытия соединения
                        ws.onopen = () => {
                            addMessage('System', 'Подключено к чату', 'system-msg');
                        };
                        
                        // Обработка получения сообщений
                        ws.onmessage = (event) => {
                            addMessage('Chat', event.data, 'user-msg');
                        };
                        
                        // Обработка закрытия соединения
                        ws.onclose = () => {
                            addMessage('System', 'Отключено от чата', 'system-msg');
                        };
                    }
                    
                    function disconnect() {
                        // Закрытие WebSocket соединения
                        if (ws) ws.close();
                        ws = null;
                    }
                    
                    function sendMsg() {
                        // Отправка сообщения через WebSocket
                        if (ws && ws.readyState === WebSocket.OPEN) {
                            const input = document.getElementById('msgInput');
                            ws.send(\`[\${username}] \${input.value}\`);
                            input.value = '';
                        } else {
                            alert('Не подключено к серверу');
                        }
                    }
                    
                    function addMessage(sender, text, className) {
                        // Добавление сообщения в интерфейс
                        const messages = document.getElementById('messages');
                        const div = document.createElement('div');
                        div.className = className || '';
                        div.innerHTML = \`[\${new Date().toLocaleTimeString()}] \${text}\`;
                        messages.appendChild(div);
                        messages.scrollTop = messages.scrollHeight;
                    }
                    
                    // Автоматическое подключение при загрузке страницы
                    connect();
                </script>
            </body>
            </html>
        `);
    } else {
        // Обработка других URL
        res.writeHead(404);
        res.end();
    }
});

// Запуск HTTP сервера на порту 3000
server.listen(3000, () => {
    console.log('WebSocket сервер на ws://localhost:8080');
    console.log('HTTP сервер на http://localhost:3000');
    console.log('Откройте несколько вкладок браузера для тестирования широковещания');
});