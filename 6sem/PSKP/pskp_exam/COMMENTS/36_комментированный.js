// Импорт модуля ws для работы с WebSocket
const WebSocket = require('ws');

// Создание WebSocket сервера на порту 8080
const wss = new WebSocket.Server({ port: 8080 });

// Определение типов сообщений для структурированного обмена данными
const MessageType = {
    CHAT: 'chat', // Тип для сообщений чата
    STATUS: 'status', // Тип для статусных сообщений
    COMMAND: 'command', // Тип для команд
    ERROR: 'error', // Тип для ошибок
    PING: 'ping', // Тип для ping сообщений
    PONG: 'pong' // Тип для pong ответов
};

// Класс для работы с JSON WebSocket сервером
class JSONWebSocketServer {
    constructor(wss) {
        // Сохранение экземпляра WebSocket сервера
        this.wss = wss;
        // Map для хранения подключенных клиентов
        this.clients = new Map();
        // Настройка обработчиков событий
        this.setupHandlers();
    }
    
    // Метод для настройки обработчиков событий
    setupHandlers() {
        // Обработка подключения новых клиентов
        this.wss.on('connection', (ws) => {
            // Генерация уникального ID для клиента
            const clientId = Date.now().toString(36) + Math.random().toString(36).substr(2);
            // Сохранение информации о клиенте
            this.clients.set(ws, { id: clientId, name: `User_${clientId.substr(0, 5)}` });
            
            console.log(`Клиент подключен: ${clientId}`);
            
            // Отправка приветственного сообщения в JSON формате
            this.sendJSON(ws, {
                type: MessageType.STATUS,
                data: { status: 'connected', clientId: clientId },
                timestamp: new Date().toISOString()
            });
            
            // Обработка получения сообщений от клиента
            ws.on('message', (data) => {
                try {
                    // Парсинг полученных данных как JSON
                    const json = JSON.parse(data.toString());
                    this.handleJSONMessage(ws, json);
                } catch (e) {
                    // Отправка ошибки в случае некорректного JSON
                    this.sendJSON(ws, {
                        type: MessageType.ERROR,
                        data: { error: 'Invalid JSON format' },
                        timestamp: new Date().toISOString()
                    });
                }
            });
            
            // Обработка отключения клиента
            ws.on('close', () => {
                const client = this.clients.get(ws);
                console.log(`Клиент отключен: ${client?.id}`);
                // Удаление клиента из Map
                this.clients.delete(ws);
                
                // Уведомление других клиентов об отключении
                this.broadcast({
                    type: MessageType.STATUS,
                    data: { status: 'disconnected', clientId: client?.id },
                    timestamp: new Date().toISOString()
                }, ws);
            });
        });
    }
    
    // Метод для обработки JSON сообщений
    handleJSONMessage(ws, json) {
        const client = this.clients.get(ws);
        
        // Обработка различных типов сообщений
        switch (json.type) {
            case MessageType.CHAT:
                // Обработка сообщений чата
                console.log(`[CHAT] ${client?.name}: ${json.data?.message}`);
                // Рассылка сообщения чата всем клиентам
                this.broadcast({
                    type: MessageType.CHAT,
                    data: {
                        from: client?.name,
                        message: json.data?.message,
                        clientId: client?.id
                    },
                    timestamp: new Date().toISOString()
                });
                break;
                
            case MessageType.COMMAND:
                // Обработка команд
                this.handleCommand(ws, json);
                break;
                
            case MessageType.PING:
                // Обработка ping сообщений
                this.sendJSON(ws, {
                    type: MessageType.PONG,
                    data: { time: new Date().toISOString() },
                    timestamp: new Date().toISOString()
                });
                break;
                
            default:
                // Обработка неизвестных типов сообщений
                this.sendJSON(ws, {
                    type: MessageType.ERROR,
                    data: { error: `Unknown message type: ${json.type}` },
                    timestamp: new Date().toISOString()
                });
        }
    }
    
    // Метод для обработки команд
    handleCommand(ws, json) {
        const client = this.clients.get(ws);
        
        switch (json.data?.command) {
            case 'setName':
                // Команда для изменения имени пользователя
                client.name = json.data?.name;
                this.sendJSON(ws, {
                    type: MessageType.STATUS,
                    data: { status: 'name_changed', newName: client.name },
                    timestamp: new Date().toISOString()
                });
                break;
                
            case 'clients':
                // Команда для получения списка подключенных клиентов
                const clientList = Array.from(this.clients.values()).map(c => ({
                    id: c.id,
                    name: c.name
                }));
                this.sendJSON(ws, {
                    type: MessageType.STATUS,
                    data: { clients: clientList, count: clientList.length },
                    timestamp: new Date().toISOString()
                });
                break;
        }
    }
    
