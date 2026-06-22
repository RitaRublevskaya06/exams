// websocket_browser_server.js
const http = require('http');
const WebSocket = require('ws');

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
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
                        ws = new WebSocket('ws://localhost:8080');
                        
                        ws.onopen = function() {
                            document.getElementById('status').className = 'status connected';
                            document.getElementById('status').textContent = 'Подключено';
                            addMessage('System', 'Подключено к серверу');
                        };
                        
                        ws.onmessage = function(event) {
                            addMessage('Server', event.data);
                        };
                        
                        ws.onclose = function() {
                            document.getElementById('status').className = 'status disconnected';
                            document.getElementById('status').textContent = 'Отключено';
                            addMessage('System', 'Отключено от сервера');
                        };
                        
                        ws.onerror = function(error) {
                            addMessage('Error', 'Ошибка соединения');
                        };
                    }
                    
                    function disconnect() {
                        if (ws) {
                            ws.close();
                            ws = null;
                        }
                    }
                    
                    function sendMessage() {
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
        res.writeHead(404);
        res.end();
    }
});

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('Клиент подключился');
    ws.send('Добро пожаловать!');
    
    ws.on('message', (message) => {
        console.log('Получено:', message.toString());
        ws.send(`Эхо: ${message}`);
    });
    
    ws.on('close', () => {
        console.log('Клиент отключился');
    });
});

server.listen(3000, () => {
    console.log('HTTP сервер на http://localhost:3000');
    console.log('WebSocket сервер на ws://localhost:8080');
});