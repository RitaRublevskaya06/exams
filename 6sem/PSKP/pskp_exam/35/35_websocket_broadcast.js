// websocket_broadcast.js
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
const clients = new Set();

// Широковещательный сервер
wss.on('connection', (ws) => {
    clients.add(ws);
    console.log(`Клиент подключился. Всего клиентов: ${clients.size}`);
    
    // Рассылка всем о новом пользователе
    broadcast(`Пользователь подключился (всего: ${clients.size})`, ws);
    
    ws.on('message', (message) => {
        const msgString = message.toString();
        console.log(`Сообщение от клиента: ${msgString}`);
        
        // Рассылка сообщения всем клиентам
        broadcast(`Сообщение: ${msgString}`, ws);
    });
    
    ws.on('close', () => {
        clients.delete(ws);
        console.log(`Клиент отключился. Всего клиентов: ${clients.size}`);
        broadcast(`Пользователь отключился (осталось: ${clients.size})`);
    });
});

function broadcast(message, sender = null) {
    clients.forEach(client => {
        if (client !== sender && client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

// HTTP сервер для тестового клиента
const http = require('http');
const server = http.createServer((req, res) => {
    if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
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
                    let username = "User_" + Math.floor(Math.random() * 1000);
                    
                    function connect() {
                        ws = new WebSocket('ws://localhost:8080');
                        
                        ws.onopen = () => {
                            addMessage('System', 'Подключено к чату', 'system-msg');
                        };
                        
                        ws.onmessage = (event) => {
                            addMessage('Chat', event.data, 'user-msg');
                        };
                        
                        ws.onclose = () => {
                            addMessage('System', 'Отключено от чата', 'system-msg');
                        };
                    }
                    
                    function disconnect() {
                        if (ws) ws.close();
                        ws = null;
                    }
                    
                    function sendMsg() {
                        if (ws && ws.readyState === WebSocket.OPEN) {
                            const input = document.getElementById('msgInput');
                            ws.send(\`[\${username}] \${input.value}\`);
                            input.value = '';
                        } else {
                            alert('Не подключено к серверу');
                        }
                    }
                    
                    function addMessage(sender, text, className) {
                        const messages = document.getElementById('messages');
                        const div = document.createElement('div');
                        div.className = className || '';
                        div.innerHTML = \`[\${new Date().toLocaleTimeString()}] \${text}\`;
                        messages.appendChild(div);
                        messages.scrollTop = messages.scrollHeight;
                    }
                    
                    // Автоматическое подключение
                    connect();
                </script>
            </body>
            </html>
        `);
    } else {
        res.writeHead(404);
        res.end();
    }
});

server.listen(3000, () => {
    console.log('WebSocket сервер на ws://localhost:8080');
    console.log('HTTP сервер на http://localhost:3000');
    console.log('Откройте несколько вкладок браузера для тестирования широковещания');
});