    // Метод для отправки JSON данных клиенту
    sendJSON(ws, data) {
        // Проверка, что соединение открыто
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(data));
        }
    }
    
    // Метод для широковещательной рассылки сообщений
    broadcast(data, excludeWs = null) {
        this.clients.forEach((_, client) => {
            // Рассылка всем клиентам, кроме указанного (если есть)
            if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
                this.sendJSON(client, data);
            }
        });
    }
}

// Запуск JSON WebSocket сервера
const jsonServer = new JSONWebSocketServer(wss);

// Создание HTTP сервера для веб-клиента
const http = require('http');
const server = http.createServer((req, res) => {
    if (req.url === '/') {
        // Установка заголовков для HTML ответа
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        // Отправка HTML страницы с WebSocket клиентом
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>WebSocket JSON</title>
                <style>
                    body { font-family: monospace; padding: 20px; }
                    #messages { border: 1px solid #333; height: 400px; overflow-y: scroll; 
                               padding: 10px; background: #f5f5f5; }
                    .chat { color: #0066cc; }
                    .status { color: #28a745; font-style: italic; }
                    .error { color: #dc3545; }
                    input { width: 60%; padding: 5px; }
                </style>
            </head>
            <body>
                <h1>WebSocket JSON Сообщения</h1>
                <div id="messages"></div>
                <input type="text" id="msgInput" placeholder="Введите сообщение...">
                <button onclick="sendChat()">Отправить</button>
                <button onclick="sendPing()">Ping</button>
                <button onclick="getClients()">Список клиентов</button>
                <script>
                    let ws = null;
                    
                    function connect() {
                        // Создание WebSocket соединения
                        ws = new WebSocket('ws://localhost:8080');
                        
                        // Обработка получения сообщений
                        ws.onmessage = (event) => {
                            const json = JSON.parse(event.data);
                            handleMessage(json);
                        };
                        
                        // Обработка открытия соединения
                        ws.onopen = () => {
                            addMessage('System', 'Подключено', 'status');
                        };
                        
                        // Обработка закрытия соединения
                        ws.onclose = () => {
                            addMessage('System', 'Отключено', 'error');
                        };
                    }
                    
                    function handleMessage(json) {
                        // Обработка различных типов сообщений
                        switch(json.type) {
                            case 'chat':
                                addMessage(json.data.from, json.data.message, 'chat');
                                break;
                            case 'status':
                                addMessage('Status', JSON.stringify(json.data), 'status');
                                break;
                            case 'error':
                                addMessage('Error', json.data.error, 'error');
                                break;
                            case 'pong':
                                addMessage('Pong', new Date(json.data.time).toLocaleTimeString(), 'status');
                                break;
                        }
                    }
                    
                    function sendChat() {
                        // Отправка сообщения чата
                        if (ws && ws.readyState === WebSocket.OPEN) {
                            const input = document.getElementById('msgInput');
                            ws.send(JSON.stringify({
                                type: 'chat',
                                data: { message: input.value }
                            }));
                            input.value = '';
                        }
                    }
                    
                    function sendPing() {
                        // Отправка ping сообщения
                        if (ws && ws.readyState === WebSocket.OPEN) {
                            ws.send(JSON.stringify({ type: 'ping', data: {} }));
                            addMessage('Client', 'Ping отправлен', 'status');
                        }
                    }
                    
                    function getClients() {
                        // Запрос списка клиентов
                        if (ws && ws.readyState === WebSocket.OPEN) {
                            ws.send(JSON.stringify({
                                type: 'command',
                                data: { command: 'clients' }
                            }));
                        }
                    }
                    
                    function addMessage(sender, text, className) {
                        // Добавление сообщения в интерфейс
                        const messages = document.getElementById('messages');
                        const div = document.createElement('div');
                        div.className = className || '';
                        div.innerHTML = \`[\${new Date().toLocaleTimeString()}] <strong>\${sender}:</strong> \${text}\`;
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
    console.log('JSON WebSocket сервер на ws://localhost:8080');
    console.log('HTTP клиент на http://localhost:3000');
});