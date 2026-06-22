// websocket_json.js
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

// Типы сообщений
const MessageType = {
    CHAT: 'chat',
    STATUS: 'status',
    COMMAND: 'command',
    ERROR: 'error',
    PING: 'ping',
    PONG: 'pong'
};

class JSONWebSocketServer {
    constructor(wss) {
        this.wss = wss;
        this.clients = new Map();
        this.setupHandlers();
    }
    
    setupHandlers() {
        this.wss.on('connection', (ws) => {
            const clientId = Date.now().toString(36) + Math.random().toString(36).substr(2);
            this.clients.set(ws, { id: clientId, name: `User_${clientId.substr(0, 5)}` });
            
            console.log(`Клиент подключен: ${clientId}`);
            
            // Отправка приветствия в JSON формате
            this.sendJSON(ws, {
                type: MessageType.STATUS,
                data: { status: 'connected', clientId: clientId },
                timestamp: new Date().toISOString()
            });
            
            ws.on('message', (data) => {
                try {
                    const json = JSON.parse(data.toString());
                    this.handleJSONMessage(ws, json);
                } catch (e) {
                    this.sendJSON(ws, {
                        type: MessageType.ERROR,
                        data: { error: 'Invalid JSON format' },
                        timestamp: new Date().toISOString()
                    });
                }
            });
            
            ws.on('close', () => {
                const client = this.clients.get(ws);
                console.log(`Клиент отключен: ${client?.id}`);
                this.clients.delete(ws);
                
                // Уведомление других клиентов
                this.broadcast({
                    type: MessageType.STATUS,
                    data: { status: 'disconnected', clientId: client?.id },
                    timestamp: new Date().toISOString()
                }, ws);
            });
        });
    }
    
    handleJSONMessage(ws, json) {
        const client = this.clients.get(ws);
        
        switch (json.type) {
            case MessageType.CHAT:
                console.log(`[CHAT] ${client?.name}: ${json.data?.message}`);
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
                this.handleCommand(ws, json);
                break;
                
            case MessageType.PING:
                this.sendJSON(ws, {
                    type: MessageType.PONG,
                    data: { time: new Date().toISOString() },
                    timestamp: new Date().toISOString()
                });
                break;
                
            default:
                this.sendJSON(ws, {
                    type: MessageType.ERROR,
                    data: { error: `Unknown message type: ${json.type}` },
                    timestamp: new Date().toISOString()
                });
        }
    }
    
    handleCommand(ws, json) {
        const client = this.clients.get(ws);
        
        switch (json.data?.command) {
            case 'setName':
                client.name = json.data?.name;
                this.sendJSON(ws, {
                    type: MessageType.STATUS,
                    data: { status: 'name_changed', newName: client.name },
                    timestamp: new Date().toISOString()
                });
                break;
                
            case 'clients':
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
    
    sendJSON(ws, data) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(data));
        }
    }
    
    broadcast(data, excludeWs = null) {
        this.clients.forEach((_, client) => {
            if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
                this.sendJSON(client, data);
            }
        });
    }
}

// Запуск сервера
const jsonServer = new JSONWebSocketServer(wss);

// HTTP сервер для клиента
const http = require('http');
const server = http.createServer((req, res) => {
    if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
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
                        ws = new WebSocket('ws://localhost:8080');
                        
                        ws.onmessage = (event) => {
                            const json = JSON.parse(event.data);
                            handleMessage(json);
                        };
                        
                        ws.onopen = () => {
                            addMessage('System', 'Подключено', 'status');
                        };
                        
                        ws.onclose = () => {
                            addMessage('System', 'Отключено', 'error');
                        };
                    }
                    
                    function handleMessage(json) {
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
                        if (ws && ws.readyState === WebSocket.OPEN) {
                            ws.send(JSON.stringify({ type: 'ping', data: {} }));
                            addMessage('Client', 'Ping отправлен', 'status');
                        }
                    }
                    
                    function getClients() {
                        if (ws && ws.readyState === WebSocket.OPEN) {
                            ws.send(JSON.stringify({
                                type: 'command',
                                data: { command: 'clients' }
                            }));
                        }
                    }
                    
                    function addMessage(sender, text, className) {
                        const messages = document.getElementById('messages');
                        const div = document.createElement('div');
                        div.className = className || '';
                        div.innerHTML = \`[\${new Date().toLocaleTimeString()}] <strong>\${sender}:</strong> \${text}\`;
                        messages.appendChild(div);
                        messages.scrollTop = messages.scrollHeight;
                    }
                    
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
    console.log('JSON WebSocket сервер на ws://localhost:8080');
    console.log('HTTP клиент на http://localhost:3000');
});